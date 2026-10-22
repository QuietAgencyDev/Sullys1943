/**
 * Updates the live Sully's roster and the next 7 days of classes
 * to match apps/web/src/lib/floor-schedule.ts.
 * Does not delete sessions that already have a booking or a check-in.
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import {
  FLOOR_COACHES,
  FLOOR_SLOTS,
  RETIRED_COACH_EMAILS,
  coachDisplayName,
  type FloorSlot,
} from "../../web/src/lib/floor-schedule";

const prisma = new PrismaClient();

function atHour(base: Date, hour: number, minute: number) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function slotKey(startsAt: Date, title: string) {
  return `${startsAt.toISOString()}|${title}`;
}

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: "sullys" },
  });
  if (!org) throw new Error("Sully's organization was not found.");

  const passwordHash = await bcrypt.hash("password123", 10);
  const coachByName = new Map<string, string>();

  for (const entry of FLOOR_COACHES) {
    const email = `${entry.emailLocal}@sullys.local`;
    const existing = await prisma.user.findFirst({
      where: { organizationId: org.id, email },
    });
    const name = coachDisplayName(entry);
    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: entry.firstName,
          lastName: entry.lastName,
          role: "coach",
          title: entry.title,
          bio: entry.bio,
          photoUrl: existing.photoUrl || entry.photoUrl,
          disabledAt: null,
        },
      });
      coachByName.set(name, updated.id);
      console.log(`updated ${name}`);
    } else {
      const created = await prisma.user.create({
        data: {
          organizationId: org.id,
          email,
          passwordHash,
          firstName: entry.firstName,
          lastName: entry.lastName,
          role: "coach",
          title: entry.title,
          bio: entry.bio,
          photoUrl: entry.photoUrl,
          points: { create: { balance: 0 } },
        },
      });
      coachByName.set(name, created.id);
      console.log(`added ${name}`);
    }
  }

  for (const email of RETIRED_COACH_EMAILS) {
    const retired = await prisma.user.findFirst({
      where: { organizationId: org.id, email, disabledAt: null },
    });
    if (!retired) continue;
    await prisma.user.update({
      where: { id: retired.id },
      data: { disabledAt: new Date() },
    });
    console.log(`retired ${retired.firstName} ${retired.lastName}`.trim());
  }

  const location = await prisma.location.findFirst({
    where: { organizationId: org.id },
  });
  const room = location
    ? await prisma.room.findFirst({ where: { locationId: location.id } })
    : null;
  const boxing = await prisma.program.findFirst({
    where: { organizationId: org.id, name: "Boxing" },
  });
  const kids = await prisma.program.findFirst({
    where: { organizationId: org.id, name: "Kids Boxing" },
  });
  if (!location || !boxing || !kids) {
    throw new Error("Location or programs are missing.");
  }

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 14);

  const planned = new Map<string, FloorSlot & { startsAt: Date; endsAt: Date }>();
  for (let i = 0; i < 14; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dow = day.getDay();
    for (const slot of FLOOR_SLOTS) {
      if (slot.day !== dow) continue;
      const startsAt = atHour(day, slot.hour, slot.minute);
      const endsAt = new Date(startsAt.getTime() + slot.minutes * 60_000);
      planned.set(slotKey(startsAt, slot.title), { ...slot, startsAt, endsAt });
    }
  }

  const existing = await prisma.session.findMany({
    where: {
      locationId: location.id,
      startsAt: { gte: weekStart, lt: weekEnd },
    },
    include: {
      bookings: true,
      attendance: true,
    },
  });

  const have = new Set(
    existing.map((session) => slotKey(session.startsAt, session.title)),
  );

  let created = 0;
  for (const [key, slot] of planned) {
    if (have.has(key)) continue;
    await prisma.session.create({
      data: {
        locationId: location.id,
        programId: slot.youth ? kids.id : boxing.id,
        roomId: room?.id,
        title: slot.title,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        capacity:
          slot.youth || slot.tone === "fight" || slot.tone === "sparring"
            ? 12
            : 16,
        coachName: slot.coach,
        coachUserId: slot.coach ? coachByName.get(slot.coach) : undefined,
      },
    });
    created += 1;
  }

  let removed = 0;
  let kept = 0;
  for (const session of existing) {
    if (planned.has(slotKey(session.startsAt, session.title))) continue;
    if (session.bookings.length > 0 || session.attendance.length > 0) {
      kept += 1;
      console.log(`kept booked class ${session.title} ${session.startsAt.toISOString()}`);
      continue;
    }
    try {
      await prisma.session.delete({ where: { id: session.id } });
      removed += 1;
    } catch (err) {
      kept += 1;
      console.log(
        `left ${session.title} in place (${err instanceof Error ? err.message : "in use"})`,
      );
    }
  }

  const active = await prisma.user.count({
    where: { organizationId: org.id, role: "coach", disabledAt: null },
  });
  console.log(
    `coaches ${active}, classes added ${created}, old classes removed ${removed}, left in place ${kept}`,
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
