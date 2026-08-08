/**
 * Non-destructive seed for Coach Command Center evolution (XpRule, badges, games, template).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const xpRules = [
    { code: "attendance.checked_in", label: "Check-in", delta: 10 },
    { code: "class.completed", label: "Class complete", delta: 25 },
    { code: "coach.choice", label: "Coach's Choice", delta: 15 },
    { code: "skill.milestone", label: "Skill milestone", delta: 20 },
    { code: "personal.best", label: "Personal best", delta: 20 },
    { code: "teamwork", label: "Teamwork", delta: 10 },
    { code: "achievement", label: "Achievement", delta: 15 },
    { code: "game.win", label: "Game win", delta: 15 },
    { code: "kids.participation", label: "Kids participation", delta: 10 },
  ];
  for (const rule of xpRules) {
    await prisma.xpRule.upsert({
      where: { code: rule.code },
      create: rule,
      update: { label: rule.label, delta: rule.delta, active: true },
    });
  }

  for (const g of [
    {
      slug: "bag-battle",
      name: "Bag Battle",
      description: "In-class heavy-bag scoring.",
      xpWin: 15,
    },
    {
      slug: "combo-rush",
      name: "Combo Challenge",
      description: "Clean combinations under the clock.",
      xpWin: 12,
    },
    {
      slug: "team-battle",
      name: "Team Battle",
      description: "Coach awards team points live.",
      xpWin: 10,
    },
    {
      slug: "kids-quest",
      name: "Kids Quest",
      description: "Youth participation-first scoring.",
      xpWin: 10,
    },
  ]) {
    await prisma.gameDefinition.upsert({
      where: { slug: g.slug },
      create: {
        ...g,
        configJson: "{}",
        active: true,
      },
      update: {
        name: g.name,
        description: g.description,
        xpWin: g.xpWin,
        active: true,
      },
    });
  }

  for (const b of [
    { code: "first_class", name: "First Class", description: "Completed first class" },
    { code: "class_club_10", name: "10 Class Club", description: "10 classes" },
    { code: "class_club_25", name: "25 Class Club", description: "25 classes" },
    { code: "class_club_50", name: "50 Class Club", description: "50 classes" },
    { code: "class_club_100", name: "100 Class Club", description: "100 classes" },
    { code: "streak", name: "Streak", description: "Consistent attendance" },
    { code: "personal_best", name: "Personal Best", description: "Hit a PB" },
    { code: "skill_milestone", name: "Skill Milestone", description: "Coach stamp" },
    { code: "team_player", name: "Team Player", description: "Lifted the room" },
    { code: "coachs_choice", name: "Coach's Choice", description: "Coach recognition" },
  ]) {
    await prisma.badge.upsert({
      where: { code: b.code },
      create: b,
      update: { name: b.name, description: b.description },
    });
  }

  const existing = await prisma.workoutTemplate.findFirst({
    where: { name: "Sully's Boxing Fundamentals" },
  });
  if (!existing) {
    await prisma.workoutTemplate.create({
      data: {
        name: "Sully's Boxing Fundamentals",
        description: "Warmup → five rounds → cooldown",
        blocks: {
          create: [
            { sortOrder: 0, phase: "warmup", title: "WARMUP", notes: "Jump rope + shadow" },
            { sortOrder: 1, phase: "round", title: "ROUND 1 — Jab / Cross", notes: "" },
            { sortOrder: 2, phase: "round", title: "ROUND 2 — Footwork", notes: "" },
            { sortOrder: 3, phase: "round", title: "ROUND 3 — Defense", notes: "" },
            { sortOrder: 4, phase: "round", title: "ROUND 4 — Heavy Bag", notes: "" },
            { sortOrder: 5, phase: "round", title: "ROUND 5 — Combinations", notes: "" },
            { sortOrder: 6, phase: "cooldown", title: "COOLDOWN", notes: "Stretch + breath" },
          ],
        },
      },
    });
  }

  console.log("Coach evolution seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
