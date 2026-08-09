import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import {
  AuthGuard,
  CurrentUser,
  type AuthPayload,
} from "./auth/auth.guard";
import { ProgressionService } from "./progression.service";
import { performCheckIn } from "./platform.controllers";

const STAFF_ROLES = new Set(["coach", "front_desk", "admin", "owner"]);
const COACH_MANAGE_ROLES = new Set(["coach", "admin", "owner"]);

function requireStaff(auth: AuthPayload) {
  if (!STAFF_ROLES.has(auth.role)) {
    throw new ForbiddenException("Staff role required");
  }
}

function requireCoachOps(auth: AuthPayload) {
  if (!COACH_MANAGE_ROLES.has(auth.role)) {
    throw new ForbiddenException("Coach role required");
  }
}

function canSeeAllSessions(auth: AuthPayload) {
  return auth.role === "admin" || auth.role === "owner" || auth.role === "front_desk";
}

const TV_MODES = new Set([
  "timer",
  "leaderboard",
  "announcement",
  "teams",
  "challenge",
  "achievement",
  "class_complete",
  "xp_bonus",
]);

function serializeLive(
  live: {
    status: string;
    phase: string;
    round: number;
    totalRounds: number;
    workSec: number;
    restSec: number;
    phaseEndsAt: Date | null;
    pausedRemainSec: number | null;
    tvMode: string;
    tvMessage?: string | null;
    blockIndex?: number;
    kidsMode?: boolean;
    workoutTemplateId?: string | null;
    updatedAt: Date;
  } | null,
  now = new Date(),
  workout?: {
    current: { title: string; phase: string; notes: string } | null;
    next: { title: string; phase: string; notes: string } | null;
    templateName: string | null;
  },
) {
  if (!live) {
    return {
      status: "idle" as const,
      phase: "work" as const,
      round: 1,
      totalRounds: 12,
      workSec: 180,
      restSec: 60,
      secondsLeft: 180,
      tvMode: "timer",
      tvMessage: null as string | null,
      syncedToCoach: false,
      kidsMode: false,
      blockIndex: 0,
      workout: workout ?? {
        current: null,
        next: null,
        templateName: null,
      },
      updatedAt: null as string | null,
    };
  }

  let secondsLeft = live.workSec;
  if (live.status === "paused") {
    secondsLeft = live.pausedRemainSec ?? live.workSec;
  } else if (live.status === "running" && live.phaseEndsAt) {
    secondsLeft = Math.max(
      0,
      Math.ceil((live.phaseEndsAt.getTime() - now.getTime()) / 1000),
    );
  } else if (live.status === "finished") {
    secondsLeft = 0;
  } else {
    secondsLeft =
      live.phase === "rest" || live.phase === "cooldown"
        ? live.restSec
        : live.workSec;
  }

  return {
    status: live.status,
    phase: live.phase,
    round: live.round,
    totalRounds: live.totalRounds,
    workSec: live.workSec,
    restSec: live.restSec,
    secondsLeft,
    pausedRemainSec: live.pausedRemainSec,
    tvMode: live.tvMode,
    tvMessage: live.tvMessage ?? null,
    kidsMode: live.kidsMode ?? false,
    blockIndex: live.blockIndex ?? 0,
    workoutTemplateId: live.workoutTemplateId ?? null,
    workout: workout ?? {
      current: null,
      next: null,
      templateName: null,
    },
    syncedToCoach:
      live.status === "running" ||
      live.status === "paused" ||
      live.status === "finished",
    phaseEndsAt: live.phaseEndsAt?.toISOString() ?? null,
    updatedAt: live.updatedAt.toISOString(),
  };
}

async function attendanceStreak(
  prisma: PrismaService,
  userId: string,
): Promise<number> {
  const events = await prisma.attendanceEvent.findMany({
    where: { userId, status: { not: "voided" } },
    orderBy: { checkedInAt: "desc" },
    take: 40,
    select: { checkedInAt: true },
  });
  if (events.length === 0) return 0;
  const days = [
    ...new Set(events.map((e) => e.checkedInAt.toISOString().slice(0, 10))),
  ].sort()
    .reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  // Allow streak to start from yesterday if no check-in today yet
  if (days[0] !== cursor.toISOString().slice(0, 10)) {
    cursor.setDate(cursor.getDate() - 1);
    if (days[0] !== cursor.toISOString().slice(0, 10)) return 0;
  }
  let streak = 0;
  for (const day of days) {
    if (day !== cursor.toISOString().slice(0, 10)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

@Controller("coach")
export class CoachController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ProgressionService) private readonly progression: ProgressionService,
  ) {}

  private async assertSessionAccess(sessionId: string, auth: AuthPayload) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        program: true,
        coach: { select: { id: true, firstName: true, lastName: true } },
        liveState: {
          include: {
            workoutTemplate: {
              include: { blocks: { orderBy: { sortOrder: "asc" } } },
            },
          },
        },
        bookings: { where: { status: { not: "cancelled" } } },
        attendance: { where: { status: { not: "voided" } } },
      },
    });
    if (!session) throw new BadRequestException("Session not found");
    if (
      !canSeeAllSessions(auth) &&
      session.coachUserId &&
      session.coachUserId !== auth.sub
    ) {
      throw new ForbiddenException("Not your class");
    }
    return session;
  }

  private workoutFromLive(
    live: {
      blockIndex: number;
      workoutTemplate: {
        name: string;
        blocks: {
          title: string;
          phase: string;
          notes: string;
          sortOrder: number;
        }[];
      } | null;
    } | null,
  ) {
    const blocks = live?.workoutTemplate?.blocks ?? [];
    const idx = live?.blockIndex ?? 0;
    const cur = blocks[idx] ?? null;
    const nxt = blocks[idx + 1] ?? null;
    return {
      current: cur
        ? { title: cur.title, phase: cur.phase, notes: cur.notes }
        : null,
      next: nxt
        ? { title: nxt.title, phase: nxt.phase, notes: nxt.notes }
        : null,
      templateName: live?.workoutTemplate?.name ?? null,
      blockCount: blocks.length,
      blockIndex: idx,
    };
  }

  @Get("home")
  @UseGuards(AuthGuard)
  async home(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const where = {
      startsAt: { gte: start, lt: end },
      ...(canSeeAllSessions(auth) ? {} : { coachUserId: auth.sub }),
    };

    const sessions = await this.prisma.session.findMany({
      where,
      include: {
        program: true,
        liveState: true,
        bookings: { where: { status: { not: "cancelled" } } },
        attendance: { where: { status: { not: "voided" } } },
        coach: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    const mapped = sessions.map((s) => {
      const booked = s.bookings.filter((b) =>
        ["confirmed", "checked_in", "waitlisted"].includes(b.status),
      ).length;
      const checkedIn = s.attendance.length;
      const waitlisted = s.bookings.filter((b) => b.status === "waitlisted")
        .length;
      const msToStart = s.startsAt.getTime() - now.getTime();
      const msToEnd = s.endsAt.getTime() - now.getTime();
      let phase: "upcoming" | "live" | "done" = "upcoming";
      if (msToEnd <= 0 && s.liveState?.status !== "running" && s.liveState?.status !== "paused") {
        phase = "done";
      } else if (
        msToStart <= 0 ||
        s.liveState?.status === "running" ||
        s.liveState?.status === "paused"
      ) {
        phase = "live";
      }
      return {
        id: s.id,
        title: s.title,
        program: s.program.name,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        capacity: s.capacity,
        booked,
        checkedIn,
        waitlisted,
        spotsLeft: Math.max(0, s.capacity - booked),
        phase,
        coachName: s.coach
          ? `${s.coach.firstName} ${s.coach.lastName}`
          : s.coachName,
        live: serializeLive(s.liveState, now),
      };
    });

    const current =
      mapped.find((s) => s.live.status === "running" || s.live.status === "paused") ??
      mapped.find((s) => s.phase === "live") ??
      null;
    const next = mapped.find((s) => s.phase === "upcoming") ?? null;

    const waitlistTotal = mapped.reduce((n, s) => n + s.waitlisted, 0);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentBookedUserIds = [
      ...new Set(
        sessions.flatMap((s) =>
          s.bookings
            .filter((b) => b.status !== "waitlisted")
            .map((b) => b.userId),
        ),
      ),
    ];

    const [recentBadges, announcements, attentionCandidates, newMemberHits] =
      await Promise.all([
        this.prisma.userBadge.findMany({
          orderBy: { earnedAt: "desc" },
          take: 6,
          include: {
            badge: true,
            user: { select: { firstName: true, lastName: true } },
          },
        }),
        this.prisma.announcement.findMany({
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        recentBookedUserIds.length
          ? this.prisma.user.findMany({
              where: {
                id: { in: recentBookedUserIds },
                role: { in: ["member", "parent", "child"] },
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                attendance: {
                  where: { status: { not: "voided" } },
                  orderBy: { checkedInAt: "desc" },
                  take: 8,
                  select: { checkedInAt: true },
                },
              },
            })
          : Promise.resolve([]),
        recentBookedUserIds.length
          ? this.prisma.attendanceEvent.groupBy({
              by: ["userId"],
              where: {
                userId: { in: recentBookedUserIds },
                status: { not: "voided" },
              },
              _count: { _all: true },
            })
          : Promise.resolve([]),
      ]);

    const lowAttendance = new Set(
      newMemberHits
        .filter((g) => g._count._all < 3)
        .map((g) => g.userId),
    );

    const attention = attentionCandidates
      .map((u) => {
        const last = u.attendance[0]?.checkedInAt;
        const recentCount = u.attendance.filter(
          (a) => a.checkedInAt >= thirtyDaysAgo,
        ).length;
        let reason: string | null = null;
        if (!last || last < twoWeeksAgo) reason = "Missed recent classes";
        else if (recentCount <= 1) reason = "Attendance declining";
        else if (lowAttendance.has(u.id)) reason = "New — keep encouraging";
        if (!reason) return null;
        return {
          userId: u.id,
          name: `${u.firstName} ${u.lastName}`,
          reason,
        };
      })
      .filter(Boolean)
      .slice(0, 8);

    const newMembers = attentionCandidates
      .filter((u) => lowAttendance.has(u.id))
      .slice(0, 6)
      .map((u) => ({
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
      }));

    const activeChallenges = current
      ? await this.prisma.challengeInstance.findMany({
          where: { sessionId: current.id, status: "active" },
          take: 5,
        })
      : [];

    const classCompleteXp = await this.progression.deltaFor("class.completed");

    return {
      asOf: now.toISOString(),
      coach: {
        id: auth.sub,
        role: auth.role,
        email: auth.email,
      },
      current,
      next,
      today: mapped,
      kpis: {
        classesToday: mapped.length,
        checkedInToday: mapped.reduce((n, s) => n + s.checkedIn, 0),
        spotsOpen: mapped.reduce((n, s) => n + s.spotsLeft, 0),
        waitlist: waitlistTotal,
        attendance: mapped.reduce((n, s) => n + s.checkedIn, 0),
      },
      waitlist: waitlistTotal,
      newMembers,
      attention,
      recentAchievements: recentBadges.map((b) => ({
        code: b.badge.code,
        name: b.badge.name,
        athlete: `${b.user.firstName} ${b.user.lastName.charAt(0)}.`,
        earnedAt: b.earnedAt.toISOString(),
      })),
      challenges: activeChallenges.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
      })),
      upcomingEvents: announcements.map((a) => ({
        title: a.title,
        body: a.body.slice(0, 120),
        at: a.createdAt.toISOString(),
      })),
      tasks: [
        ...(current &&
        current.live.status !== "running" &&
        current.live.status !== "paused"
          ? [{ label: `Start ${current.title}`, href: `/coach/live/${current.id}` }]
          : []),
        ...(current
          ? [{ label: "Open roster", href: "/coach/roster" }]
          : []),
        { label: "Class builder", href: "/coach/builder" },
        { label: "Messages", href: "/coach/messages" },
      ],
      xpAvailable: { classComplete: classCompleteXp },
    };
  }

  @Get("sessions/:id/live")
  @UseGuards(AuthGuard)
  async getLive(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    const session = await this.assertSessionAccess(id, auth);
    const workout = this.workoutFromLive(session.liveState);
    const classXp = await this.progression.deltaFor(
      session.liveState?.kidsMode ? "kids.participation" : "class.completed",
    );
    return {
      session: {
        id: session.id,
        title: session.title,
        program: session.program.name,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        capacity: session.capacity,
        booked: session.bookings.length,
        checkedIn: session.attendance.length,
        coachName: session.coach
          ? `${session.coach.firstName} ${session.coach.lastName}`
          : session.coachName,
        kidsMode: session.liveState?.kidsMode ?? session.program.kind === "kids",
      },
      live: serializeLive(session.liveState, new Date(), workout),
      xpAvailable: { classComplete: classXp },
    };
  }

  @Post("sessions/:id/live/:action")
  @UseGuards(AuthGuard)
  async liveAction(
    @Param("id") id: string,
    @Param("action") action: string,
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      workSec?: number;
      restSec?: number;
      totalRounds?: number;
      tvMode?: string;
      tvMessage?: string;
      workoutTemplateId?: string;
      kidsMode?: boolean;
      advanceBlock?: boolean;
    } = {},
  ) {
    requireCoachOps(auth);
    const session = await this.assertSessionAccess(id, auth);
    const now = new Date();

    let live = session.liveState;
    if (!live) {
      live = await this.prisma.liveClassState.create({
        data: {
          sessionId: session.id,
          startedById: auth.sub,
          workSec: Math.max(20, body.workSec ?? 180),
          restSec: Math.max(10, body.restSec ?? 60),
          totalRounds: Math.max(1, body.totalRounds ?? 12),
          kidsMode: body.kidsMode ?? session.program.kind === "kids",
          workoutTemplateId: body.workoutTemplateId,
        },
        include: {
          workoutTemplate: {
            include: { blocks: { orderBy: { sortOrder: "asc" } } },
          },
        },
      });
    }

    // Allow short demo rounds (20s work / 10s rest) for client walkthroughs
    const workSec = Math.max(20, body.workSec ?? live.workSec);
    const restSec = Math.max(10, body.restSec ?? live.restSec);
    const totalRounds = Math.max(1, body.totalRounds ?? live.totalRounds);

    const remainingNow = (): number => {
      if (live!.status === "paused") {
        return live!.pausedRemainSec ?? workSec;
      }
      if (live!.status === "running" && live!.phaseEndsAt) {
        return Math.max(
          0,
          Math.ceil((live!.phaseEndsAt.getTime() - now.getTime()) / 1000),
        );
      }
      return live!.phase === "work" ? workSec : restSec;
    };

    let data: Record<string, unknown> = {
      workSec,
      restSec,
      totalRounds,
    };

    switch (action) {
      case "start": {
        // Auto-attach Fundamentals template when none set
        let workoutTemplateId =
          body.workoutTemplateId ?? live.workoutTemplateId ?? null;
        let blockIndex = live.blockIndex ?? 0;
        if (!workoutTemplateId) {
          const fundamentals = await this.prisma.workoutTemplate.findFirst({
            where: {
              OR: [
                { name: "Sully's Boxing Fundamentals" },
                { name: { contains: "Fundamentals" } },
              ],
            },
            orderBy: { createdAt: "asc" },
          });
          if (fundamentals) {
            workoutTemplateId = fundamentals.id;
            blockIndex = 0;
          }
        }
        data = {
          ...data,
          status: "running",
          phase: "work",
          round: 1,
          phaseEndsAt: new Date(now.getTime() + workSec * 1000),
          pausedRemainSec: null,
          startedById: auth.sub,
          tvMode: body.tvMode ?? "timer",
          ...(workoutTemplateId
            ? { workoutTemplateId, blockIndex }
            : {}),
        };
        break;
      }
      case "pause": {
        if (live.status !== "running") {
          throw new BadRequestException("Timer is not running");
        }
        data = {
          ...data,
          status: "paused",
          pausedRemainSec: remainingNow(),
          phaseEndsAt: null,
        };
        break;
      }
      case "resume": {
        if (live.status !== "paused") {
          throw new BadRequestException("Timer is not paused");
        }
        const left = live.pausedRemainSec ?? workSec;
        data = {
          ...data,
          status: "running",
          phaseEndsAt: new Date(now.getTime() + left * 1000),
          pausedRemainSec: null,
        };
        break;
      }
      case "next": {
        let phase = live.phase;
        let round = live.round;
        if (phase === "work" || phase === "warmup") {
          phase = "rest";
        } else {
          phase = "work";
          round = Math.min(totalRounds, round + 1);
        }
        const dur = phase === "work" || phase === "warmup" ? workSec : restSec;
        let blockIndex = live.blockIndex ?? 0;
        if (body.advanceBlock !== false && live.workoutTemplateId) {
          const blocks = await this.prisma.workoutBlock.count({
            where: { templateId: live.workoutTemplateId },
          });
          if (blocks > 0) {
            blockIndex = Math.min(blocks - 1, blockIndex + 1);
          }
        }
        data = {
          ...data,
          status: "running",
          phase,
          round,
          blockIndex,
          phaseEndsAt: new Date(now.getTime() + dur * 1000),
          pausedRemainSec: null,
        };
        break;
      }
      case "back": {
        let phase = live.phase;
        let round = live.round;
        if (phase === "rest") {
          phase = "work";
        } else if (round > 1) {
          round -= 1;
          phase = "rest";
        }
        const dur = phase === "work" ? workSec : restSec;
        data = {
          ...data,
          status: "running",
          phase,
          round,
          phaseEndsAt: new Date(now.getTime() + dur * 1000),
          pausedRemainSec: null,
        };
        break;
      }
      case "rest": {
        const dur = restSec;
        data = {
          ...data,
          status: "running",
          phase: "rest",
          phaseEndsAt: new Date(now.getTime() + dur * 1000),
          pausedRemainSec: null,
        };
        break;
      }
      case "round": {
        const dur = workSec;
        data = {
          ...data,
          status: "running",
          phase: "work",
          phaseEndsAt: new Date(now.getTime() + dur * 1000),
          pausedRemainSec: null,
        };
        break;
      }
      case "tv": {
        const mode = body.tvMode ?? live.tvMode;
        if (!TV_MODES.has(mode)) {
          throw new BadRequestException(
            "tvMode must be timer|leaderboard|announcement|teams|challenge|achievement|class_complete|xp_bonus",
          );
        }
        data = {
          ...data,
          tvMode: mode,
          tvMessage:
            body.tvMessage !== undefined
              ? body.tvMessage.trim() || null
              : live.tvMessage,
        };
        break;
      }
      case "finish": {
        data = {
          ...data,
          status: "finished",
          phaseEndsAt: null,
          pausedRemainSec: 0,
          tvMode: body.tvMode ?? "class_complete",
        };
        break;
      }
      case "reset": {
        // Back to round 1 / full work — paused so coach can START or RESUME
        data = {
          ...data,
          status: "paused",
          phase: "work",
          round: 1,
          blockIndex: 0,
          phaseEndsAt: null,
          pausedRemainSec: workSec,
          tvMode: body.tvMode ?? "timer",
        };
        break;
      }
      case "stop": {
        // Hard stop — no XP (unlike finish)
        data = {
          ...data,
          status: "idle",
          phase: "work",
          round: 1,
          blockIndex: 0,
          phaseEndsAt: null,
          pausedRemainSec: null,
          tvMode: body.tvMode ?? "timer",
        };
        break;
      }
      case "config": {
        data = {
          ...data,
          tvMode: body.tvMode ?? live.tvMode,
          tvMessage:
            body.tvMessage !== undefined
              ? body.tvMessage.trim() || null
              : live.tvMessage,
          ...(body.workoutTemplateId !== undefined
            ? { workoutTemplateId: body.workoutTemplateId || null, blockIndex: 0 }
            : {}),
          ...(body.kidsMode !== undefined ? { kidsMode: body.kidsMode } : {}),
          ...(body.workSec !== undefined ? { workSec } : {}),
          ...(body.restSec !== undefined ? { restSec } : {}),
          ...(body.totalRounds !== undefined ? { totalRounds } : {}),
        };
        break;
      }
      default:
        throw new BadRequestException(
          "Unknown action. Use start|pause|resume|next|back|rest|round|finish|reset|stop|tv|config",
        );
    }

    const updated = await this.prisma.liveClassState.update({
      where: { sessionId: session.id },
      data,
      include: {
        workoutTemplate: {
          include: { blocks: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    let xpAwarded = 0;
    const completion: {
      attendance: number;
      xpAwarded: number;
      challenges: { name: string; winnerLabel: string | null }[];
      teams: { name: string; color: string; points: number }[];
    } | null =
      action === "finish"
        ? { attendance: 0, xpAwarded: 0, challenges: [], teams: [] }
        : null;

    if (action === "finish" && completion) {
      const checkedIn = await this.prisma.attendanceEvent.findMany({
        where: { sessionId: session.id, status: { not: "voided" } },
        select: { userId: true },
      });
      const unique = [...new Set(checkedIn.map((a) => a.userId))];
      completion.attendance = unique.length;
      const xpCode = updated.kidsMode
        ? "kids.participation"
        : "class.completed";
      for (const userId of unique) {
        const result = await this.progression.awardByCode({
          userId,
          code: xpCode,
          source: "class_complete",
          sessionId: session.id,
          idempotencyKey: `${xpCode}:${session.id}:${userId}`,
          metadata: { awardedBy: auth.sub },
        });
        if (result.awarded) {
          xpAwarded += result.delta;
          completion.xpAwarded += result.delta;
        }
      }
      const [challenges, teams] = await Promise.all([
        this.prisma.challengeInstance.findMany({
          where: { sessionId: session.id },
          take: 10,
        }),
        this.prisma.classTeam.findMany({
          where: { sessionId: session.id },
          orderBy: { points: "desc" },
        }),
      ]);
      completion.challenges = challenges.map((c) => ({
        name: c.name,
        winnerLabel: c.winnerLabel,
      }));
      completion.teams = teams.map((t) => ({
        name: t.name,
        color: t.color,
        points: t.points,
      }));
    }

    return {
      session: {
        id: session.id,
        title: session.title,
      },
      live: serializeLive(updated, now, this.workoutFromLive(updated)),
      xpAwarded,
      completion,
    };
  }

  @Post("notes")
  @UseGuards(AuthGuard)
  async createNote(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { athleteId?: string; sessionId?: string; body?: string },
  ) {
    requireCoachOps(auth);
    const athleteId = body.athleteId?.trim();
    const text = body.body?.trim();
    if (!athleteId || !text) {
      throw new BadRequestException("athleteId and body required");
    }
    if (body.sessionId) {
      await this.assertSessionAccess(body.sessionId, auth);
    }
    const note = await this.prisma.coachNote.create({
      data: {
        athleteId,
        authorId: auth.sub,
        sessionId: body.sessionId,
        body: text,
      },
    });
    return { note };
  }

  @Post("assessments")
  @UseGuards(AuthGuard)
  async createAssessment(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      athleteId?: string;
      sessionId?: string;
      category?: string;
      score?: number;
      level?: string;
      notes?: string;
      goal?: string;
      recommendedDrill?: string;
      nextAt?: string;
    },
  ) {
    requireCoachOps(auth);
    const athleteId = body.athleteId?.trim();
    const category = body.category?.trim();
    const LEVELS = [
      "LEARNING",
      "DEVELOPING",
      "COMPETENT",
      "ADVANCED",
      "MASTERED",
    ] as const;
    const level = body.level?.trim().toUpperCase();
    let score = Number(body.score);
    if (level && LEVELS.includes(level as (typeof LEVELS)[number])) {
      score = LEVELS.indexOf(level as (typeof LEVELS)[number]) + 1;
    }
    if (!athleteId || !category || !Number.isFinite(score)) {
      throw new BadRequestException(
        "athleteId, category, and score or level required",
      );
    }
    if (score < 1 || score > 5) {
      throw new BadRequestException("score must be 1–5");
    }
    if (body.sessionId) {
      await this.assertSessionAccess(body.sessionId, auth);
    }
    const assessment = await this.prisma.coachAssessment.create({
      data: {
        athleteId,
        authorId: auth.sub,
        sessionId: body.sessionId,
        category: category.toLowerCase(),
        score,
        level: level && LEVELS.includes(level as (typeof LEVELS)[number])
          ? level
          : LEVELS[score - 1],
        notes: body.notes?.trim() || null,
        goal: body.goal?.trim() || null,
        recommendedDrill: body.recommendedDrill?.trim() || null,
        nextAt: body.nextAt ? new Date(body.nextAt) : null,
      },
    });
    return { assessment };
  }

  @Get("athletes/:id/notes")
  @UseGuards(AuthGuard)
  async athleteNotes(
    @Param("id") athleteId: string,
    @CurrentUser() auth: AuthPayload,
    @Query("limit") limitRaw?: string,
  ) {
    requireStaff(auth);
    const take = Math.min(50, Math.max(1, Number(limitRaw) || 20));
    const notes = await this.prisma.coachNote.findMany({
      where: { athleteId },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });
    return {
      notes: notes.map((n) => ({
        id: n.id,
        body: n.body,
        sessionId: n.sessionId,
        createdAt: n.createdAt.toISOString(),
        author: `${n.author.firstName} ${n.author.lastName}`,
      })),
    };
  }

  @Get("sessions/:id/roster")
  @UseGuards(AuthGuard)
  async roster(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    const session = await this.assertSessionAccess(id, auth);
    const bookings = await this.prisma.booking.findMany({
      where: { sessionId: id, status: { not: "cancelled" } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            photoUrl: true,
          },
        },
      },
    });
    const attendance = await this.prisma.attendanceEvent.findMany({
      where: { sessionId: id },
    });
    const attendanceByUser = new Map(attendance.map((a) => [a.userId, a]));

    const roster = await Promise.all(
      bookings.map(async (b) => {
        const att = attendanceByUser.get(b.userId);
        const voided = att?.status === "voided";
        const late =
          !voided &&
          ((att?.lateBySeconds != null && att.lateBySeconds > 600) ||
            att?.status === "late");
        const checkedIn =
          !voided &&
          (Boolean(att && att.status !== "voided") ||
            b.status === "checked_in");
        const priorCount = await this.prisma.attendanceEvent.count({
          where: {
            userId: b.userId,
            status: { not: "voided" },
            ...(att ? { id: { not: att.id } } : {}),
          },
        });
        const streak = await attendanceStreak(this.prisma, b.userId);
        const prog = await this.progression.summary(b.userId);
        const lastNote = await this.prisma.coachNote.findFirst({
          where: { athleteId: b.userId },
          orderBy: { createdAt: "desc" },
          select: { body: true, createdAt: true },
        });
        const lastAssessment = await this.prisma.coachAssessment.findFirst({
          where: { athleteId: b.userId },
          orderBy: { createdAt: "desc" },
          select: { category: true, level: true, score: true },
        });
        return {
          userId: b.userId,
          name: `${b.user.firstName} ${b.user.lastName}`,
          email: b.user.email,
          photoUrl: b.user.photoUrl,
          initials: `${b.user.firstName.charAt(0)}${b.user.lastName.charAt(0)}`,
          bookingStatus: b.status,
          attendanceId: att?.id ?? null,
          checkedIn,
          late,
          noShow: b.status === "no_show",
          voided,
          lateBySeconds: att?.lateBySeconds ?? null,
          checkedInAt: att?.checkedInAt?.toISOString() ?? null,
          xp: prog.xp,
          level: prog.level,
          rank: prog.rank,
          streak,
          recentAttendance: priorCount + (checkedIn ? 1 : 0),
          skillLevel: lastAssessment?.level ?? null,
          lastNote: lastNote?.body?.slice(0, 120) ?? null,
          chips: {
            new: priorCount < 3,
            late,
            streak: streak >= 3 ? streak : 0,
          },
        };
      }),
    );

    return {
      session: {
        id: session.id,
        title: session.title,
        program: session.program.name,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        capacity: session.capacity,
        coachName: session.coach
          ? `${session.coach.firstName} ${session.coach.lastName}`
          : session.coachName,
      },
      roster,
      counts: {
        booked: roster.length,
        checkedIn: roster.filter((r) => r.checkedIn).length,
        late: roster.filter((r) => r.late).length,
        noShow: roster.filter((r) => r.noShow).length,
      },
    };
  }

  @Post("sessions/:id/roster/:userId/present")
  @UseGuards(AuthGuard)
  async markPresent(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const booking = await this.prisma.booking.findFirst({
      where: {
        sessionId: id,
        userId,
        status: { not: "cancelled" },
      },
    });
    if (!booking) {
      throw new BadRequestException("Athlete is not booked for this class");
    }
    const result = await performCheckIn(this.prisma, {
      orgId: auth.orgId,
      memberUserId: userId,
      sessionId: id,
      method: "coach_roster",
      recordedById: auth.sub,
      override: true,
      overrideReason: "Coach one-tap present",
    });
    return {
      ok: true,
      duplicate: Boolean(result.duplicate),
      xpAwarded: result.xpAwarded,
      member: result.member,
      attendanceId: result.attendance.id,
    };
  }

  @Get("games")
  @UseGuards(AuthGuard)
  async listGames(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const games = await this.prisma.gameDefinition.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    return {
      games: games.map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        description: g.description,
        xpWin: g.xpWin,
      })),
    };
  }

  @Post("sessions/:id/games/start")
  @UseGuards(AuthGuard)
  async startGame(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { slug?: string } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const slug = body.slug?.trim() || "bag-battle";
    const definition = await this.prisma.gameDefinition.findUnique({
      where: { slug },
    });
    if (!definition || !definition.active) {
      throw new BadRequestException("Game definition not found");
    }
    await this.prisma.gameSession.updateMany({
      where: { sessionId: id, status: "active" },
      data: { status: "finished", endedAt: new Date() },
    });
    const game = await this.prisma.gameSession.create({
      data: {
        definitionId: definition.id,
        sessionId: id,
        startedById: auth.sub,
        status: "active",
      },
      include: { definition: true },
    });
    // Flip floor TV to leaderboard for game energy
    await this.prisma.liveClassState.upsert({
      where: { sessionId: id },
      create: {
        sessionId: id,
        startedById: auth.sub,
        tvMode: "leaderboard",
        status: "running",
      },
      update: { tvMode: "leaderboard" },
    });
    return {
      game: {
        id: game.id,
        status: game.status,
        slug: game.definition.slug,
        name: game.definition.name,
        xpWin: game.definition.xpWin,
        startedAt: game.startedAt.toISOString(),
      },
    };
  }

  @Get("sessions/:id/games/active")
  @UseGuards(AuthGuard)
  async activeGame(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    await this.assertSessionAccess(id, auth);
    const game = await this.prisma.gameSession.findFirst({
      where: { sessionId: id, status: "active" },
      include: {
        definition: true,
        scores: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { score: "desc" },
        },
      },
    });
    if (!game) return { game: null };
    return {
      game: {
        id: game.id,
        status: game.status,
        slug: game.definition.slug,
        name: game.definition.name,
        xpWin: game.definition.xpWin,
        startedAt: game.startedAt.toISOString(),
        scores: game.scores.map((s) => ({
          userId: s.userId,
          name: `${s.user.firstName} ${s.user.lastName}`,
          score: s.score,
          xpAwarded: s.xpAwarded,
        })),
      },
    };
  }

  @Post("sessions/:id/games/:gameId/score")
  @UseGuards(AuthGuard)
  async scoreGame(
    @Param("id") id: string,
    @Param("gameId") gameId: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { userId?: string; score?: number } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const userId = body.userId?.trim();
    const score = Number(body.score);
    if (!userId || !Number.isFinite(score) || score < 0) {
      throw new BadRequestException("userId and non-negative score required");
    }
    const game = await this.prisma.gameSession.findFirst({
      where: { id: gameId, sessionId: id, status: "active" },
      include: { definition: true },
    });
    if (!game) throw new BadRequestException("Active game not found");
    const row = await this.prisma.gameScore.upsert({
      where: {
        gameSessionId_userId: { gameSessionId: game.id, userId },
      },
      create: {
        gameSessionId: game.id,
        userId,
        score: Math.floor(score),
      },
      update: { score: Math.floor(score) },
    });
    return { score: row };
  }

  @Post("sessions/:id/games/:gameId/finish")
  @UseGuards(AuthGuard)
  async finishGame(
    @Param("id") id: string,
    @Param("gameId") gameId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const game = await this.prisma.gameSession.findFirst({
      where: { id: gameId, sessionId: id },
      include: { definition: true, scores: true },
    });
    if (!game) throw new BadRequestException("Game not found");
    if (game.status === "finished") {
      return { game: { id: game.id, status: "finished" }, xpAwarded: 0 };
    }
    const maxScore = Math.max(0, ...game.scores.map((s) => s.score));
    let xpAwarded = 0;
    const winXp =
      game.definition.xpWin || (await this.progression.deltaFor("game.win"));
    for (const row of game.scores) {
      if (row.score <= 0 || row.score < maxScore) continue;
      const result = await this.progression.award({
        userId: row.userId,
        delta: winXp,
        reason: "game.win",
        source: "coach_award",
        sessionId: id,
        idempotencyKey: `game.win:${game.id}:${row.userId}`,
        metadata: { game: game.definition.slug, score: row.score },
      });
      if (result.awarded) {
        xpAwarded += winXp;
        await this.prisma.gameScore.update({
          where: { id: row.id },
          data: { xpAwarded: winXp },
        });
      }
    }
    await this.prisma.gameSession.update({
      where: { id: game.id },
      data: { status: "finished", endedAt: new Date() },
    });
    await this.prisma.liveClassState.updateMany({
      where: { sessionId: id },
      data: { tvMode: "leaderboard" },
    });
    return {
      game: { id: game.id, status: "finished" },
      xpAwarded,
      winners: game.scores
        .filter((s) => s.score === maxScore && s.score > 0)
        .map((s) => s.userId),
    };
  }

  // ── Stage B: coach XP + achievements ──────────────────────────

  @Get("xp/rules")
  @UseGuards(AuthGuard)
  async xpRules(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const rules = await this.prisma.xpRule.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    });
    return { rules };
  }

  @Post("xp")
  @UseGuards(AuthGuard)
  async awardXp(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      userId?: string;
      code?: string;
      sessionId?: string;
      idempotencyKey?: string;
      note?: string;
    },
  ) {
    requireCoachOps(auth);
    const userId = body.userId?.trim();
    const code = body.code?.trim() || "coach.choice";
    if (!userId) throw new BadRequestException("userId required");
    if (body.sessionId) await this.assertSessionAccess(body.sessionId, auth);
    const key =
      body.idempotencyKey?.trim() ||
      `coach.xp:${code}:${body.sessionId ?? "none"}:${userId}:${Date.now()}`;
    const result = await this.progression.awardByCode({
      userId,
      code,
      source: "coach_award",
      sessionId: body.sessionId,
      idempotencyKey: key,
      metadata: { awardedBy: auth.sub, note: body.note },
    });
    if (body.sessionId) {
      await this.prisma.liveClassState.updateMany({
        where: { sessionId: body.sessionId },
        data: {
          tvMode: "achievement",
          tvMessage: `+${result.delta} XP · Coach's Choice`,
        },
      });
    }
    return {
      awarded: result.awarded,
      duplicate: result.duplicate,
      delta: result.delta,
      reason: code,
    };
  }

  @Post("achievements")
  @UseGuards(AuthGuard)
  async grantAchievement(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      userId?: string;
      badgeCode?: string;
      sessionId?: string;
      awardXp?: boolean;
    },
  ) {
    requireCoachOps(auth);
    const userId = body.userId?.trim();
    const badgeCode = body.badgeCode?.trim();
    if (!userId || !badgeCode) {
      throw new BadRequestException("userId and badgeCode required");
    }
    if (body.sessionId) await this.assertSessionAccess(body.sessionId, auth);
    const badge = await this.prisma.badge.findUnique({
      where: { code: badgeCode },
    });
    if (!badge) throw new BadRequestException("Badge not found");
    let created = false;
    try {
      await this.prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      created = true;
    } catch (err: unknown) {
      if (
        !(
          typeof err === "object" &&
          err &&
          "code" in err &&
          (err as { code?: string }).code === "P2002"
        )
      ) {
        throw err;
      }
    }
    let xp = 0;
    if (created && body.awardXp !== false) {
      const result = await this.progression.awardByCode({
        userId,
        code: "achievement",
        source: "coach_award",
        sessionId: body.sessionId,
        idempotencyKey: `achievement:${badgeCode}:${userId}`,
        metadata: { badge: badgeCode, awardedBy: auth.sub },
      });
      xp = result.awarded ? result.delta : 0;
    }
    if (body.sessionId && created) {
      await this.prisma.liveClassState.updateMany({
        where: { sessionId: body.sessionId },
        data: {
          tvMode: "achievement",
          tvMessage: `${badge.name}${xp ? ` · +${xp} XP` : ""}`,
        },
      });
    }
    return { granted: created, badge: { code: badge.code, name: badge.name }, xp };
  }

  @Get("badges")
  @UseGuards(AuthGuard)
  async listBadges(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const badges = await this.prisma.badge.findMany({ orderBy: { name: "asc" } });
    return { badges };
  }

  @Get("athletes/:id/card")
  @UseGuards(AuthGuard)
  async athleteCard(
    @Param("id") athleteId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    const user = await this.prisma.user.findUnique({
      where: { id: athleteId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        createdAt: true,
        role: true,
      },
    });
    if (!user) throw new BadRequestException("Athlete not found");
    const prog = await this.progression.summary(athleteId);
    const [notes, assessments, badges, recentXp, games] = await Promise.all([
      this.prisma.coachNote.findMany({
        where: { athleteId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { author: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.coachAssessment.findMany({
        where: { athleteId },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      this.prisma.userBadge.findMany({
        where: { userId: athleteId },
        include: { badge: true },
      }),
      this.prisma.xpLedger.findMany({
        where: { userId: athleteId },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      this.prisma.gameScore.findMany({
        where: { userId: athleteId },
        orderBy: { id: "desc" },
        take: 8,
        include: {
          gameSession: {
            include: { definition: true, session: { select: { title: true, startsAt: true } } },
          },
        },
      }),
    ]);
    return {
      athlete: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        photoUrl: user.photoUrl,
        initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
        joinedAt: user.createdAt.toISOString(),
      },
      progression: prog,
      notes: notes.map((n) => ({
        body: n.body,
        author: `${n.author.firstName} ${n.author.lastName}`,
        at: n.createdAt.toISOString(),
      })),
      assessments: assessments.map((a) => ({
        category: a.category,
        level: a.level,
        score: a.score,
        goal: a.goal,
        recommendedDrill: a.recommendedDrill,
        notes: a.notes,
        at: a.createdAt.toISOString(),
      })),
      achievements: badges.map((b) => ({
        code: b.badge.code,
        name: b.badge.name,
        earnedAt: b.earnedAt.toISOString(),
      })),
      recentXp: recentXp.map((x) => ({
        delta: x.delta,
        reason: x.reason,
        at: x.createdAt.toISOString(),
      })),
      games: games.map((g) => ({
        name: g.gameSession.definition.name,
        score: g.score,
        xpAwarded: g.xpAwarded,
        classTitle: g.gameSession.session.title,
        at: g.gameSession.session.startsAt.toISOString(),
      })),
    };
  }

  // ── Stage C: workout templates ────────────────────────────────

  @Get("workouts/templates")
  @UseGuards(AuthGuard)
  async listTemplates(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const templates = await this.prisma.workoutTemplate.findMany({
      orderBy: { name: "asc" },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        kidsMode: t.kidsMode,
        blocks: t.blocks.map((b) => ({
          id: b.id,
          sortOrder: b.sortOrder,
          phase: b.phase,
          title: b.title,
          notes: b.notes,
          durationSec: b.durationSec,
        })),
      })),
    };
  }

  @Post("workouts/templates")
  @UseGuards(AuthGuard)
  async saveTemplate(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      id?: string;
      name?: string;
      description?: string;
      kidsMode?: boolean;
      blocks?: {
        phase?: string;
        title?: string;
        notes?: string;
        durationSec?: number;
      }[];
    },
  ) {
    requireCoachOps(auth);
    const name = body.name?.trim();
    if (!name) throw new BadRequestException("name required");
    const blocks = (body.blocks ?? [])
      .map((b, i) => ({
        sortOrder: i,
        phase: (b.phase || "round").toLowerCase(),
        title: (b.title || `Block ${i + 1}`).trim(),
        notes: (b.notes || "").trim(),
        durationSec: b.durationSec ?? null,
      }))
      .filter((b) => b.title);

    if (body.id) {
      await this.prisma.workoutBlock.deleteMany({
        where: { templateId: body.id },
      });
      const updated = await this.prisma.workoutTemplate.update({
        where: { id: body.id },
        data: {
          name,
          description: body.description?.trim() || "",
          kidsMode: Boolean(body.kidsMode),
          blocks: { create: blocks },
        },
        include: { blocks: { orderBy: { sortOrder: "asc" } } },
      });
      return { template: updated };
    }

    const created = await this.prisma.workoutTemplate.create({
      data: {
        name,
        description: body.description?.trim() || "",
        kidsMode: Boolean(body.kidsMode),
        createdById: auth.sub,
        blocks: { create: blocks },
      },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
    return { template: created };
  }

  @Post("sessions/:id/workout")
  @UseGuards(AuthGuard)
  async attachWorkout(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { templateId?: string; kidsMode?: boolean } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const templateId = body.templateId?.trim();
    if (!templateId) throw new BadRequestException("templateId required");
    const template = await this.prisma.workoutTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new BadRequestException("Template not found");
    const live = await this.prisma.liveClassState.upsert({
      where: { sessionId: id },
      create: {
        sessionId: id,
        startedById: auth.sub,
        workoutTemplateId: templateId,
        blockIndex: 0,
        kidsMode: body.kidsMode ?? template.kidsMode,
      },
      update: {
        workoutTemplateId: templateId,
        blockIndex: 0,
        kidsMode: body.kidsMode ?? template.kidsMode,
      },
      include: {
        workoutTemplate: {
          include: { blocks: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    return {
      live: serializeLive(live, new Date(), this.workoutFromLive(live)),
    };
  }

  // ── Stage D: teams + challenges ───────────────────────────────

  @Get("sessions/:id/teams")
  @UseGuards(AuthGuard)
  async getTeams(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    await this.assertSessionAccess(id, auth);
    const teams = await this.prisma.classTeam.findMany({
      where: { sessionId: id },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { points: "desc" },
    });
    return {
      teams: teams.map((t, i) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        points: t.points,
        rank: i + 1,
        members: t.members.map((m) => ({
          userId: m.user.id,
          name: `${m.user.firstName} ${m.user.lastName}`,
        })),
      })),
    };
  }

  @Post("sessions/:id/teams")
  @UseGuards(AuthGuard)
  async setupTeams(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      teams?: { name: string; color?: string; userIds?: string[] }[];
    } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const specs =
      body.teams?.length
        ? body.teams
        : [
            { name: "RED", color: "red" },
            { name: "BLUE", color: "blue" },
            { name: "BLACK", color: "black" },
            { name: "GOLD", color: "gold" },
          ];
    await this.prisma.classTeamMember.deleteMany({
      where: { team: { sessionId: id } },
    });
    await this.prisma.classTeam.deleteMany({ where: { sessionId: id } });
    for (const spec of specs) {
      const team = await this.prisma.classTeam.create({
        data: {
          sessionId: id,
          name: spec.name.toUpperCase(),
          color: (spec.color || spec.name).toLowerCase(),
        },
      });
      for (const userId of spec.userIds ?? []) {
        await this.prisma.classTeamMember.create({
          data: { teamId: team.id, userId },
        });
      }
    }
    // Auto-split checked-in athletes if no userIds provided
    if (!specs.some((s) => s.userIds?.length)) {
      const checkedIn = await this.prisma.attendanceEvent.findMany({
        where: { sessionId: id, status: { not: "voided" } },
        select: { userId: true },
      });
      const teams = await this.prisma.classTeam.findMany({
        where: { sessionId: id },
      });
      const unique = [...new Set(checkedIn.map((c) => c.userId))];
      for (let i = 0; i < unique.length; i++) {
        const team = teams[i % teams.length];
        if (!team) break;
        await this.prisma.classTeamMember.create({
          data: { teamId: team.id, userId: unique[i]! },
        });
      }
    }
    await this.prisma.liveClassState.updateMany({
      where: { sessionId: id },
      data: { tvMode: "teams" },
    });
    return this.getTeams(id, auth);
  }

  @Post("sessions/:id/teams/:teamId/points")
  @UseGuards(AuthGuard)
  async teamPoints(
    @Param("id") id: string,
    @Param("teamId") teamId: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { delta?: number } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const delta = Math.trunc(Number(body.delta) || 0);
    const team = await this.prisma.classTeam.findFirst({
      where: { id: teamId, sessionId: id },
    });
    if (!team) throw new BadRequestException("Team not found");
    const updated = await this.prisma.classTeam.update({
      where: { id: team.id },
      data: { points: Math.max(0, team.points + delta) },
    });
    await this.prisma.liveClassState.updateMany({
      where: { sessionId: id },
      data: { tvMode: "teams" },
    });
    return { team: updated };
  }

  @Get("sessions/:id/challenges")
  @UseGuards(AuthGuard)
  async listChallenges(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    await this.assertSessionAccess(id, auth);
    const challenges = await this.prisma.challengeInstance.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "desc" },
    });
    return { challenges };
  }

  @Post("sessions/:id/challenges")
  @UseGuards(AuthGuard)
  async startChallenge(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      name?: string;
      type?: string;
      description?: string;
      durationSec?: number;
      xp?: number;
    } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const type = (body.type || "challenge").toLowerCase();
    const allowed = new Set([
      "challenge",
      "team_battle",
      "combo",
      "round",
      "coachs_choice",
    ]);
    if (!allowed.has(type)) {
      throw new BadRequestException("Invalid challenge type");
    }
    await this.prisma.challengeInstance.updateMany({
      where: { sessionId: id, status: "active" },
      data: { status: "finished", endedAt: new Date() },
    });
    const challenge = await this.prisma.challengeInstance.create({
      data: {
        sessionId: id,
        name: body.name?.trim() || type.replace(/_/g, " ").toUpperCase(),
        type,
        status: "active",
        configJson: JSON.stringify({
          description: body.description ?? "",
          durationSec: body.durationSec ?? 180,
          xp: body.xp ?? (await this.progression.deltaFor("coach.choice")),
        }),
      },
    });
    await this.prisma.liveClassState.updateMany({
      where: { sessionId: id },
      data: {
        tvMode: "challenge",
        tvMessage: challenge.name,
      },
    });
    return { challenge };
  }

  @Post("sessions/:id/challenges/:challengeId/finish")
  @UseGuards(AuthGuard)
  async finishChallenge(
    @Param("id") id: string,
    @Param("challengeId") challengeId: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { winnerLabel?: string; winnerUserIds?: string[] } = {},
  ) {
    requireCoachOps(auth);
    await this.assertSessionAccess(id, auth);
    const challenge = await this.prisma.challengeInstance.findFirst({
      where: { id: challengeId, sessionId: id },
    });
    if (!challenge) throw new BadRequestException("Challenge not found");
    let config: { xp?: number } = {};
    try {
      config = JSON.parse(challenge.configJson) as { xp?: number };
    } catch {
      config = {};
    }
    const xpEach = config.xp ?? (await this.progression.deltaFor("coach.choice"));
    let xpAwarded = 0;
    for (const userId of body.winnerUserIds ?? []) {
      const result = await this.progression.award({
        userId,
        delta: xpEach,
        reason: "challenge.win",
        source: "coach_award",
        sessionId: id,
        idempotencyKey: `challenge.win:${challenge.id}:${userId}`,
        metadata: { challenge: challenge.name },
      });
      if (result.awarded) xpAwarded += result.delta;
    }
    const updated = await this.prisma.challengeInstance.update({
      where: { id: challenge.id },
      data: {
        status: "finished",
        endedAt: new Date(),
        winnerLabel: body.winnerLabel?.trim() || null,
      },
    });
    await this.prisma.liveClassState.updateMany({
      where: { sessionId: id },
      data: {
        tvMode: "achievement",
        tvMessage: body.winnerLabel
          ? `Winner: ${body.winnerLabel}`
          : `${challenge.name} complete`,
      },
    });
    return { challenge: updated, xpAwarded };
  }

  // ── Stage E: analytics ────────────────────────────────────────

  @Get("analytics")
  @UseGuards(AuthGuard)
  async analytics(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const thirty = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const coachFilter = canSeeAllSessions(auth)
      ? {}
      : { coachUserId: auth.sub };
    const sessions = await this.prisma.session.findMany({
      where: { startsAt: { gte: thirty }, ...coachFilter },
      include: {
        attendance: { where: { status: { not: "voided" } } },
        bookings: { where: { status: { not: "cancelled" } } },
        challenges: true,
      },
    });
    const classesTaught = sessions.length;
    const totalAttendance = sessions.reduce(
      (n, s) => n + s.attendance.length,
      0,
    );
    const avgAttendance =
      classesTaught === 0
        ? 0
        : Math.round((totalAttendance / classesTaught) * 10) / 10;
    const challengeParticipation = sessions.reduce(
      (n, s) => n + s.challenges.length,
      0,
    );
    const achievements = await this.prisma.userBadge.count({
      where: { earnedAt: { gte: thirty } },
    });
    const byDay = new Map<string, number>();
    for (const s of sessions) {
      const key = s.startsAt.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + s.attendance.length);
    }
    return {
      windowDays: 30,
      classesTaught,
      averageAttendance: avgAttendance,
      totalAttendance,
      challengeParticipation,
      achievementsGranted: achievements,
      attendanceTrend: [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    };
  }
}
