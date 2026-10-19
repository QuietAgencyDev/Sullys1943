import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const u = await prisma.user.findUnique({
  where: { email: "member@sullys.local" },
  select: { firstName: true, lastName: true },
});
console.log(u);
console.log("Display:", `${u.firstName} ${u.lastName?.[0] ?? ""}`.trim());
await prisma.$disconnect();
