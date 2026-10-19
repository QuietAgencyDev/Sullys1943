import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = await prisma.user.updateMany({
  where: { email: "member@sullys.local" },
  data: { firstName: "Gavin", lastName: "Sheppard" },
});

const sigs = await prisma.signature.updateMany({
  where: { typedName: { contains: "Gavin" } },
  data: { typedName: "Gavin Sheppard" },
});

console.log("Updated users:", users.count, "signatures:", sigs.count);
await prisma.$disconnect();
