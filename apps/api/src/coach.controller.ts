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
    updatedAt: Date;
  } | null,
  now = new Date(),
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
      syncedToCoach: false,
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
    secondsLeft = live.phase === "work" ? live.workSec : live.restSec;
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
    syncedToCoach: live.status === "running" || live.status === "paused",
    phaseEndsAt: live.phaseEndsAt?.toISOString() ?? null,
    updatedAt: live.updatedAt.toISOString(),
  };
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
        liveState: true,
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
      },
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
      },
      live: serializeLive(session.liveState),
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
          workSec: Math.max(30, body.workSec ?? 180),
          restSec: Math.max(15, body.restSec ?? 60),
          totalRounds: Math.max(1, body.totalRounds ?? 12),
        },
      });
    }

    const workSec = Math.max(30, body.workSec ?? live.workSec);
    const restSec = Math.max(15, body.restSec ?? live.restSec);
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
        data = {
          ...data,
          status: "running",
          phase: "work",
          round: 1,
          phaseEndsAt: new Date(now.getTime() + workSec * 1000),
          pausedRemainSec: null,
          startedById: auth.sub,
          tvMode: body.tvMode ?? "timer",
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
        if (phase === "work") {
          phase = "rest";
        } else {
          phase = "work";
          round = Math.min(totalRounds, round + 1);
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
        data = {
          ...data,
          tvMode: body.tvMode ?? live.tvMode,
        };
        break;
      }
      case "finish": {
        data = {
          ...data,
          status: "finished",
          phaseEndsAt: null,
          pausedRemainSec: 0,
          tvMode: body.tvMode ?? "leaderboard",
        };
        break;
      }
      case "config": {
        data = { ...data, tvMode: body.tvMode ?? live.tvMode };
        break;
      }
      default:
        throw new BadRequestException(
          "Unknown action. Use start|pause|resume|next|back|rest|round|finish|tv|config",
        );
    }

    const updated = await this.prisma.liveClassState.update({
      where: { sessionId: session.id },
      data,
    });

    let xpAwarded = 0;
    if (action === "finish") {
      const checkedIn = await this.prisma.attendanceEvent.findMany({
        where: { sessionId: session.id, status: { not: "voided" } },
        select: { userId: true },
      });
      const unique = [...new Set(checkedIn.map((a) => a.userId))];
      for (const userId of unique) {
        const result = await this.progression.award({
          userId,
          delta: 25,
          reason: "class.completed",
          source: "class_complete",
          sessionId: session.id,
          idempotencyKey: `class.completed:${session.id}:${userId}`,
          metadata: { awardedBy: auth.sub },
        });
        if (result.awarded) xpAwarded += 25;
      }
    }

    return {
      session: {
        id: session.id,
        title: session.title,
      },
      live: serializeLive(updated, now),
      xpAwarded,
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
      notes?: string;
    },
  ) {
    requireCoachOps(auth);
    const athleteId = body.athleteId?.trim();
    const category = body.category?.trim();
    const score = Number(body.score);
    if (!athleteId || !category || !Number.isFinite(score)) {
      throw new BadRequestException("athleteId, category, score required");
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
        category,
        score,
        notes: body.notes?.trim() || null,
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
}
