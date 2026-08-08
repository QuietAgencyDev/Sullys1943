import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { randomBytes } from "crypto";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma.service";
import {
  AuthGuard,
  COOKIE_NAME,
  CurrentUser,
  signToken,
  type AuthPayload,
} from "./auth.guard";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || "Member";
  const lastName = parts.slice(1).join(" ") || "Athlete";
  return { firstName, lastName };
}

function toAuthUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role ?? "member",
  };
}

@Controller("auth")
export class AuthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Post("register")
  async register(
    @Body()
    body: { name?: string; email?: string; password?: string; firstName?: string; lastName?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || password.length < 8) {
      throw new BadRequestException("Email and password (8+) required");
    }

    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException("Platform not seeded");

    const existing = await this.prisma.user.findUnique({
      where: { organizationId_email: { organizationId: org.id, email } },
    });
    if (existing) throw new BadRequestException("Email already registered");

    const names = body.firstName
      ? {
          firstName: body.firstName,
          lastName: body.lastName || "Athlete",
        }
      : splitName(body.name || "New Member");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        passwordHash,
        firstName: names.firstName,
        lastName: names.lastName,
        role: "member",
        points: { create: { balance: 0 } },
      },
    });

    // Auto-sign required liability packet if active template exists
    const version = await this.prisma.documentTemplateVersion.findFirst({
      where: { status: "active" },
      orderBy: { version: "desc" },
    });
    if (version) {
      await this.prisma.signaturePacket.create({
        data: {
          versionId: version.id,
          subjectUserId: user.id,
          status: "required",
        },
      });
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      orgId: org.id,
      role: user.role,
    });
    this.setCookie(res, token);
    return { user: toAuthUser(user) };
  }

  @Post("login")
  async login(
    @Body() body: { email?: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      throw new BadRequestException("Email and password required");
    }

    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        "Those credentials don't match a Sully's account. Check email/password, or create an account.",
      );
    }
    if (user.disabledAt) {
      throw new UnauthorizedException("Account disabled — contact the owner");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(
        "Those credentials don't match a Sully's account. Check email/password, or reset your password.",
      );
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      orgId: user.organizationId,
      role: user.role,
    });
    this.setCookie(res, token);
    return { user: toAuthUser(user) };
  }

  @Post("forgot-password")
  async forgotPassword(@Body() body: { email?: string }) {
    const email = body.email?.trim().toLowerCase();
    if (!email) throw new BadRequestException("Email required");

    const user = await this.prisma.user.findFirst({ where: { email } });
    // Always return ok — don't leak which emails exist
    const base = {
      ok: true,
      message:
        "If that email is on file, a reset link is ready. Check your inbox (demo: see resetLink below).",
    };
    if (!user || user.disabledAt) return base;

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const webOrigin =
      process.env.WEB_ORIGIN ??
      process.env.NEXT_PUBLIC_WEB_URL ??
      "http://localhost:3000";
    const resetLink = `${webOrigin}/app/reset-password?token=${token}`;
    console.log(`[auth] password reset for ${email}: ${resetLink}`);

    const isProd = process.env.NODE_ENV === "production";
    return {
      ...base,
      ...(isProd ? {} : { resetLink, demoHint: true }),
    };
  }

  @Post("reset-password")
  async resetPassword(
    @Body() body: { token?: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = body.token?.trim();
    const password = body.password ?? "";
    if (!token || password.length < 8) {
      throw new BadRequestException("Valid token and password (8+) required");
    }

    const row = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException(
        "This reset link is invalid or expired. Request a new one.",
      );
    }
    if (row.user.disabledAt) {
      throw new UnauthorizedException("Account disabled — contact the owner");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    const jwt = await signToken({
      sub: row.user.id,
      email: row.user.email,
      orgId: row.user.organizationId,
      role: row.user.role,
    });
    this.setCookie(res, jwt);
    return { user: toAuthUser(row.user), ok: true };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    const opts = this.cookieOptions();
    res.clearCookie(COOKIE_NAME, {
      path: opts.path,
      domain: opts.domain,
      secure: opts.secure,
      sameSite: opts.sameSite,
    });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentUser() auth: AuthPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: auth.sub } });
    if (!user) throw new UnauthorizedException();
    if (user.disabledAt) {
      throw new UnauthorizedException("Account disabled — contact the owner");
    }
    return toAuthUser(user);
  }

  private cookieOptions() {
    const webOrigin = process.env.WEB_ORIGIN ?? "";
    const isLocalWeb =
      webOrigin.includes("localhost") || webOrigin.includes("127.0.0.1");
    // Always Secure in deployed environments — required for HTTPS www ↔ api.
    const secure =
      process.env.COOKIE_SECURE === "true" ||
      (!isLocalWeb &&
        (process.env.NODE_ENV === "production" ||
          Boolean(process.env.RAILWAY_ENVIRONMENT) ||
          Boolean(process.env.RAILWAY_STATIC_URL) ||
          webOrigin.startsWith("https://")));
    // Prefer host-only cookies so Next.js same-origin proxy can attach them to www.
    // Optional COOKIE_DOMAIN=.sullys1943.com for direct api.* clients (staff).
    const domain = process.env.COOKIE_DOMAIN?.trim() || undefined;
    return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      ...(domain ? { domain } : {}),
    };
  }

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
