/**
 * Sets demo member (Gavin) photoUrl to the static Ippo-style mascot.
 * Run: cd apps/api && node scripts/set-gavin-photo.mjs
 */
import { PrismaClient } from "@prisma/client";

const PHOTO = "/members/gavin-sheppard.png";
const prisma = new PrismaClient();

const result = await prisma.user.updateMany({
  where: { email: "member@sullys.local" },
  data: { photoUrl: PHOTO },
});

console.log(`Updated ${result.count} user(s) → photoUrl=${PHOTO}`);
await prisma.$disconnect();
