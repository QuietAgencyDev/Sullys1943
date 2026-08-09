import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const today = new Date();
const start = new Date(today);
start.setHours(0, 0, 0, 0);
const end = new Date(start);
end.setDate(end.getDate() + 1);
const sessions = await p.session.findMany({
  where: { startsAt: { gte: start, lt: end } },
  orderBy: { startsAt: "asc" },
  select: { id: true, title: true, startsAt: true, coachName: true },
});
console.log(JSON.stringify(sessions, null, 2));
await p.$disconnect();
