import type { PrismaService } from "./prisma.service";

const WINDOW_MS = 30 * 60 * 1000;

/**
 * Pick the best session for an unattended check-in when none was chosen:
 * 1) Member booking live or starting within ±30 min
 * 2) Nearest currently live class
 * 3) null → open gym
 */
export async function resolveSessionForMember(
  prisma: PrismaService,
  userId: string,
  now = new Date(),
): Promise<string | null> {
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const windowEnd = new Date(now.getTime() + WINDOW_MS);

  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      status: { in: ["confirmed", "checked_in", "waitlisted"] },
      session: {
        OR: [
          { startsAt: { lte: now }, endsAt: { gte: now } },
          { startsAt: { gte: windowStart, lte: windowEnd } },
        ],
      },
    },
    include: { session: true },
    orderBy: { session: { startsAt: "asc" } },
  });
  if (booking?.sessionId) return booking.sessionId;

  const live = await prisma.session.findFirst({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { startsAt: "asc" },
  });
  return live?.id ?? null;
}
