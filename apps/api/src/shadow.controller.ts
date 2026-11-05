import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard, CurrentUser, type AuthPayload } from "./auth/auth.guard";
import { PrismaService } from "./prisma.service";
import {
  judgeShadowRound,
  type ShadowCounts,
  type ShadowStance,
} from "./shadow-round";

const STAFF = new Set(["owner", "admin", "coach", "front_desk"]);

function ageYears(dob: Date, now = new Date()) {
  let age = now.getFullYear() - dob.getFullYear();
  const month = now.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

function torontoDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function clampCount(value: unknown, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, Math.round(n));
}

@Controller("shadow")
@UseGuards(AuthGuard)
export class ShadowController {
  constructor(private readonly prisma: PrismaService) {}

  private async member(auth: AuthPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      select: { id: true, role: true, dateOfBirth: true, organizationId: true },
    });
    if (!user) throw new ForbiddenException("Sign in again.");
    return user;
  }

  private assertAdult(
    user: { role: string; dateOfBirth: Date | null },
    adultConfirmed: boolean,
  ) {
    if (user.role === "child") {
      throw new ForbiddenException(
        "Youth training stays with the coach on the floor.",
      );
    }
    if (user.dateOfBirth && ageYears(user.dateOfBirth) < 18) {
      throw new ForbiddenException(
        "This round is for members 18 and over. Youth training stays with the coach.",
      );
    }
    if (!user.dateOfBirth && !adultConfirmed) {
      throw new ForbiddenException("Confirm you are 18 or older to start.");
    }
  }

  @Get("eligibility")
  async eligibility(@CurrentUser() auth: AuthPayload) {
    const user = await this.member(auth);
    if (user.role === "child") {
      return {
        allowed: false,
        needsAdultConfirm: false,
        reason: "Youth training stays with the coach on the floor.",
      };
    }
    if (user.dateOfBirth && ageYears(user.dateOfBirth) < 18) {
      return {
        allowed: false,
        needsAdultConfirm: false,
        reason: "This round is for members 18 and over.",
      };
    }
    return {
      allowed: true,
      needsAdultConfirm: !user.dateOfBirth,
      reason: null,
    };
  }

  @Get("rounds")
  async mine(@CurrentUser() auth: AuthPayload) {
    const rows = await this.prisma.shadowRound.findMany({
      where: { userId: auth.sub },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return rows.map(present);
  }

  @Post("rounds")
  async save(@CurrentUser() auth: AuthPayload, @Body() body: Record<string, unknown>) {
    const blocked = ["video", "image", "frames64", "landmarks", "audio", "blob"];
    if (blocked.some((key) => key in body)) {
      throw new BadRequestException("The round stores the read, not the film.");
    }
    const user = await this.member(auth);
    const adultConfirmed = body.adultConfirmed === true;
    this.assertAdult(user, adultConfirmed);

    const stance: ShadowStance = body.stance === "southpaw" ? "southpaw" : "orthodox";
    const engine =
      body.engine === "timer-v1" ? "timer-v1" : "mediapipe-pose-v1";
    const modelId =
      typeof body.modelId === "string" && body.modelId.trim()
        ? body.modelId.trim().slice(0, 48)
        : "mediapipe-pose-lite-v1";
    const counts: ShadowCounts = {
      engine,
      stance,
      durationSec: clampCount(body.durationSec, 180) || 40,
      frames: clampCount(body.frames, 4000),
      visibleFrames: clampCount(body.visibleFrames, 4000),
      guardLowFrames: clampCount(body.guardLowFrames, 4000),
      feetNarrowFrames: clampCount(body.feetNarrowFrames, 4000),
      chinUpFrames: clampCount(body.chinUpFrames, 4000),
      punches: clampCount(body.punches, 400),
      jabs: clampCount(body.jabs, 400),
      crosses: clampCount(body.crosses, 400),
      hooks: clampCount(body.hooks, 400),
      uppercuts: clampCount(body.uppercuts, 400),
      shortStraights: clampCount(body.shortStraights, 400),
      missedReturns: clampCount(body.missedReturns, 400),
    };
    const read = judgeShadowRound(counts);
    const row = await this.prisma.shadowRound.create({
      data: {
        userId: user.id,
        ...counts,
        modelId,
        signalsJson: cleanSignals(body.signals),
        signal: read.signal,
        correction: read.correction,
        drillTitle: read.drillTitle,
        drillSteps: JSON.stringify(read.drillSteps),
      },
    });

    let xpAwarded = 0;
    const key = `shadow_round:${user.id}:${torontoDay()}`;
    try {
      await this.prisma.xpLedger.create({
        data: {
          userId: user.id,
          delta: 10,
          reason: "Shadow round",
          source: "shadow_round",
          idempotencyKey: key,
        },
      });
      xpAwarded = 10;
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

    return { round: present(row), xpAwarded };
  }

  @Get("review")
  async review(@CurrentUser() auth: AuthPayload) {
    if (!STAFF.has(auth.role)) throw new ForbiddenException("Staff only.");
    const rows = await this.prisma.shadowRound.findMany({
      where: { user: { organizationId: auth.orgId } },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        user: { select: { firstName: true, lastName: true, role: true } },
      },
    });
    return rows.map((row) => ({
      ...present(row),
      name: `${row.user.firstName} ${row.user.lastName}`.trim(),
      role: row.user.role,
    }));
  }

  @Post("rounds/:id/review")
  async mark(
    @CurrentUser() auth: AuthPayload,
    @Param("id") id: string,
    @Body() body: { coachStatus?: string; coachNote?: string },
  ) {
    if (!STAFF.has(auth.role)) throw new ForbiddenException("Staff only.");
    const status = body.coachStatus === "replaced" ? "replaced" : "confirmed";
    const note = body.coachNote?.trim().slice(0, 500) || null;
    const existing = await this.prisma.shadowRound.findFirst({
      where: { id, user: { organizationId: auth.orgId } },
    });
    if (!existing) throw new NotFoundException();
    const row = await this.prisma.shadowRound.update({
      where: { id },
      data: { coachStatus: status, coachNote: note, reviewedById: auth.sub },
    });
    return present(row);
  }
}

function cleanSignals(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "{}";
  const out: Record<string, number | string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!/^[a-zA-Z][a-zA-Z0-9]{0,24}$/.test(key)) continue;
    if (typeof raw === "number" && Number.isFinite(raw)) {
      out[key] = Math.round(raw * 1000) / 1000;
    } else if (typeof raw === "string" && raw.length > 0 && raw.length <= 40) {
      out[key] = raw;
    }
  }
  const text = JSON.stringify(out);
  return text.length > 4000 ? "{}" : text;
}

function present(row: {
  id: string;
  engine: string;
  stance: string;
  durationSec: number;
  punches: number;
  jabs: number;
  crosses: number;
  hooks: number;
  uppercuts: number;
  signal: string;
  correction: string;
  drillTitle: string;
  drillSteps: string;
  coachStatus: string;
  coachNote: string | null;
  createdAt: Date;
}) {
  let steps: string[] = [];
  try {
    const parsed = JSON.parse(row.drillSteps);
    if (Array.isArray(parsed)) steps = parsed.map(String);
  } catch {
    steps = [];
  }
  return {
    id: row.id,
    engine: row.engine,
    stance: row.stance,
    durationSec: row.durationSec,
    punches: row.punches,
    jabs: row.jabs,
    crosses: row.crosses,
    hooks: row.hooks,
    uppercuts: row.uppercuts,
    signal: row.signal,
    correction: row.correction,
    drillTitle: row.drillTitle,
    drillSteps: steps,
    coachStatus: row.coachStatus,
    coachNote: row.coachNote,
    createdAt: row.createdAt.toISOString(),
  };
}
