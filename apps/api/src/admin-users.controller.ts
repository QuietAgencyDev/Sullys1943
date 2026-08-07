import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "./prisma.service";
import { AuthGuard, CurrentUser, type AuthPayload } from "./auth/auth.guard";

const ADMIN_ROLES = new Set(["owner", "admin"]);
const MANAGEABLE_ROLES = new Set([
  "front_desk",
  "coach",
  "admin",
  "owner",
]);

function requireAdmin(auth: AuthPayload) {
  if (!ADMIN_ROLES.has(auth.role)) {
    throw new ForbiddenException("Owner or admin role required");
  }
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Staff",
    lastName: parts.slice(1).join(" ") || "User",
  };
}

@Controller("admin/users")
@UseGuards(AuthGuard)
export class AdminUsersController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @CurrentUser() auth: AuthPayload,
    @Query("role") role?: string,
    @Query("includeDisabled") includeDisabled?: string,
  ) {
    requireAdmin(auth);
    const roles = role && MANAGEABLE_ROLES.has(role)
      ? [role]
      : [...MANAGEABLE_ROLES];

    const users = await this.prisma.user.findMany({
      where: {
        organizationId: auth.orgId,
        role: { in: roles },
        ...(includeDisabled === "0" || includeDisabled === "false"
          ? { disabledAt: null }
          : {}),
      },
      orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        disabledAt: true,
        invitedAt: true,
        createdAt: true,
      },
    });

    return {
      users: users.map((u) => ({
        ...u,
        name: `${u.firstName} ${u.lastName}`.trim(),
        disabled: Boolean(u.disabledAt),
        disabledAt: u.disabledAt?.toISOString() ?? null,
        invitedAt: u.invitedAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }

  @Post()
  async invite(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      email?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      password?: string;
      phone?: string;
    },
  ) {
    requireAdmin(auth);

    const email = body.email?.trim().toLowerCase();
    const role = body.role?.trim() || "front_desk";
    const password = body.password?.trim() || "password123";

    if (!email) throw new BadRequestException("email required");
    if (!MANAGEABLE_ROLES.has(role)) {
      throw new BadRequestException(
        "role must be front_desk, coach, admin, or owner",
      );
    }
    if (password.length < 8) {
      throw new BadRequestException("password must be 8+ characters");
    }
    if (role === "owner" && auth.role !== "owner") {
      throw new ForbiddenException("Only an owner can invite another owner");
    }

    const existing = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: auth.orgId,
          email,
        },
      },
    });
    if (existing) {
      throw new BadRequestException("Email already registered in this gym");
    }

    const names = body.firstName
      ? {
          firstName: body.firstName.trim(),
          lastName: (body.lastName || "Staff").trim(),
        }
      : splitName(body.name || email.split("@")[0] || "Staff User");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        organizationId: auth.orgId,
        email,
        passwordHash,
        firstName: names.firstName,
        lastName: names.lastName,
        role,
        phone: body.phone?.trim() || null,
        invitedAt: new Date(),
        points: { create: { balance: 0 } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        disabledAt: true,
        invitedAt: true,
        createdAt: true,
      },
    });

    return {
      user: {
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim(),
        disabled: false,
        disabledAt: null,
        invitedAt: user.invitedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      temporaryPassword: password,
      note: "Share the temporary password securely. Staff should change it after first login (password change UI coming soon).",
    };
  }

  @Patch(":id")
  async update(
    @CurrentUser() auth: AuthPayload,
    @Param("id") id: string,
    @Body()
    body: {
      role?: string;
      disabled?: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      resetPassword?: string;
    },
  ) {
    requireAdmin(auth);

    const user = await this.prisma.user.findFirst({
      where: { id, organizationId: auth.orgId },
    });
    if (!user) throw new BadRequestException("User not found");
    if (!MANAGEABLE_ROLES.has(user.role)) {
      throw new BadRequestException("Not a staff account");
    }
    if (user.id === auth.sub && body.disabled === true) {
      throw new BadRequestException("You cannot disable your own account");
    }
    if (user.role === "owner" && auth.role !== "owner") {
      throw new ForbiddenException("Only an owner can modify owner accounts");
    }

    const data: {
      role?: string;
      disabledAt?: Date | null;
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      passwordHash?: string;
    } = {};

    if (body.role !== undefined) {
      if (!MANAGEABLE_ROLES.has(body.role)) {
        throw new BadRequestException(
          "role must be front_desk, coach, admin, or owner",
        );
      }
      if (body.role === "owner" && auth.role !== "owner") {
        throw new ForbiddenException("Only an owner can promote to owner");
      }
      data.role = body.role;
    }
    if (body.disabled === true) data.disabledAt = new Date();
    if (body.disabled === false) data.disabledAt = null;
    if (body.firstName?.trim()) data.firstName = body.firstName.trim();
    if (body.lastName?.trim()) data.lastName = body.lastName.trim();
    if (body.phone !== undefined) {
      data.phone = body.phone?.trim() || null;
    }
    if (body.resetPassword !== undefined) {
      if (body.resetPassword.length < 8) {
        throw new BadRequestException("resetPassword must be 8+ characters");
      }
      data.passwordHash = await bcrypt.hash(body.resetPassword, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        disabledAt: true,
        invitedAt: true,
        createdAt: true,
      },
    });

    return {
      user: {
        ...updated,
        name: `${updated.firstName} ${updated.lastName}`.trim(),
        disabled: Boolean(updated.disabledAt),
        disabledAt: updated.disabledAt?.toISOString() ?? null,
        invitedAt: updated.invitedAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  }
}
