/**
 * Weekly floor schedule from the gym's class poster.
 * Coach names follow the floor roster. A coach is attached only when the
 * poster or the gym's own class list names them.
 * Monday to Friday follows the posted floor sheet. Saturday is not on that sheet.
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
  blurb?: string;
  poster?: string;
  youth?: boolean;
};

export const RETIRED_COACH_EMAILS = [
  "coach.winslow@sullys.local",
  "coach.jacklyne@sullys.local",
  "coach.jack@sullys.local",
] as const;

/** People who cover the front desk. Not coaches, and not on the public roster. */
export const DESK_STAFF = [
  {
    emailLocal: "jacob",
    firstName: "Jacob",
    lastName: "",
    title: "Front desk",
  },
  {
    emailLocal: "jesse",
    firstName: "Jesse",
    lastName: "",
    title: "Front desk",
  },
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
    emailLocal: "coach.liznell",
    firstName: "Liznell",
    lastName: "",
    title: "Coach",
    bio: "Coach on the Sully's floor.",
    photoUrl: "/coaches/liznell.png",
  },
  {
    emailLocal: "coach.anthony.p",
    firstName: "Anthony",
    lastName: "A.",
    title: "Coach",
    bio: "Anthony A. coaches on the Sully's floor.",
    photoUrl: "/coaches/anthony-p.png",
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
    photoUrl: "/coaches/jonathan-bochner.png",
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
    photoUrl: "/coaches/anthony-sky.png",
  },
];

const POSTER = {
  hop: "/classes/house-of-pain.jpg",
  strength: "/classes/strength-conditioning.jpg",
  beginner: "/classes/beginner-boxing.jpg",
  junior: "/classes/junior-boxing.jpg",
  youth: "/classes/youth-boxing.jpg",
  spar: "/classes/sparring.jpg",
  path1: "/classes/fight-path-1.jpg",
  path2: "/classes/fight-path-2.jpg",
  team: "/classes/fight-team.jpg",
  boxtech: "/classes/boxtech.jpg",
  royale: "/classes/battle-royale.jpg",
} as const;

function slot(
  day: number,
  hour: number,
  minute: number,
  minutes: number,
  title: string,
  level: string,
  tone: ScheduleTone,
  extra: Partial<FloorSlot> = {},
): FloorSlot {
  return { day, hour, minute, minutes, title, level, tone, ...extra };
}

export const FLOOR_SLOTS: FloorSlot[] = (() => {
  const days = [1, 2, 3, 4, 5];
  const out: FloorSlot[] = [];
  const hop = 'All levels. Boxing conditioning. 50 minutes. No shortcuts.';
  const strength = 'All levels. 50 minutes. Strength, stamina, and the muscles behind the punches.';
  const beginner = 'Beginners only. No experience required. 50 minutes. Stance, footwork, punches, and basic combinations.';
  const youth = 'Ages 13–17. Free Monday, Wednesday, and Friday, 4:30–5:20. A parent books the child. No walk-ins.';
  const junior = 'Ages 8–12. Free Tuesday and Thursday, 4:30–5:20. A parent books the child. No walk-ins.';
  const box = 'All levels. Technique first: footwork, defence, angles, and ring sense. Start here before Fight Path.';
  const path1 = 'Intermediate. 50 minutes. At least 6 months of boxing. Not for beginners.';
  const path2 = 'Intermediate and advanced. 50 minutes. At least 6 months, depending on skill. Not for beginners.';
  const team = 'Invite only. 90 minutes. Coach approval, Boxing Ontario membership, a valid medical, mouthguard, and headgear.';
  const spar = 'Invite only. 90 minutes. Coach approval, Boxing Ontario membership, a valid medical, mouthguard, and headgear.';
  for (const day of days) {
    out.push(slot(day, 12, 0, 50, 'House of Pain', 'All levels', 'plus', { poster: POSTER.hop, blurb: hop }));
    out.push(slot(day, 13, 0, 50, 'Strength and Conditioning', 'All levels', 'plus', { poster: POSTER.strength, blurb: strength }));
    if (day === 1 || day === 3 || day === 5) {
      out.push(slot(day, 16, 30, 50, 'Youth Boxing', 'Ages 13–17', 'beginner', { poster: POSTER.youth, blurb: youth, youth: true, note: 'Free · parent booking required' }));
    } else {
      out.push(slot(day, 16, 30, 50, 'Junior Boxing', 'Ages 8–12', 'beginner', { poster: POSTER.junior, blurb: junior, youth: true, note: 'Free · parent booking required' }));
    }
    out.push(slot(day, 17, 30, 50, 'Beginner Boxing', 'Beginners only', 'beginner', { poster: POSTER.beginner, blurb: beginner }));
    if (day === 2 || day === 4) {
      out.push(slot(day, 18, 30, 50, 'House of Pain', 'All levels', 'plus', { poster: POSTER.hop, blurb: hop }));
    } else {
      out.push(slot(day, 18, 30, 50, 'BoxTech', 'All levels', 'plus', { poster: POSTER.boxtech, blurb: box }));
    }
    if (day === 1 || day === 3) {
      out.push(slot(day, 18, 30, 50, 'Fight Path 1', 'Intermediate', 'intermediate', { poster: POSTER.path1, blurb: path1, note: 'B+C · 6+ months' }));
    } else if (day === 2) {
      out.push(slot(day, 18, 30, 50, 'Battle Royale', 'Intermediate', 'intermediate', { coach: 'Jonathan Bochner', poster: POSTER.royale, note: 'B+C', blurb: 'Jonathan Bochner. 50 minutes. The second class at 6:30.' }));
    } else {
      out.push(slot(day, 18, 30, 50, 'Fight Path 2', 'Intermediate / Advanced', 'advanced', { poster: POSTER.path2, blurb: path2, note: 'B+C · 6+ months' }));
    }
    out.push(slot(day, 19, 30, 50, 'House of Pain', 'All levels', 'plus', { poster: POSTER.hop, blurb: hop }));
    if (day === 1 || day === 5) {
      out.push(slot(day, 19, 30, 90, 'Technical Sparring', 'Invite only', 'sparring', { poster: POSTER.spar, blurb: spar, note: 'B+C · coach approval required' }));
    } else if (day === 3) {
      out.push(slot(day, 19, 30, 50, 'Strength and Conditioning', 'All levels', 'plus', { poster: POSTER.strength, blurb: strength, note: 'B+C' }));
    } else {
      out.push(slot(day, 19, 30, 90, 'Fight Team', 'Invite only', 'fight', { poster: POSTER.team, blurb: team, note: 'B+C · coach approval required' }));
    }
  }
  return out;
})();

export const APP_FLOOR_SLOTS: FloorSlot[] = FLOOR_SLOTS;

export function posterForClass(title: string): string | null {
  const found = FLOOR_SLOTS.find((slot) => slot.title === title && slot.poster);
  return found?.poster ?? null;
}

export function classInfo(title: string): { tone: ScheduleTone; level: string } {
  const found = FLOOR_SLOTS.find((slot) => slot.title === title);
  if (found) return { tone: found.tone, level: found.level };
  return { tone: "plus", level: "All levels" };
}

export const SCHEDULE_DAYS = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
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
