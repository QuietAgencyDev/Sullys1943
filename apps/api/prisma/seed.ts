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
  await prisma.commerceOrder.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageParticipant.deleteMany().catch(() => undefined);
  await prisma.messageThread.deleteMany();
  await prisma.gameScore.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.gameDefinition.deleteMany();
  await prisma.classTeamMember.deleteMany();
  await prisma.classTeam.deleteMany();
  await prisma.challengeInstance.deleteMany();
  await prisma.liveClassState.deleteMany();
  await prisma.coachAssessment.deleteMany();
  await prisma.coachNote.deleteMany();
  await prisma.workoutBlock.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.xpRule.deleteMany();
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

  // Official floor roster — https://www.sullysboxinggym.com/trainers/
  const coach = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach@sullys.local",
      passwordHash,
      firstName: "Tony",
      lastName: "Morrison",
      role: "coach",
      title: "1991 Canadian Heavyweight Champion",
      bio: "Tony Morrison, the former Canadian Heavyweight Champion who held the title in 1991, brings years of experience in the ring and as a trainer. Whether you’re a seasoned athlete or just starting out, Tony’s guidance helps you reach your full potential.",
      photoUrl: "/coaches/tony-morrison.jpg",
      points: { create: { balance: 0 } },
    },
  });

  const coachRico = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.rico@sullys.local",
      passwordHash,
      firstName: "Rico",
      lastName: "Mancini",
      role: "coach",
      title: "Boxing Canada Competitive Coach",
      bio: "Rico prepares prospective fighters for competitive matches with a meticulous focus on mechanics and technique. His regimen covers mobility, strength, HIIT, ring, pad, and sparring work.",
      photoUrl: "/coaches/rico-mancini.jpg",
      points: { create: { balance: 0 } },
    },
  });

  const coachWinslow = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.winslow@sullys.local",
      passwordHash,
      firstName: "Winslow",
      lastName: " ",
      role: "coach",
      title: "Technical Boxing Coach",
      bio: "Known for attention to detail and emphasis on footwork and weight shifting. You’ll find him at Sully’s at night training youth fighters — ask for help and he’ll teach you step by step.",
      photoUrl: "/coaches/winslow.jpg",
      points: { create: { balance: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.jonathan@sullys.local",
      passwordHash,
      firstName: "Jonathan",
      lastName: "Bochner",
      role: "coach",
      title: "Chartered Professional Boxing Coach",
      bio: "Jonathan brings three decades in boxing, 172 bouts, and training under high-performance and Olympic coaches. Former Canadian Champion, Chartered Professional Coach (ChPc), AIBA 1-star Coach, and former Team Canada coach.",
      photoUrl: "/coaches/jonathan-bochner.jpg",
      points: { create: { balance: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.anthony@sullys.local",
      passwordHash,
      firstName: "Anthony",
      lastName: "Sky",
      role: "coach",
      title: "Professional Boxing Coach (Novice – Fighters)",
      bio: "A Downtown Toronto native who started boxing at 13, Anthony supports athletes at every stage — sharing the mindset and craft that keep the next generation of boxers sharp.",
      photoUrl: "/coaches/anthony-sky.jpg",
      points: { create: { balance: 0 } },
    },
  });

  const coachJacklyne = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.jacklyne@sullys.local",
      passwordHash,
      firstName: "Jacklyne",
      lastName: "Irvine",
      role: "coach",
      title: "Boxing & Fitness Instructor",
      bio: "An undefeated amateur boxer from Toronto, Jacklyne coaches technique, form, and mental toughness in a supportive, challenging environment that brings out the best in her athletes.",
      photoUrl: "/coaches/jacklyne-irvine.jpg",
      points: { create: { balance: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "coach.jack@sullys.local",
      passwordHash,
      firstName: "Jack",
      lastName: "Hemmings",
      role: "coach",
      title: "Boxing & Fitness Instructor",
      bio: "Jack has 9+ years in the sport, 50+ amateur tournaments, and is a 3x Ontario Champion. As a pro he is 5-1 with all wins by knockout — still chasing excellence every round.",
      photoUrl: "/coaches/jack-hemmings.jpg",
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
      firstName: "Gavin",
      lastName: "Sheppard",
      role: "member",
      // Demo mascot portrait (AI member photos system comes later)
      photoUrl: "/members/gavin-sheppard.png",
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
          typedName: "Gavin Sheppard",
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
      coachName: "Tony Morrison",
    },
    {
      title: "Competitive Team",
      programId: boxing.id,
      start: atHour(today, 18, 0),
      end: atHour(today, 19, 30),
      capacity: 12,
      coachUserId: coachRico.id,
      coachName: "Rico Mancini",
    },
    {
      title: "Women's Boxing",
      programId: boxing.id,
      start: atHour(today, 19, 0),
      end: atHour(today, 20, 0),
      capacity: 14,
      coachUserId: coachJacklyne.id,
      coachName: "Jacklyne Irvine",
    },
    {
      title: "Kids Boxing",
      programId: kids.id,
      start: atHour(today, 16, 0),
      end: atHour(today, 17, 0),
      capacity: 12,
      coachUserId: coachWinslow.id,
      coachName: "Winslow",
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
      coachName: "Tony Morrison",
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
        decade: 1890,
        year: 1890,
        type: "canada",
        title: "George Dixon — first Canadian-born world champ",
        body: "Nova Scotia's George Dixon becomes the first Black world boxing champion and the first Canadian-born world champion — a foundation stone of Canadian ring history (bantamweight 1890, featherweight 1891).",
        mediaUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/69/George_Dixon_boxer.jpg",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1900,
        year: 1906,
        type: "canada",
        title: "Tommy Burns — Canadian heavyweight champion of the world",
        body: "Ontario's Tommy Burns becomes the first Canadian to win the world heavyweight title (1906), defending it into 1908. Canada’s heavyweight story starts here. Early fight film of Burns vs Bill Squires (1907) survives on Wikimedia Commons.",
        sortOrder: 1,
      },
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
        decade: 1920,
        year: 1920,
        type: "canada",
        title: "Bert Schneider — Olympic gold for Canada",
        body: "At Antwerp 1920, Bert Schneider wins Canada's first Olympic boxing gold — still remembered as the country's best Olympic boxing showing of that era.",
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
        decade: 1940,
        year: 1943,
        type: "origin",
        title: "1943 — the continuous line begins",
        body: "Sully's lineage as Canada's oldest continuously operating boxing club is dated to 1943 — a neighbourhood gym that would outlast addresses, trends, and every excuse to quit on kids.",
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
        type: "visit",
        title: "March 1966 — Muhammad Ali trains at Sully's",
        body: "Preparing for George Chuvalo, Muhammad Ali trains at Earl \"Sully\" Sullivan's Toronto Athletic Club on Ossington. Fans pay $1–$5 to watch him spar; proceeds support neighbourhood children. While in Toronto he also referees junior bouts. The original speed-bag frame from that camp is still kept at the gym. Heritage Toronto later marks the Ossington site.",
        sortOrder: 2,
      },
      {
        organizationId: org.id,
        decade: 1960,
        year: 1966,
        type: "champion",
        title: "March 29, 1966 — Ali vs Chuvalo at Maple Leaf Gardens",
        body: "Fifteen rounds at Maple Leaf Gardens. Ali wins a unanimous decision; Chuvalo goes the distance and enters Canadian lore as the chin that would not go down. Chuvalo trained nearby at Lansdowne Athletic Club; the night is forever tied to Sully's Ossington chapter. Iconic photos: Tony Triolo (SI/Getty), Boris Spremo (Globe).",
        sortOrder: 3,
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
        decade: 1980,
        year: 1988,
        type: "champion",
        title: "Lennox Lewis — Olympic gold for Canada",
        body: "Lennox Lewis wins super-heavyweight gold for Canada at Seoul 1988, then rises to undisputed world heavyweight champion. He is long associated with Sully's — another name on the walls that taught Toronto what excellence looks like.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1990,
        year: 1991,
        type: "champion",
        title: "Razor Ruddock — Toronto heavyweight fire",
        body: "Donovan \"Razor\" Ruddock, Canadian heavyweight contender and two-time Mike Tyson opponent (1991), trained through Sully's and later returned as a youth coach (from ~2016) — living proof the wall is not only memory.",
        sortOrder: 1,
      },
      {
        organizationId: org.id,
        decade: 1990,
        year: null,
        type: "steward",
        title: "Joe Manteiga keeps the doors open",
        body: "One of Sully's youth, Joe Manteiga, becomes a North American Golden Gloves Champion — and never really leaves. When Sully grows ill, Joe cares for him. When Sully passes, Joe honors his final wish and stewards the gym for the next twenty years.",
        sortOrder: 2,
      },
      {
        organizationId: org.id,
        decade: 1990,
        year: null,
        type: "moment",
        title: "Melo, Furlano & the Ossington walls",
        body: "Photos from the Ossington years show Earl Sullivan with Toronto fight figures like Eddie Melo and Nicky Furlano — proof the gym was never only a room; it was a crossroads.",
        sortOrder: 3,
      },
      {
        organizationId: org.id,
        decade: 2000,
        year: null,
        type: "visit",
        title: "When the legends stop by",
        body: "Press and oral history place Sugar Ray Leonard among those who trained at Sully's. Joe Manteiga also told of Mike Tyson arriving early one morning for a tour — doors locked, gym empty. Some visits are camps. Some are knocks that become stories.",
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
        decade: 2010,
        year: 2016,
        type: "milestone",
        title: "Heritage plaque — Ali's Ossington camp",
        body: "Heritage Toronto commemorates Muhammad Ali's March 1966 training at 109 Ossington — civic proof that Sully's chapter is part of the city's official memory.",
        sortOrder: 2,
      },
      {
        organizationId: org.id,
        decade: 2010,
        year: 2019,
        type: "moment",
        title: "700+ youth served",
        body: "Since the move from Dupont to Dundas St W (with COVID dampening the stretch), Sully's has served 700+ children and youth — still building character one person at a time.",
        sortOrder: 3,
      },
      {
        organizationId: org.id,
        decade: 2020,
        year: 2024,
        type: "moment",
        title: "Digital Performance Platform",
        body: "The next chapter of stewardship: member portal, Gym TV, kitchen, and a living Legacy Wall — so every number keeps a name, and every name keeps a story.",
        sortOrder: 1,
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

  await prisma.gameDefinition.upsert({
    where: { slug: "bag-battle" },
    create: {
      slug: "bag-battle",
      name: "Bag Battle",
      description:
        "In-class heavy-bag scoring bout. Highest score wins XP. Coach taps scores from Live Mode.",
      configJson: JSON.stringify({
        scoring: "coach_manual",
        maxScore: 100,
        safetyRules: ["Stop on injury signal", "Kids Quest uses form not power"],
      }),
      xpWin: 15,
      active: true,
    },
    update: {
      name: "Bag Battle",
      description:
        "In-class heavy-bag scoring bout. Highest score wins XP. Coach taps scores from Live Mode.",
      xpWin: 15,
      active: true,
    },
  });

  for (const g of [
    {
      slug: "combo-rush",
      name: "Combo Challenge",
      description: "Clean combinations under the clock — form over power.",
      xpWin: 12,
    },
    {
      slug: "team-battle",
      name: "Team Battle",
      description: "Red vs Blue energy — coach awards team points live.",
      xpWin: 10,
    },
    {
      slug: "kids-quest",
      name: "Kids Quest",
      description: "Positive skill milestones for youth — participation first.",
      xpWin: 10,
    },
  ]) {
    await prisma.gameDefinition.upsert({
      where: { slug: g.slug },
      create: {
        slug: g.slug,
        name: g.name,
        description: g.description,
        configJson: JSON.stringify({ scoring: "coach_manual" }),
        xpWin: g.xpWin,
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

  for (const b of [
    { code: "first_class", name: "First Class", description: "Completed first class" },
    { code: "class_club_10", name: "10 Class Club", description: "10 classes completed" },
    { code: "class_club_25", name: "25 Class Club", description: "25 classes completed" },
    { code: "class_club_50", name: "50 Class Club", description: "50 classes completed" },
    { code: "class_club_100", name: "100 Class Club", description: "100 classes completed" },
    { code: "streak", name: "Streak", description: "Showing up consistently" },
    { code: "personal_best", name: "Personal Best", description: "Hit a PB in class" },
    { code: "skill_milestone", name: "Skill Milestone", description: "Coach stamped a skill" },
    { code: "team_player", name: "Team Player", description: "Lifted the room" },
    { code: "coachs_choice", name: "Coach's Choice", description: "Earned coach recognition" },
  ]) {
    await prisma.badge.upsert({
      where: { code: b.code },
      create: b,
      update: { name: b.name, description: b.description },
    });
  }

  const fundamentals = await prisma.workoutTemplate.findFirst({
    where: { name: "Sully's Boxing Fundamentals" },
  });
  if (!fundamentals) {
    await prisma.workoutTemplate.create({
      data: {
        name: "Sully's Boxing Fundamentals",
        description: "Warmup → five rounds → cooldown",
        createdById: coach.id,
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

  console.log("Seeded Sully's flagship data");
  console.log("Logins (password: password123):");
  console.log("  member@sullys.local");
  console.log("  parent@sullys.local");
  console.log("  coach@sullys.local");
  console.log("  desk@sullys.local");
  console.log("  admin@sullys.local");
  console.log("  owner@sullys.local");
  console.log(`Owner id: ${owner.id}, coach id: ${coach.id}`);
  console.log("Game: bag-battle");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
