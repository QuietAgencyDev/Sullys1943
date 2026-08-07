import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { AuthGuard, CurrentUser, type AuthPayload } from "./auth/auth.guard";

@Controller("portal")
export class PortalController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Public coach directory for marketing. */
  @Get("coaches")
  async coaches() {
    const coaches = await this.prisma.user.findMany({
      where: {
        role: "coach",
        disabledAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        bio: true,
        photoUrl: true,
      },
      orderBy: { firstName: "asc" },
    });

    return {
      coaches: coaches.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        title: c.title ?? "Coach",
        bio:
          c.bio ??
          "Building character through the craft of boxing at Sully's.",
        photoUrl: c.photoUrl,
      })),
    };
  }

  @Get("home")
  @UseGuards(AuthGuard)
  async home(@CurrentUser() auth: AuthPayload) {
    const now = new Date();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: auth.sub },
      select: { firstName: true, lastName: true, email: true, role: true },
    });

    const [membership, waiver, nextBooking, xp, points] = await Promise.all([
      this.prisma.membership.findFirst({
        where: {
          status: "active",
          OR: [
            { payerUserId: auth.sub },
            { members: { some: { userId: auth.sub } } },
          ],
        },
        include: { product: true },
        orderBy: { startsAt: "desc" },
      }),
      this.prisma.signaturePacket.findFirst({
        where: { subjectUserId: auth.sub },
        orderBy: { id: "desc" },
      }),
      this.prisma.booking.findFirst({
        where: {
          userId: auth.sub,
          status: { in: ["confirmed", "waitlisted", "checked_in"] },
          session: { startsAt: { gte: now } },
        },
        include: {
          session: {
            include: {
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { session: { startsAt: "asc" } },
      }),
      this.prisma.xpLedger.aggregate({
        where: { userId: auth.sub },
        _sum: { delta: true },
      }),
      this.prisma.pointsAccount.findUnique({ where: { userId: auth.sub } }),
    ]);

    const totalXp = xp._sum.delta ?? 0;

    return {
      user: {
        name: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
      membership: membership
        ? {
            status: membership.status,
            productName: membership.product.name,
          }
        : null,
      waiver: {
        status: waiver?.status ?? "missing",
        signed: waiver?.status === "signed",
      },
      nextClass: nextBooking
        ? {
            id: nextBooking.session.id,
            title: nextBooking.session.title,
            startsAt: nextBooking.session.startsAt.toISOString(),
            endsAt: nextBooking.session.endsAt.toISOString(),
            status: nextBooking.status,
            coach: nextBooking.session.coach
              ? `${nextBooking.session.coach.firstName} ${nextBooking.session.coach.lastName}`
              : nextBooking.session.coachName,
          }
        : null,
      xp: totalXp,
      points: points?.balance ?? 0,
      level: Math.floor(totalXp / 100) + 1,
    };
  }
}
