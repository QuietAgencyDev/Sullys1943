import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
  Inject,
} from "@nestjs/common";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { PrismaService } from "../prisma.service";

const COOKIE = "sullys_token";

function secret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "sullys-dev-secret-change-me",
  );
}

export type AuthPayload = {
  sub: string;
  email: string;
  orgId: string;
  role: string;
};

export async function signToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, secret());
  return payload as unknown as AuthPayload;
}

export function readToken(req: Request): string | null {
  const cookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[
    COOKIE
  ];
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export const COOKIE_NAME = COOKIE;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = readToken(req);
    if (!token) throw new UnauthorizedException("Not authenticated");
    try {
      const payload = await verifyToken(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { disabledAt: true, role: true, organizationId: true },
      });
      if (!user || user.disabledAt) {
        throw new UnauthorizedException("Account disabled — contact the owner");
      }
      (req as Request & { user: AuthPayload }).user = {
        ...payload,
        role: user.role,
        orgId: user.organizationId,
      };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException("Invalid session");
    }
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthPayload => {
    const req = ctx.switchToHttp().getRequest<Request & { user: AuthPayload }>();
    return req.user;
  },
);
