/**
 * Weekly floor schedule from the gym's class poster.
 * Coach names follow the floor roster. A coach is attached only when the
 * poster or the gym's own class list names them.
 * Sweet Science says "Anthony" and does not say P. or S.
 */

export type ScheduleTone =
  | "beginner"
  | "plus"
  | "intermediate"
  | "advanced"
  | "fight"
  | "sparring";

export type FloorCoach = {
  emailLocal: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  photoUrl: string;
};

export type FloorSlot = {
  /** 1 = Monday … 6 = Saturday */
  day: number;
  hour: number;
  minute: number;
  minutes: number;
  title: string;
  level: string;
  tone: ScheduleTone;
  coach?: string;
  note?: string;
  youth?: boolean;
};

export const RETIRED_COACH_EMAILS = [
  "coach.winslow@sullys.local",
  "coach.jacklyne@sullys.local",
  "coach.jack@sullys.local",
] as const;

/** Floor order requested for the site. */
export const FLOOR_COACHES: FloorCoach[] = [
  {
    emailLocal: "coach.rico",
    firstName: "Rico",
    lastName: "Mancini",
    title: "Boxing Canada Competitive Coach",
    bio: "Rico prepares prospective fighters for competitive matches with a meticulous focus on mechanics and technique. His regimen covers mobility, strength, HIIT, ring, pad, and sparring work.",
    photoUrl: "/coaches/rico-mancini.png",
  },
  {
    emailLocal: "coach.tommy",
    firstName: "Tommy",
    lastName: "",
    title: "Coach",
    bio: "Coach on the Sully's floor.",
    photoUrl: "/coaches/tommy.png",
  },
  {
    emailLocal: "coach.levi",
    firstName: "Levi",
    lastName: "",
    title: "Coach",
    bio: "Coach on the Sully's floor.",
    photoUrl: "/coaches/levi.png",
  },
  {
    emailLocal: "coach.anthony.p",
    firstName: "Anthony",
    lastName: "P.",
    title: "Coach",
    bio: "Coach on the Sully's floor.",
    photoUrl: "/coaches/anthony-p.jpg",
  },
  {
    emailLocal: "coach.jackie",
    firstName: "Jackie",
    lastName: "",
    title: "Body Shop Coach",
    bio: "Leads Body Shop, Wednesday mornings, for beginner and intermediate members.",
    photoUrl: "/coaches/jackie.png",
  },
  {
    emailLocal: "coach.viktoria",
    firstName: "Viktoria",
    lastName: "Penney",
    title: "Coach",
    bio: "On the Sully's coaching floor. 2025 Brampton Cup gold medalist at women's 80 kg.",
    photoUrl: "/coaches/viktoria-penney.png",
  },
  {
    emailLocal: "coach.jonathan",
    firstName: "Jonathan",
    lastName: "Bochner",
    title: "Chartered Professional Boxing Coach",
    bio: "Jonathan brings three decades in boxing, 172 bouts, and training under high-performance and Olympic coaches. Former Canadian Champion, Chartered Professional Coach (ChPc), AIBA 1-star Coach, and former Team Canada coach.",
    photoUrl: "/coaches/jonathan-bochner.jpg",
  },
  {
    emailLocal: "coach",
    firstName: "Tony",
    lastName: "Morrison",
    title: "1991 Canadian Heavyweight Champion",
    bio: "Tony Morrison, the former Canadian Heavyweight Champion who held the title in 1991, brings years of experience in the ring and as a trainer. Whether you're a seasoned athlete or just starting out, Tony's guidance helps you reach your full potential.",
    photoUrl: "/coaches/tony-morrison.png",
  },
  {
    emailLocal: "coach.anthony",
    firstName: "Anthony",
    lastName: "Sky",
    title: "Professional Boxing Coach (Novice – Fighters)",
    bio: "A Downtown Toronto native who started boxing at 13, Anthony supports athletes at every stage — sharing the mindset and craft that keep the next generation of boxers sharp.",
    photoUrl: "/coaches/anthony-sky.jpg",
  },
];

const hop = (
  day: number,
  hour: number,
  minute: number,
): FloorSlot => ({
  day,
  hour,
  minute,
  minutes: 60,
  title: "Tony's House of Pain",
  level: "Beginner + Intermediate",
  tone: "plus",
  coach: "Tony Morrison",
});

const jab = (day: number): FloorSlot => ({
  day,
  hour: 16,
  minute: 30,
  minutes: 60,
  title: "Jab Lab Beginner",
  level: "Beginner",
  tone: "beginner",
  note: "Free · ages 13–18",
  youth: true,
});

const youthFight = (day: number): FloorSlot => ({
  day,
  hour: 16,
  minute: 30,
  minutes: 60,
  title: "Junior Youth Competition Development",
  level: "Fight Team",
  tone: "fight",
  note: "Boxing Ontario membership and a valid medical",
  youth: true,
});

const boxtech = (day: number): FloorSlot => ({
  day,
  hour: 18,
  minute: 30,
  minutes: 60,
  title: "Boxtech",
  level: "Beginner + Intermediate",
  tone: "plus",
  coach: "Rico Mancini",
});

const littleChamps = (day: number): FloorSlot => ({
  day,
  hour: 15,
  minute: 30,
  minutes: 60,
  title: "Little Champs Beginner",
  level: "Beginner",
  tone: "beginner",
  coach: "Tony Morrison",
  note: "Free · ages 6–12",
  youth: true,
});

const sweet = (day: number): FloorSlot => ({
  day,
  hour: 10,
  minute: 30,
  minutes: 60,
  title: "Sweet Science",
  level: "Beginner + Intermediate",
  tone: "plus",
  coach: "Anthony",
});

export const FLOOR_SLOTS: FloorSlot[] = [
  hop(1, 12, 0),
  hop(1, 13, 30),
  littleChamps(1),
  jab(1),
  youthFight(1),
  {
    day: 1,
    hour: 18,
    minute: 0,
    minutes: 60,
    title: "Beginner Boxing",
    level: "Beginner",
    tone: "beginner",
  },
  boxtech(1),
  {
    day: 1,
    hour: 19,
    minute: 15,
    minutes: 60,
    title: "Fight Path 1",
    level: "Intermediate",
    tone: "intermediate",
  },
  hop(1, 20, 0),

  sweet(2),
  hop(2, 12, 0),
  hop(2, 13, 30),
  jab(2),
  youthFight(2),
  {
    day: 2,
    hour: 17,
    minute: 30,
    minutes: 60,
    title: "Beginner Boxing",
    level: "Beginner",
    tone: "beginner",
  },
  {
    day: 2,
    hour: 18,
    minute: 0,
    minutes: 60,
    title: "Battle Royal",
    level: "Intermediate",
    tone: "intermediate",
  },
  boxtech(2),
  {
    day: 2,
    hour: 19,
    minute: 15,
    minutes: 60,
    title: "Fight Path 2",
    level: "Advanced",
    tone: "advanced",
  },
  hop(2, 20, 0),

  {
    day: 3,
    hour: 7,
    minute: 30,
    minutes: 60,
    title: "Body Shop",
    level: "Beginner + Intermediate",
    tone: "plus",
    coach: "Jackie",
  },
  {
    day: 3,
    hour: 9,
    minute: 0,
    minutes: 60,
    title: "Body Shop",
    level: "Beginner + Intermediate",
    tone: "plus",
    coach: "Jackie",
  },
  hop(3, 12, 0),
  hop(3, 13, 30),
  littleChamps(3),
  jab(3),
  youthFight(3),
  {
    day: 3,
    hour: 18,
    minute: 0,
    minutes: 60,
    title: "Fight Path 3",
    level: "Sparring",
    tone: "sparring",
    note: "Boxing Ontario membership and a valid medical",
  },
  boxtech(3),
  {
    day: 3,
    hour: 19,
    minute: 45,
    minutes: 60,
    title: "Fight Path 3",
    level: "Sparring",
    tone: "sparring",
    note: "Boxing Ontario membership and a valid medical",
  },
  hop(3, 20, 0),

  sweet(4),
  hop(4, 12, 0),
  hop(4, 13, 30),
  jab(4),
  youthFight(4),
  {
    day: 4,
    hour: 17,
    minute: 30,
    minutes: 60,
    title: "Beginner Boxing",
    level: "Beginner",
    tone: "beginner",
  },
  boxtech(4),
  {
    day: 4,
    hour: 19,
    minute: 15,
    minutes: 60,
    title: "Fight Path 1",
    level: "Intermediate",
    tone: "intermediate",
  },
  hop(4, 20, 0),

  {
    day: 5,
    hour: 8,
    minute: 30,
    minutes: 60,
    title: "Boxing 101",
    level: "Beginner",
    tone: "beginner",
  },
  {
    day: 5,
    hour: 9,
    minute: 30,
    minutes: 60,
    title: "Powerhouse",
    level: "Beginner + Intermediate",
    tone: "plus",
  },
  hop(5, 12, 0),
  hop(5, 13, 30),
  littleChamps(5),
  jab(5),
  youthFight(5),
  {
    day: 5,
    hour: 18,
    minute: 0,
    minutes: 60,
    title: "Beginner Boxing",
    level: "Beginner",
    tone: "beginner",
  },
  boxtech(5),
  {
    day: 5,
    hour: 19,
    minute: 15,
    minutes: 60,
    title: "Fight Path 2",
    level: "Advanced",
    tone: "advanced",
    coach: "Rico Mancini",
    note: "New time",
  },

  {
    day: 6,
    hour: 11,
    minute: 0,
    minutes: 60,
    title: "Beginner Boxing",
    level: "Beginner",
    tone: "beginner",
    coach: "Rico Mancini",
  },
  {
    day: 6,
    hour: 12,
    minute: 30,
    minutes: 75,
    title: "Fight Path 1 & 2",
    level: "Advanced",
    tone: "advanced",
    coach: "Rico Mancini",
  },
  {
    day: 6,
    hour: 14,
    minute: 15,
    minutes: 75,
    title: "Fight Path 2 & Competitive Sparring",
    level: "Sparring",
    tone: "sparring",
    note: "Boxing Ontario membership and a valid medical",
  },
];

export const SCHEDULE_DAYS = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
] as const;

export function coachDisplayName(coach: {
  firstName: string;
  lastName: string;
}): string {
  return `${coach.firstName} ${coach.lastName}`.trim();
}

export function formatSlotTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h}:${minute.toString().padStart(2, "0")} ${suffix}`;
}
