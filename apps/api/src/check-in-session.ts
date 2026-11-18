import type { PrismaService } from "./prisma.service";

const WINDOW_MS = 30 * 60 * 1000;

/**
 * The class this member actually booked, live now or starting within ±30 min.
 * A scan does not get dropped onto whichever class happens to be live.
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
    orderBy: { session: { startsAt: "asc" } },
  });
  return booking?.sessionId ?? null;
}
