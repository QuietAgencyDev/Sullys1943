import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const tony = await p.user.findFirst({ where: { email: "coach@sullys.local" } });
const rico = await p.user.findFirst({
  where: { email: "coach.rico@sullys.local" },
});
const winslow = await p.user.findFirst({
  where: { email: "coach.winslow@sullys.local" },
});
const jacklyne = await p.user.findFirst({
  where: { email: "coach.jacklyne@sullys.local" },
});

if (!tony || !rico || !winslow || !jacklyne) {
  console.error("missing coaches — run sync-sullys-coaches.mjs first");
  process.exit(1);
}

const kids = await p.session.updateMany({
  where: { title: "Kids Boxing" },
  data: { coachUserId: winslow.id, coachName: "Winslow" },
});
const competitive = await p.session.updateMany({
  where: { title: "Competitive Team" },
  data: { coachUserId: rico.id, coachName: "Rico Mancini" },
});
const womens = await p.session.updateMany({
  where: { title: "Women's Boxing" },
  data: { coachUserId: jacklyne.id, coachName: "Jacklyne Irvine" },
});
const beginner = await p.session.updateMany({
  where: { title: { in: ["Beginner Boxing", "Open Gym"] } },
  data: { coachUserId: tony.id, coachName: "Tony Morrison" },
});

console.log(
  JSON.stringify({
    kids: kids.count,
    competitive: competitive.count,
    womens: womens.count,
    beginnerOpen: beginner.count,
  }),
);

await p.$disconnect();
