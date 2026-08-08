export type ProgramSlug =
  | "boxing-fundamentals"
  | "academic-support"
  | "mentorship-leadership"
  | "lifeskills"
  | "wellness-mind-body"
  | "business-of-boxing";

export type Program = {
  slug: ProgramSlug;
  name: string;
  short: string;
  lead: string;
  body: string[];
  outcomes: string[];
};

export const PROGRAMS: Program[] = [
  {
    slug: "boxing-fundamentals",
    name: "Boxing Fundamentals & Athletic Training",
    short:
      "Discipline, focus, fitness, and emotional regulation through structured boxing.",
    lead:
      "Boxing is the engine — the entry point that gets people through the door and engaged.",
    body: [
      "Structured instruction builds physical skill alongside character: attendance, punctuality, coachability, and sustained effort.",
      "Athletes learn to fail safely, learn quickly, and be challenged constantly — never threatened or abused.",
      "Safety is non-negotiable. Respect for the space, the program, and one another is the floor.",
    ],
    outcomes: [
      "Physical fitness and coordination",
      "Emotional regulation under pressure",
      "Discipline and focus that transfer outside the gym",
    ],
  },
  {
    slug: "academic-support",
    name: "Academic Support & Tutoring",
    short:
      "School engagement, responsibility, and long-term educational outcomes.",
    lead:
      "Every number has a name. Academic support keeps youth on a path where the gym and the classroom reinforce each other.",
    body: [
      "Homework support, tutoring, and college/university preparation sit alongside training — not as an afterthought.",
      "We reinforce responsibility and long-term educational outcomes so students realize their full potential.",
      "In-gym classroom tools and structured study habits turn after-school time into progress you can measure.",
    ],
    outcomes: [
      "Consistent school engagement",
      "Study skills and preparation pathways",
      "Adult accountability partners for learning",
    ],
  },
  {
    slug: "mentorship-leadership",
    name: "Mentorship & Leadership Development",
    short:
      "Consistent adult role models who model accountability, respect, and growth.",
    lead:
      "Someone believes in you. You begin to believe in yourself. That is the Sully Cascade.",
    body: [
      "Mentors model accountability, respect, and personal growth — the same values Earl “Sully” Sullivan preached for decades.",
      "Older students are expected to embody leadership and responsibility toward younger athletes.",
      "Trust is earned. Kept promises build trust. Trust builds relationships. Relationships create transformation.",
    ],
    outcomes: [
      "Reliable adult presence",
      "Peer leadership on the floor",
      "A path from athlete to steward",
    ],
  },
  {
    slug: "lifeskills",
    name: "Lifeskills Development",
    short: "Financial literacy, meal prep, and cooking for life outside the gym.",
    lead:
      "Programs are vehicles. People are the purpose — including the skills that make independence possible.",
    body: [
      "Financial literacy modules help youth understand money, choices, and responsibility.",
      "Meal prep and cooking classes connect directly to kitchen and nutrition support in the gym.",
      "We prepare people for life outside the ropes: work, home, and community.",
    ],
    outcomes: [
      "Practical money skills",
      "Food skills and independence",
      "Confidence navigating adult responsibilities",
    ],
  },
  {
    slug: "wellness-mind-body",
    name: "Wellness & Mind-Body Programming",
    short:
      "Mindfulness, recovery, and stress management for mental, physical, and emotional health.",
    lead:
      "We don’t protect people from challenges — we prepare them to meet them, body and mind.",
    body: [
      "Yoga, meditation, recovery, and nutritional support sit beside hard training.",
      "Stress-management practices help athletes regulate when life outside the gym is unstable.",
      "Wellness is not soft — it is how excellence and grace stay in the same room.",
    ],
    outcomes: [
      "Recovery and injury prevention habits",
      "Tools for stress and focus",
      "Whole-person fitness — physical, mental, emotional",
    ],
  },
  {
    slug: "business-of-boxing",
    name: "Business of Boxing",
    short:
      "Coaching, promotions, branding, social, athlete management, and merchandise.",
    lead:
      "Boxing opens doors into an industry — not only into a ring.",
    body: [
      "Anchored by a live conversation/workshop series with industry professionals — young people explore roles across coaching, promotions, branding, social media, athlete management, and merchandise.",
      "The gym becomes a living classroom for creative and operational entry points into sport.",
      "Excellence on the floor pairs with real pathways for careers around the sport.",
    ],
    outcomes: [
      "Industry literacy",
      "Portfolio-ready project experience",
      "Career curiosity beyond competing",
    ],
  },
];

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
