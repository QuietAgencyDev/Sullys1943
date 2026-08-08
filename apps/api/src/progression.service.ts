import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export const BOXING_RANKS = [
  "Prospect",
  "Contender",
  "Challenger",
  "Champion",
  "Legacy",
] as const;

/** Fallback deltas if XpRule rows are missing (seed should always create them). */
const DEFAULT_XP: Record<string, number> = {
  "attendance.checked_in": 10,
  "class.completed": 25,
  "coach.choice": 15,
  "skill.milestone": 20,
  "personal.best": 20,
  teamwork: 10,
  achievement: 15,
  "game.win": 15,
  "kids.participation": 10,
};

@Injectable()
export class ProgressionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  levelFromXp(xp: number) {
    return Math.floor(Math.max(0, xp) / 100) + 1;
  }

  rankFromLevel(level: number) {
    if (level >= 40) return BOXING_RANKS[4];
    if (level >= 25) return BOXING_RANKS[3];
    if (level >= 15) return BOXING_RANKS[2];
    if (level >= 8) return BOXING_RANKS[1];
    return BOXING_RANKS[0];
  }

  progressTowardNext(xp: number) {
    const level = this.levelFromXp(xp);
    const floor = (level - 1) * 100;
    const nextAt = level * 100;
    const into = xp - floor;
    const span = nextAt - floor;
    return {
      level,
      xpToNextLevel: Math.max(0, nextAt - xp),
      progressPct: Math.min(100, Math.round((into / span) * 100)),
      nextLevelAt: nextAt,
    };
  }

  async totalXp(userId: string) {
    const agg = await this.prisma.xpLedger.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    return agg._sum.delta ?? 0;
  }

  async summary(userId: string) {
    const xp = await this.totalXp(userId);
    const progress = this.progressTowardNext(xp);
    return {
      xp,
      rank: this.rankFromLevel(progress.level),
      ...progress,
    };
  }

  async deltaFor(code: string): Promise<number> {
    const rule = await this.prisma.xpRule.findUnique({ where: { code } });
    if (rule?.active) return rule.delta;
    return DEFAULT_XP[code] ?? 10;
  }

  /**
   * Idempotent XP award. Same idempotencyKey never awards twice.
   */
  async award(opts: {
    userId: string;
    delta: number;
    reason: string;
    source?: string;
    sessionId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }) {
    if (opts.idempotencyKey) {
      const existing = await this.prisma.xpLedger.findUnique({
        where: { idempotencyKey: opts.idempotencyKey },
      });
      if (existing) {
        return { entry: existing, awarded: false, duplicate: true, delta: 0 };
      }
    }

    try {
      const entry = await this.prisma.xpLedger.create({
        data: {
          userId: opts.userId,
          delta: opts.delta,
          reason: opts.reason,
          source: opts.source,
          sessionId: opts.sessionId,
          idempotencyKey: opts.idempotencyKey,
          metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
        },
      });
      await this.prisma.pointsAccount.upsert({
        where: { userId: opts.userId },
        create: { userId: opts.userId, balance: opts.delta },
        update: { balance: { increment: opts.delta } },
      });
      return { entry, awarded: true, duplicate: false, delta: opts.delta };
    } catch (err: unknown) {
      if (
        opts.idempotencyKey &&
        typeof err === "object" &&
        err &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        const existing = await this.prisma.xpLedger.findUnique({
          where: { idempotencyKey: opts.idempotencyKey },
        });
        if (existing) {
          return { entry: existing, awarded: false, duplicate: true, delta: 0 };
        }
      }
      throw err;
    }
  }

  async awardByCode(opts: {
    userId: string;
    code: string;
    source?: string;
    sessionId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }) {
    const delta = await this.deltaFor(opts.code);
    return this.award({
      userId: opts.userId,
      delta,
      reason: opts.code,
      source: opts.source ?? "coach_award",
      sessionId: opts.sessionId,
      idempotencyKey: opts.idempotencyKey,
      metadata: opts.metadata,
    });
  }
}
