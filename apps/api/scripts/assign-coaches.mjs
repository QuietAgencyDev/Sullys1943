import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const alex = await p.user.findFirst({ where: { email: "coach@sullys.local" } });
const maria = await p.user.findFirst({
  where: { email: "coach.maria@sullys.local" },
});
const jamal = await p.user.findFirst({
  where: { email: "coach.jamal@sullys.local" },
});

if (!alex || !maria || !jamal) {
  console.error("missing coaches");
  process.exit(1);
}

const kids = await p.session.updateMany({
  where: { title: "Kids Boxing" },
  data: { coachUserId: maria.id, coachName: "Maria Reyes" },
});
const competitive = await p.session.updateMany({
  where: { title: "Competitive Team" },
  data: { coachUserId: jamal.id, coachName: "Jamal Wright" },
});

console.log(
  JSON.stringify({
    kids: kids.count,
    competitive: competitive.count,
    alexKept: true,
  }),
);

await p.$disconnect();
