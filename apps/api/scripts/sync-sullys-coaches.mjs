/**
 * Upsert official Sully's trainers into the DB (from sullysboxinggym.com/trainers).
 * Usage (from apps/api): node scripts/sync-sullys-coaches.mjs
 * Requires DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROSTER = [
  {
    email: "coach@sullys.local",
    firstName: "Tony",
    lastName: "Morrison",
    title: "1991 Canadian Heavyweight Champion",
    bio: "Tony Morrison, the former Canadian Heavyweight Champion who held the title in 1991, brings years of experience in the ring and as a trainer. Whether you’re a seasoned athlete or just starting out, Tony’s guidance helps you reach your full potential.",
    photoUrl: "/coaches/tony-morrison.jpg",
    sort: 0,
  },
  {
    email: "coach.rico@sullys.local",
    firstName: "Rico",
    lastName: "Mancini",
    title: "Boxing Canada Competitive Coach",
    bio: "Rico prepares prospective fighters for competitive matches with a meticulous focus on mechanics and technique. His regimen covers mobility, strength, HIIT, ring, pad, and sparring work.",
    photoUrl: "/coaches/rico-mancini.jpg",
    sort: 1,
  },
  {
    email: "coach.winslow@sullys.local",
    firstName: "Winslow",
    lastName: "",
    title: "Technical Boxing Coach",
    bio: "Known for attention to detail and emphasis on footwork and weight shifting. You’ll find him at Sully’s at night training youth fighters — ask for help and he’ll teach you step by step.",
    photoUrl: "/coaches/winslow.jpg",
    sort: 2,
  },
  {
    email: "coach.jonathan@sullys.local",
    firstName: "Jonathan",
    lastName: "Bochner",
    title: "Chartered Professional Boxing Coach",
    bio: "Jonathan brings three decades in boxing, 172 bouts, and training under high-performance and Olympic coaches. Former Canadian Champion, Chartered Professional Coach (ChPc), AIBA 1-star Coach, and former Team Canada coach.",
    photoUrl: "/coaches/jonathan-bochner.jpg",
    sort: 3,
  },
  {
    email: "coach.anthony@sullys.local",
    firstName: "Anthony",
    lastName: "Sky",
    title: "Professional Boxing Coach (Novice – Fighters)",
    bio: "A Downtown Toronto native who started boxing at 13, Anthony supports athletes at every stage — sharing the mindset and craft that keep the next generation of boxers sharp.",
    photoUrl: "/coaches/anthony-sky.jpg",
    sort: 4,
  },
  {
    email: "coach.lauren@sullys.local",
    firstName: "Lauren",
    lastName: "Ramesbottom",
    title: "Boxing & Fitness Instructor",
    bio: "Lauren guides participants of all levels through boxing fundamentals and strength training. Her classes and private lessons blend conditioning, movement patterns, and intentional pad work.",
    photoUrl: "/coaches/lauren-ramesbottom.jpg",
    sort: 5,
  },
  {
    email: "coach.jacklyne@sullys.local",
    firstName: "Jacklyne",
    lastName: "Irvine",
    title: "Boxing & Fitness Instructor",
    bio: "An undefeated amateur boxer from Toronto, Jacklyne coaches technique, form, and mental toughness in a supportive, challenging environment that brings out the best in her athletes.",
    photoUrl: "/coaches/jacklyne-irvine.jpg",
    sort: 6,
  },
  {
    email: "coach.jack@sullys.local",
    firstName: "Jack",
    lastName: "Hemmings",
    title: "Boxing & Fitness Instructor",
    bio: "Jack has 9+ years in the sport, 50+ amateur tournaments, and is a 3x Ontario Champion. As a pro he is 5-1 with all wins by knockout — still chasing excellence every round.",
    photoUrl: "/coaches/jack-hemmings.jpg",
    sort: 7,
  },
];

/** Old demo placeholders to retire from the public directory */
const RETIRE = ["coach.maria@sullys.local", "coach.jamal@sullys.local"];

async function main() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!org) throw new Error("No organization found");

  const passwordHash = await bcrypt.hash("password123", 10);
  const ids = {};

  for (const c of ROSTER) {
    const user = await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: c.email,
        },
      },
      create: {
        organizationId: org.id,
        email: c.email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName || " ",
        role: "coach",
        title: c.title,
        bio: c.bio,
        photoUrl: c.photoUrl,
        points: { create: { balance: 0 } },
      },
      update: {
        firstName: c.firstName,
        lastName: c.lastName || " ",
        role: "coach",
        title: c.title,
        bio: c.bio,
        photoUrl: c.photoUrl,
        disabledAt: null,
      },
    });
    ids[c.email] = user.id;
    console.log(`✓ ${c.firstName} ${c.lastName}`.trim(), c.email);
  }

  for (const email of RETIRE) {
    const r = await prisma.user.updateMany({
      where: { email },
      data: { disabledAt: new Date(), role: "member" },
    });
    if (r.count) console.log(`– retired ${email}`);
  }

  // Point demo sessions at real coaches when titles match
  const tony = ids["coach@sullys.local"];
  const rico = ids["coach.rico@sullys.local"];
  const winslow = ids["coach.winslow@sullys.local"];
  const lauren = ids["coach.lauren@sullys.local"];

  if (tony) {
    await prisma.session.updateMany({
      where: { title: { in: ["Beginner Boxing", "Open Gym"] } },
      data: { coachUserId: tony, coachName: "Tony Morrison" },
    });
  }
  if (rico) {
    await prisma.session.updateMany({
      where: { title: "Competitive Team" },
      data: { coachUserId: rico, coachName: "Rico Mancini" },
    });
  }
  if (winslow) {
    await prisma.session.updateMany({
      where: { title: "Kids Boxing" },
      data: { coachUserId: winslow, coachName: "Winslow" },
    });
  }
  if (lauren) {
    await prisma.session.updateMany({
      where: { title: "Women's Boxing" },
      data: { coachUserId: lauren, coachName: "Lauren Ramesbottom" },
    });
  }

  console.log("\nDone. Public directory: GET /api/v1/portal/coaches");
  console.log("Demo login still: coach@sullys.local / password123 (Tony Morrison)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
