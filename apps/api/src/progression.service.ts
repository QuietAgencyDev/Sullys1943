import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export const BOXING_RANKS = [
  "Prospect",
  "Contender",
  "Challenger",
  "Champion",
  "Legacy",
] as const;

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

  async totalXp(userId: string) {
    const agg = await this.prisma.xpLedger.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    return agg._sum.delta ?? 0;
  }

  async summary(userId: string) {
    const xp = await this.totalXp(userId);
    const level = this.levelFromXp(xp);
    return { xp, level, rank: this.rankFromLevel(level) };
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
        return { entry: existing, awarded: false, duplicate: true };
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
      return { entry, awarded: true, duplicate: false };
    } catch (err: unknown) {
      // Unique race on idempotencyKey
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
          return { entry: existing, awarded: false, duplicate: true };
        }
      }
      throw err;
    }
  }
}
