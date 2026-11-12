/**
 * Adds Jacob and Jesse as front-desk logins on the live gym.
 * Does not change class sessions or existing passwords.
 * Usage from apps/api: npx tsx prisma/ensure-desk-staff.ts
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DESK_STAFF } from "../../web/src/lib/floor-schedule";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("Set SEED_PASSWORD to 12 or more characters.");
  }
  const org = await prisma.organization.findFirst({
    where: { slug: "sullys" },
  });
  if (!org) throw new Error("Sully's organization was not found.");

  const passwordHash = await bcrypt.hash(password, 10);
  for (const entry of DESK_STAFF) {
    const email = `${entry.emailLocal}@sullys.local`;
    const existing = await prisma.user.findFirst({
      where: { organizationId: org.id, email },
    });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: entry.firstName,
          lastName: entry.lastName,
          role: "front_desk",
          title: entry.title,
          disabledAt: null,
        },
      });
      console.log(`updated ${email}`);
    } else {
      await prisma.user.create({
        data: {
          organizationId: org.id,
          email,
          passwordHash,
          firstName: entry.firstName,
          lastName: entry.lastName,
          role: "front_desk",
          title: entry.title,
          invitedAt: new Date(),
          points: { create: { balance: 0 } },
        },
      });
      console.log(`added ${email}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
