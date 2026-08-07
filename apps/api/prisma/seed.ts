import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function atHour(base: Date, hour: number, minute = 0) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  await prisma.kitchenOrderItem.deleteMany();
  await prisma.kitchenOrder.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.mealPlanAssignment.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.nutritionProfile.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.legacyTimelineEntry.deleteMany();
  await prisma.checkInCredential.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.xpLedger.deleteMany();
  await prisma.pointsAccount.deleteMany();
  await prisma.attendanceEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.signaturePacket.deleteMany();
  await prisma.documentTemplateVersion.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.membershipMember.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipProduct.deleteMany();
  await prisma.guardianship.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.program.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: {
      name: "Sully's Boxing Gym",
      slug: "sullys",
    },
  });

  const location = await prisma.location.create({
    data: {
      organizationId: org.id,
      name: "Sully's · 1554 Dundas St W",
      timezone: "America/Toronto",
    },
  });

  const room = await prisma.room.create({
    data: {
      locationId: location.id,
      name: "Main Floor",
      capacity: 24,
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "owner@sullys.local",
      passwordHash,
      firstName: "Gym",
      lastName: "Owner",
      role: "owner",
      points: { create: { balance: 0 } },
    },
  });

  const coach = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach@sullys.local",
      passwordHash,
      firstName: "Alex",
      lastName: "Coach",
      role: "coach",
      title: "Head Coach",
      bio: "Alex runs the floor with old-school discipline and modern care — pads, footwork, and the character work that happens between rounds.",
      photoUrl: "/gym/heavy-bag.jpg",
      points: { create: { balance: 0 } },
    },
  });

  const coachMaria = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.maria@sullys.local",
      passwordHash,
      firstName: "Maria",
      lastName: "Reyes",
      role: "coach",
      title: "Youth & Fundamentals",
      bio: "Maria builds first timers and youth athletes — clear cues, high standards, and a gym that feels like home.",
      photoUrl: "/gym/ring-rest.jpg",
      points: { create: { balance: 0 } },
    },
  });

  const coachJamal = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.jamal@sullys.local",
      passwordHash,
      firstName: "Jamal",
      lastName: "Wright",
      role: "coach",
      title: "Performance Coach",
      bio: "Jamal sharpens competitive athletes — sparring prep, conditioning, and the mental game that wins late rounds.",
      photoUrl: "/gym/hero-floor.jpg",
      points: { create: { balance: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "desk@sullys.local",
      passwordHash,
      firstName: "Front",
      lastName: "Desk",
      role: "front_desk",
      points: { create: { balance: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "admin@sullys.local",
      passwordHash,
      firstName: "Ops",
      lastName: "Admin",
      role: "admin",
      invitedAt: new Date(),
      points: { create: { balance: 0 } },
    },
  });

  const member = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "member@sullys.local",
      passwordHash,
      firstName: "Jordan",
      lastName: "Member",
      role: "member",
      points: { create: { balance: 20 } },
    },
  });

  const parent = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "parent@sullys.local",
      passwordHash,
      firstName: "Sam",
      lastName: "Parent",
      role: "parent",
      points: { create: { balance: 0 } },
    },
  });

  const child = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "kid@sullys.local",
      passwordHash,
      firstName: "Emma",
      lastName: "Kid",
      role: "child",
      dateOfBirth: new Date("2015-05-01"),
      points: { create: { balance: 5 } },
    },
  });

  await prisma.guardianship.create({
    data: {
      guardianUserId: parent.id,
      childUserId: child.id,
      relationship: "parent",
    },
  });

  const monthly = await prisma.membershipProduct.create({
    data: {
      organizationId: org.id,
      code: "monthly",
      name: "Monthly Unlimited",
      description: "Unlimited standard classes",
      interval: "monthly",
      priceCents: 14900,
    },
  });

  await prisma.membershipProduct.create({
    data: {
      organizationId: org.id,
      code: "trial",
      name: "Trial Week",
      description: "7-day trial access",
      interval: "one_time",
      priceCents: 2900,
    },
  });

  await prisma.membershipProduct.create({
    data: {
      organizationId: org.id,
      code: "youth",
      name: "Youth Monthly",
      interval: "monthly",
      priceCents: 9900,
    },
  });

  await prisma.membershipProduct.create({
    data: {
      organizationId: org.id,
      code: "drop_in",
      name: "Drop-in class",
      description: "Single-day walk-in access sold at the desk",
      interval: "one_time",
      priceCents: 2500,
    },
  });

  const memberMembership = await prisma.membership.create({
    data: {
      locationId: location.id,
      productId: monthly.id,
      payerUserId: member.id,
      status: "active",
      members: { create: { userId: member.id } },
    },
  });

  await prisma.paymentEvent.create({
    data: {
      membershipId: memberMembership.id,
      provider: "mock",
      externalId: `seed_monthly_${memberMembership.id}`,
      type: "checkout.session",
      status: "completed",
      amountCents: monthly.priceCents,
    },
  });

  const youth = await prisma.membershipProduct.findFirst({
    where: { organizationId: org.id, code: "youth" },
  });
  if (youth) {
    const youthMembership = await prisma.membership.create({
      data: {
        locationId: location.id,
        productId: youth.id,
        payerUserId: parent.id,
        status: "active",
        members: {
          create: [{ userId: parent.id }, { userId: child.id }],
        },
      },
    });
    await prisma.paymentEvent.create({
      data: {
        membershipId: youthMembership.id,
        provider: "mock",
        externalId: `seed_youth_${youthMembership.id}`,
        type: "checkout.session",
        status: "completed",
        amountCents: youth.priceCents,
      },
    });
  }

  const template = await prisma.documentTemplate.create({
    data: {
      organizationId: org.id,
      type: "liability",
      name: "General Liability Waiver",
      versions: {
        create: {
          version: 1,
          status: "active",
          body: `SULLY'S BOXING GYM — GENERAL LIABILITY WAIVER & RELEASE

I acknowledge that boxing, athletic training, and related activities at Sully's Boxing Gym (Sully's Recreation & Athletic Centre) involve inherent risks of injury, including but not limited to strains, fractures, concussion, and rare catastrophic injury.

I agree to:
1. Follow gym rules and coach instructions at all times.
2. Disclose relevant medical conditions that may affect safe participation.
3. Uphold the values of Earl "Sully" Sullivan: no drugs, alcohol, or swearing; show respect for the space, the program, and one another.
4. Accept that staff may refuse or end participation when safety requires it.

I understand that standards without grace becomes judgement, and grace without standards becomes complacency — and that Sully's holds both: expect excellence, not perfection; mistakes are corrected, not condemned.

I release Sully's Boxing Gym, its coaches, staff, board, and volunteers from claims arising from ordinary negligence to the fullest extent permitted by Ontario law, while acknowledging that this release does not waive liability for gross negligence or intentional misconduct where such waiver is prohibited.

For youth participants, a parent or legal guardian must execute this waiver. Electronic signature constitutes acknowledgment equivalent to a handwritten signature for gym records.

Contact: danielle@sullysboxinggym.com · +1-647-284-1510 · sullysboxinggym.com`,
        },
      },
    },
    include: { versions: true },
  });

  const version = template.versions[0]!;
  await prisma.signaturePacket.create({
    data: {
      versionId: version.id,
      subjectUserId: member.id,
      status: "signed",
      signedAt: new Date(),
      signatures: {
        create: {
          signerId: member.id,
          typedName: "Jordan Member",
        },
      },
    },
  });

  await prisma.signaturePacket.create({
    data: {
      versionId: version.id,
      subjectUserId: child.id,
      status: "required",
    },
  });

  const boxing = await prisma.program.create({
    data: {
      organizationId: org.id,
      name: "Boxing",
      kind: "adult",
    },
  });

  const kids = await prisma.program.create({
    data: {
      organizationId: org.id,
      name: "Kids Boxing",
      kind: "youth",
    },
  });

  const today = new Date();
  const sessions = [
    {
      title: "Beginner Boxing",
      programId: boxing.id,
      start: atHour(today, 12, 0),
      end: atHour(today, 13, 0),
      capacity: 16,
      coachUserId: coach.id,
      coachName: "Alex Coach",
    },
    {
      title: "Competitive Team",
      programId: boxing.id,
      start: atHour(today, 18, 0),
      end: atHour(today, 19, 30),
      capacity: 12,
      coachUserId: coachJamal.id,
      coachName: "Jamal Wright",
    },
    {
      title: "Women's Boxing",
      programId: boxing.id,
      start: atHour(today, 19, 0),
      end: atHour(today, 20, 0),
      capacity: 14,
      coachUserId: coach.id,
      coachName: "Alex Coach",
    },
    {
      title: "Kids Boxing",
      programId: kids.id,
      start: atHour(today, 16, 0),
      end: atHour(today, 17, 0),
      capacity: 12,
      coachUserId: coachMaria.id,
      coachName: "Maria Reyes",
    },
  ];

  const createdSessions = [];
  for (const s of sessions) {
    createdSessions.push(
      await prisma.session.create({
        data: {
          locationId: location.id,
          programId: s.programId,
          roomId: room.id,
          title: s.title,
          startsAt: s.start,
          endsAt: s.end,
          capacity: s.capacity,
          coachName: s.coachName,
          coachUserId: s.coachUserId,
        },
      }),
    );
  }

  // Book member into first session for roster demo
  await prisma.booking.create({
    data: {
      sessionId: createdSessions[0]!.id,
      userId: member.id,
      status: "confirmed",
    },
  });

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.session.create({
    data: {
      locationId: location.id,
      programId: boxing.id,
      roomId: room.id,
      title: "Open Gym",
      startsAt: atHour(tomorrow, 17, 30),
      endsAt: atHour(tomorrow, 19, 0),
      capacity: 20,
      coachName: "Alex Coach",
      coachUserId: coach.id,
    },
  });

  await prisma.announcement.create({
    data: {
      organizationId: org.id,
      title: "Fight Night Friday",
      body: "Doors at 6:30 PM. Members free with active card.",
    },
  });

  await prisma.announcement.create({
    data: {
      organizationId: org.id,
      title: "Kitchen Special",
      body: "Chicken Bowl $11.99 — pre-order in the app after class.",
    },
  });

  const firstVisit = await prisma.badge.create({
    data: {
      code: "first_visit",
      name: "First Bell",
      description: "Checked in for the first time",
    },
  });
  await prisma.badge.create({
    data: {
      code: "legacy_keeper",
      name: "Legacy Keeper",
      description: "Visited the Legacy Wall",
    },
  });
  await prisma.userBadge.create({
    data: { userId: member.id, badgeId: firstVisit.id },
  });

  await prisma.xpLedger.create({
    data: { userId: member.id, delta: 70, reason: "seed_balance" },
  });

  await prisma.legacyTimelineEntry.createMany({
    data: [
      {
        organizationId: org.id,
        decade: 1910,
        year: 1914,
        type: "origin",
        title: "Earl O'Sullivan is born",
        body: "Born in Mimico on November 16, 1914. His Irish father kept boxing gloves in the house — Earl and his brothers pretended to be champions long before the gym bore his name.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1930,
        year: null,
        type: "origin",
        title: "Under Deacon Allen",
        body: "Sully boxed under Deacon Allen, a renowned Toronto figure. He was never a top-rated fighter — but he fell in love with the gym and what it could do for people.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1960,
        year: 1964,
        type: "milestone",
        title: "Toronto Athletic Club → Ossington",
        body: "After Deacon Allen's death, Sully purchases the Toronto Athletic Club and moves it from 1290 Queen St. W to 109 Ossington Ave. The emphasis shifts from a pro pipeline to a centre for youth who need a second chance.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1960,
        year: 1966,
        type: "champion",
        title: "Chuvalo vs Ali",
        body: "George Chuvalo goes the distance with Muhammad Ali — a night woven into Canadian boxing lore and into the culture of this gym.",
        sortOrder: 2,
      },
      {
        organizationId: org.id,
        decade: 1970,
        year: null,
        type: "moment",
        title: "Discipline and respect",
        body: "For decades Sully touched thousands of lives. No drinking, swearing, or gambling around him or his Centre. Underprivileged youth trained free. Police, lawyers, judges, and city officials knew him as the man who showed up when a kid needed a second chance.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1990,
        year: null,
        type: "steward",
        title: "Joe Manteiga keeps the doors open",
        body: "One of Sully's youth, Joe Manteiga, becomes a North American Golden Gloves Champion — and never really leaves. When Sully grows ill, Joe cares for him. When Sully passes, Joe honors his final wish and stewards the gym for the next twenty years.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 2010,
        year: null,
        type: "steward",
        title: "Danielle & Phil",
        body: "Joe entrusts the mission to his daughter Danielle Monteiga and her husband Phil Pereira. With a board of directors — many who knew Sully personally — they lead Sully's Recreation & Athletic Centre as a non-profit: boxing and athletics as vehicles to help youth overcome adversity.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 2020,
        year: 2019,
        type: "moment",
        title: "700+ youth served",
        body: "Since the move from Dupont to Dundas St W (with COVID dampening the stretch), Sully's has served 700+ children and youth — still building character one person at a time.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 2020,
        year: 2024,
        type: "moment",
        title: "Digital Performance Platform",
        body: "The next chapter of stewardship: member portal, Gym TV, kitchen, and a living Legacy Wall — so every number keeps a name, and every name keeps a story.",
        sortOrder: 2,
      },
    ],
  });

  const plan = await prisma.mealPlan.create({
    data: {
      organizationId: org.id,
      name: "Fighter Fuel — Cut Week",
      description: "High protein, controlled carbs for fight camp week.",
      daysJson: JSON.stringify([
        {
          day: "Monday",
          meals: [
            { name: "Egg whites + oats", calories: 420, tags: ["breakfast"] },
            { name: "Chicken bowl", calories: 550, tags: ["lunch"] },
            { name: "Salmon + greens", calories: 480, tags: ["dinner"] },
          ],
        },
        {
          day: "Tuesday",
          meals: [
            { name: "Greek yogurt parfait", calories: 380, tags: ["breakfast"] },
            { name: "Turkey wrap", calories: 520, tags: ["lunch"] },
            { name: "Lean beef stir-fry", calories: 540, tags: ["dinner"] },
          ],
        },
      ]),
    },
  });

  await prisma.mealPlanAssignment.create({
    data: { mealPlanId: plan.id, userId: member.id, active: true },
  });

  await prisma.nutritionProfile.create({
    data: {
      userId: member.id,
      goal: "cut",
      allergens: "peanuts",
      notes: "Prefers dairy-light evenings",
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        organizationId: org.id,
        name: "Chicken Bowl",
        description: "Rice, chicken, greens, house sauce",
        priceCents: 1199,
        allergens: "",
      },
      {
        organizationId: org.id,
        name: "Peanut Power Smoothie",
        description: "Banana, whey, peanut butter",
        priceCents: 799,
        allergens: "peanuts,dairy",
      },
      {
        organizationId: org.id,
        name: "Recovery Wrap",
        description: "Turkey, avocado, spinach wrap",
        priceCents: 999,
        allergens: "gluten",
      },
    ],
  });

  console.log("Seeded Sully's flagship data");
  console.log("Logins (password: password123):");
  console.log("  member@sullys.local");
  console.log("  parent@sullys.local");
  console.log("  coach@sullys.local");
  console.log("  desk@sullys.local");
  console.log("  admin@sullys.local");
  console.log("  owner@sullys.local");
  console.log(`Owner id: ${owner.id}, coach id: ${coach.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
