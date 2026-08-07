import { Controller, Get, Inject, Query } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

type Profile = "floor" | "reception";

@Controller("tv")
export class TvController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * Public gym display board — first names / initials only, no emails or finance.
   * Profiles: floor (class energy + leaderboard) | reception (welcome + schedule).
   */
  @Get("board")
  async board(@Query("profile") profileRaw?: string) {
    const profile: Profile =
      profileRaw === "reception" ? "reception" : "floor";

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [sessions, checkInsToday, xpRows, announcements, activeLive] =
      await Promise.all([
      this.prisma.session.findMany({
        where: { startsAt: { gte: start, lt: end } },
        include: {
          bookings: { where: { status: { not: "cancelled" } } },
          coach: { select: { firstName: true, lastName: true } },
          program: { select: { name: true } },
          liveState: true,
        },
        orderBy: { startsAt: "asc" },
        take: 12,
      }),
      this.prisma.attendanceEvent.count({
        where: { checkedInAt: { gte: start, lt: end } },
      }),
      this.prisma.xpLedger.groupBy({
        by: ["userId"],
        _sum: { delta: true },
        orderBy: { _sum: { delta: "desc" } },
        take: 8,
      }),
      this.prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      this.prisma.liveClassState.findFirst({
        where: { status: { in: ["running", "paused"] } },
        include: {
          session: {
            select: {
              id: true,
              title: true,
              coachName: true,
              coach: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const userIds = xpRows.map((r) => r.userId);
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds }, role: { in: ["member", "parent"] } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = xpRows
      .map((row, index) => {
        const u = userMap.get(row.userId);
        if (!u) return null;
        const xp = row._sum.delta ?? 0;
        return {
          rank: index + 1,
          displayName: `${u.firstName} ${u.lastName.charAt(0)}.`,
          xp,
          level: Math.floor(xp / 100) + 1,
        };
      })
      .filter(Boolean);

    const mapped = sessions.map((s) => {
      const booked = s.bookings.length;
      const endsAt = s.endsAt ?? new Date(s.startsAt.getTime() + 60 * 60 * 1000);
      const msToStart = s.startsAt.getTime() - now.getTime();
      const msToEnd = endsAt.getTime() - now.getTime();
      let phase: "upcoming" | "live" | "done" = "upcoming";
      if (msToEnd <= 0) phase = "done";
      else if (msToStart <= 0) phase = "live";

      const coachLabel = s.coach
        ? `${s.coach.firstName} ${s.coach.lastName.charAt(0)}.`
        : s.coachName;

      return {
        id: s.id,
        title: s.title,
        program: s.program?.name ?? null,
        coach: coachLabel,
        startsAt: s.startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        capacity: s.capacity,
        booked,
        spotsLeft: Math.max(0, s.capacity - booked),
        phase,
        secondsToStart: Math.max(0, Math.floor(msToStart / 1000)),
        secondsRemaining: Math.max(0, Math.floor(msToEnd / 1000)),
      };
    });

    const live = mapped.find((s) => s.phase === "live") ?? null;
    const next =
      mapped.find((s) => s.phase === "upcoming") ??
      mapped.find((s) => s.phase === "live") ??
      null;

    const recentCheckIns = await this.prisma.attendanceEvent.findMany({
      where: { checkedInAt: { gte: start, lt: end } },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { checkedInAt: "desc" },
      take: 6,
    });

    return {
      profile,
      asOf: now.toISOString(),
      gym: {
        name: "Sully's Boxing Gym",
        tagline: "Boxing is the engine. People are the purpose. Character is the legacy.",
        established: 1943,
      },
      kpis: {
        checkInsToday,
        classesToday: mapped.length,
        spotsOpen: mapped.reduce((n, s) => n + s.spotsLeft, 0),
      },
      live,
      next,
      schedule: mapped.filter((s) => s.phase !== "done").slice(0, 6),
      leaderboard,
      ticker: recentCheckIns.map((c) => ({
        name: `${c.user.firstName} ${c.user.lastName.charAt(0)}.`,
        at: c.checkedInAt.toISOString(),
      })),
      announcements: announcements.map((a) => ({
        title: a.title,
        body: a.body.slice(0, 160),
      })),
      manifesto: [
        "Boxing is the engine",
        "People are the purpose",
        "Character is the legacy",
        "We don't lower standards — we raise people",
      ],
      refreshSeconds: activeLive ? 3 : 15,
      /** Coach-controlled timer — overrides open-gym wall-clock sync on floor TV */
      coachTimer: activeLive
        ? (() => {
            const ls = activeLive;
            let secondsLeft = ls.workSec;
            if (ls.status === "paused") {
              secondsLeft = ls.pausedRemainSec ?? ls.workSec;
            } else if (ls.status === "running" && ls.phaseEndsAt) {
              secondsLeft = Math.max(
                0,
                Math.ceil((ls.phaseEndsAt.getTime() - now.getTime()) / 1000),
              );
            }
            const coach = ls.session.coach
              ? `${ls.session.coach.firstName} ${ls.session.coach.lastName.charAt(0)}.`
              : ls.session.coachName;
            return {
              sessionId: ls.sessionId,
              title: ls.session.title,
              coach,
              status: ls.status,
              phase: ls.phase,
              round: ls.round,
              totalRounds: ls.totalRounds,
              workSec: ls.workSec,
              restSec: ls.restSec,
              secondsLeft,
              phaseEndsAt: ls.phaseEndsAt?.toISOString() ?? null,
              pausedRemainSec: ls.pausedRemainSec,
              tvMode: ls.tvMode,
              syncedToCoach: true,
            };
          })()
        : null,
    };
  }
}
