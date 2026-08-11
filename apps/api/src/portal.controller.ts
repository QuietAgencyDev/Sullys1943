import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { AuthGuard, CurrentUser, type AuthPayload } from "./auth/auth.guard";

@Controller("portal")
export class PortalController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Public coach directory for marketing. */
  @Get("coaches")
  async coaches() {
    // Official site order — https://www.sullysboxinggym.com/trainers/
    const ROSTER_ORDER = [
      "tony morrison",
      "rico mancini",
      "winslow",
      "jonathan bochner",
      "anthony sky",
      "jacklyne irvine",
      "jack hemmings",
    ];

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
    });

    const sorted = [...coaches].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      const ia = ROSTER_ORDER.indexOf(nameA);
      const ib = ROSTER_ORDER.indexOf(nameB);
      const ra = ia === -1 ? 999 : ia;
      const rb = ib === -1 ? 999 : ib;
      if (ra !== rb) return ra - rb;
      return nameA.localeCompare(nameB);
    });

    return {
      coaches: sorted.map((c) => ({
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
