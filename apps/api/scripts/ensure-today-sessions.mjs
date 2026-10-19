import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
function atHour(d, h, m) {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x;
}
const sessions = await p.session.findMany({
  orderBy: { startsAt: "desc" },
  take: 8,
  select: { id: true, title: true, startsAt: true, coachName: true, coachUserId: true },
});
console.log("recent", sessions.map(s => ({ title: s.title, startsAt: s.startsAt.toISOString(), coach: s.coachName })));
const tony = await p.user.findFirst({ where: { email: "coach@sullys.local" } });
const loc = await p.location.findFirst();
const prog = await p.program.findFirst({ where: { kind: "adult" } });
const room = await p.room.findFirst();
if (!tony || !loc || !prog || !room) throw new Error("missing refs");
const today = new Date();
const existing = await p.session.findFirst({
  where: {
    title: "Beginner Boxing",
    startsAt: { gte: atHour(today, 0, 0), lt: atHour(today, 23, 59) },
  },
});
if (existing) {
  console.log("today beginner already", existing.id);
} else {
  const created = await p.session.create({
    data: {
      locationId: loc.id,
      programId: prog.id,
      roomId: room.id,
      title: "Beginner Boxing",
      startsAt: atHour(today, 12, 0),
      endsAt: atHour(today, 13, 0),
      capacity: 16,
      coachName: "Tony Morrison",
      coachUserId: tony.id,
    },
  });
  console.log("created beginner", created.id);
}
// also ensure a live-now style class covering current hour for demo
const now = new Date();
const liveStart = new Date(now.getTime() - 15 * 60 * 1000);
const liveEnd = new Date(now.getTime() + 45 * 60 * 1000);
const live = await p.session.create({
  data: {
    locationId: loc.id,
    programId: prog.id,
    roomId: room.id,
    title: "Demo Live Class",
    startsAt: liveStart,
    endsAt: liveEnd,
    capacity: 20,
    coachName: "Tony Morrison",
    coachUserId: tony.id,
  },
});
console.log("created live demo", live.id, liveStart.toISOString(), liveEnd.toISOString());
await p.$disconnect();
