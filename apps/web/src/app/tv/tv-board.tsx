"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  isBoxingTimerSoundUnlocked,
  playCelebrationCue,
  playRoundBell,
  playTenSecondWarning,
  testBoxingTimerSound,
} from "../../lib/boxing-timer-sounds";
import { getBrand } from "@/lib/brand";
import styles from "./tv.module.css";
import {
  TvRiveLayer,
  TvArtNote,
  hasArtPopup,
  readDemoCelebrate,
  readNoteFreeze,
  readPopupFreeze,
  readRiveEnabled,
  type FloorPopupMode,
} from "./tv-rive-layer";
import { FLOOR_ADS } from "./tv-art-popup";
import { TvBoxerRig } from "./tv-boxer-rig";

const DEMO_MODES = [
  "achievement",
  "xp_bonus",
  "teams",
  "challenge",
  "leaderboard",
  "class_complete",
  "timer",
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function floorLabel(brandName: string) {
  return `${brandName} floor`;
}

type SessionCard = {
  id: string;
  title: string;
  program: string | null;
  coach: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  spotsLeft: number;
  phase: "upcoming" | "live" | "done";
  secondsToStart: number;
  secondsRemaining: number;
};

type CoachTimer = {
  sessionId: string;
  title: string;
  coach: string | null;
  status: string;
  phase: "work" | "rest" | string;
  round: number;
  totalRounds: number;
  workSec: number;
  restSec: number;
  secondsLeft: number;
  phaseEndsAt?: string | null;
  pausedRemainSec?: number | null;
  tvMode: string;
  tvMessage?: string | null;
  syncedToCoach: boolean;
  currentExercise?: { title: string; phase: string } | null;
  nextExercise?: { title: string; phase: string } | null;
  teams?: {
    rank: number;
    name: string;
    color: string;
    points: number;
    members: string[];
  }[];
  challenges?: {
    name: string;
    type: string;
    status: string;
    winnerLabel: string | null;
  }[];
};

type Board = {
  profile: "floor" | "reception";
  asOf: string;
  gym: { name: string; tagline: string; established: number };
  kpis: { checkInsToday: number; classesToday: number; spotsOpen: number };
  live: SessionCard | null;
  next: SessionCard | null;
  schedule: SessionCard[];
  leaderboard: {
    rank: number;
    displayName: string;
    xp: number;
    level: number;
    score?: number;
  }[];
  ticker: { name: string; at: string }[];
  manifesto: string[];
  refreshSeconds: number;
  coachTimer?: CoachTimer | null;
};

type FeedKind = "quote" | "trivia" | "system" | "checkin";
type FeedLine = { kind: FeedKind; text: string };

const FLOOR_QUOTES: FeedLine[] = [
  { kind: "quote", text: "Protect yourself at all times." },
  { kind: "quote", text: "Everyone has a plan until they get hit." },
  { kind: "quote", text: "Chin down. Hands up. Eyes open." },
  { kind: "quote", text: "The jab is the steering wheel." },
  { kind: "quote", text: "Don't count the rounds. Make the rounds count." },
  { kind: "quote", text: "Float like a butterfly. Sting like a bee." },
  { kind: "quote", text: "Champions are built on the quiet days." },
  { kind: "quote", text: "Slip the punch. Take the round." },
  { kind: "quote", text: "The bell doesn't lie." },
  { kind: "quote", text: "Work the body. The head will follow." },
];

const FLOOR_TRIVIA: FeedLine[] = [
  { kind: "trivia", text: "Trivia · Pro round: 3 minutes. Rest: 1." },
  { kind: "trivia", text: "Trivia · Orthodox left. Southpaw right." },
  { kind: "trivia", text: "Trivia · The jab is boxing's most thrown punch." },
  { kind: "trivia", text: "Trivia · Championship distance was 12 rounds." },
  { kind: "trivia", text: "Trivia · Sweet science — coined in 1813." },
  { kind: "trivia", text: "Trivia · A 10-count is mercy. Beat it." },
  { kind: "trivia", text: "Trivia · Ring is 16–20 ft. Nowhere to hide." },
  { kind: "trivia", text: "Trivia · Double-end = timing. Heavy bag = power." },
  { kind: "trivia", text: "Trivia · Weight classes. Heart decides." },
  { kind: "trivia", text: "Trivia · Knockdown: mandatory 8-count. Get up smart." },
  { kind: "trivia", text: "Trivia · Neutral corner after a knockdown." },
  { kind: "trivia", text: "Trivia · Liver shot ends fights upstairs can't." },
];

const FLOOR_SULLYS: FeedLine[] = [
  { kind: "trivia", text: "Sully's · Canada's oldest boxing club · EST 1943." },
  { kind: "trivia", text: "Earl “Sully” Sullivan · born Mimico, 1914." },
  { kind: "trivia", text: "Sully bought the Athletic Club in 1964 · Ossington." },
  { kind: "trivia", text: "Sully's rule: no drugs, no swearing — show respect." },
  { kind: "trivia", text: "March 1966 · Ali trained at Sully's for Chuvalo." },
  { kind: "trivia", text: "Ali's Ossington speed-bag frame is still in this gym." },
  { kind: "trivia", text: "Sully trained youth free — character before the bell." },
  { kind: "trivia", text: "109 Ossington · Ali camp · Heritage Toronto plaque." },
  { kind: "trivia", text: "Joe Manteiga kept Sully's doors open after Sully." },
  { kind: "trivia", text: "Sully's · 1554 Dundas St W · same mission, new chapter." },
];

const FLOOR_CHUVALO: FeedLine[] = [
  { kind: "trivia", text: "George Chuvalo · 1937–2026 · Toronto's heavyweight rests." },
  { kind: "trivia", text: "Chuvalo passed Feb 12, 2026. The chin that never went down." },
  { kind: "trivia", text: "Rest in peace, George Chuvalo · 93 fights · never knocked down." },
  { kind: "trivia", text: "Chuvalo · never knocked down in 93 pro fights." },
  { kind: "trivia", text: "March 29, 1966 · Chuvalo goes 15 with Ali at the Gardens." },
  { kind: "trivia", text: "Chuvalo · Toronto's chin that would not go down." },
  { kind: "trivia", text: "Chuvalo fought Ali, Frazier, and Foreman — still standing." },
  { kind: "trivia", text: "Chuvalo · Canadian heavyweight champion · Toronto legend." },
  { kind: "trivia", text: "Ali prepared for Chuvalo on Ossington. The city still talks." },
  { kind: "trivia", text: "Toronto remembers Chuvalo. Show up. Put in work. Stay standing." },
];

const FLOOR_CANADA: FeedLine[] = [
  { kind: "trivia", text: "Canada · George Dixon, 1890 — first Canadian-born world champ." },
  { kind: "trivia", text: "Canada · Tommy Burns, 1906 — first Canadian heavyweight world champ." },
  { kind: "trivia", text: "Canada · Bert Schneider — Olympic gold, Antwerp 1920." },
  { kind: "trivia", text: "Canada · Jimmy McLarnin — two-time welterweight world champ." },
  { kind: "trivia", text: "Lennox Lewis · Seoul gold 1988 · undisputed heavyweight champ." },
  { kind: "trivia", text: "Lewis · Canadian Olympic gold, then the world heavyweight crown." },
  { kind: "trivia", text: "Lennox Lewis · born London, raised in Kitchener · Canada's champ." },
  { kind: "trivia", text: "Lewis · the jab, the reach, the IQ — last undisputed of his era." },
  { kind: "trivia", text: "Lewis stopped Tyson in 2002. Eight rounds. The argument ended." },
  { kind: "trivia", text: "Lewis vs Holyfield, 1999 · two giants, one heavyweight crown." },
  { kind: "trivia", text: "Lennox Lewis · WBC, IBF, WBA · walked away a champion in 2003." },
  { kind: "trivia", text: "Lewis · Kitchener amateur halls to the top of the heavyweight world." },
  { kind: "trivia", text: "Razor Ruddock · Toronto heavyweight fire · two wars with Tyson." },
  { kind: "trivia", text: "Clyde Gray · Canadian welterweight great · names on these walls." },
  { kind: "trivia", text: "Arturo Gatti · Canadian warrior · Fight of the Year lore." },
  { kind: "trivia", text: "Canada · Jean Pascal and Adonis Stevenson — world champs." },
  { kind: "trivia", text: "Trevor Berbick · WBC heavyweight · last man to fight Ali." },
  { kind: "trivia", text: "Steve Molitor · Sarnia · two-time IBF super bantamweight champ." },
  { kind: "trivia", text: "Molitor · The Canadian Kid · Casino Rama title nights." },
  { kind: "trivia", text: "Molitor KO'd Michael Hunter for the IBF belt, 2006." },
  { kind: "trivia", text: "Donny Lalonde · The Golden Boy · light heavyweight world champ." },
  { kind: "trivia", text: "Yvon Durelle · The Fighting Fisherman · one round from the crown." },
  { kind: "trivia", text: "Matthew Hilton · Montreal · IBF light middleweight world champ." },
];

const FLOOR_VARGAS: FeedLine[] = [
  { kind: "trivia", text: "Sam Vargas · Brampton / Mississauga · Canadian welterweight champ." },
  { kind: "trivia", text: "Vargas · WBA-NABA welter champ · packed the Powerade Centre." },
  { kind: "trivia", text: "Vargas went 12 with Amir Khan. Stood up to Spence and Danny Garcia." },
  { kind: "trivia", text: "Sam Vargas · Colombian-born Canadian · GTA welterweight warrior." },
];

const FLOOR_HERON: FeedLine[] = [
  { kind: "trivia", text: "Kane Heron · Etobicoke · undefeated welterweight · 17-0-1." },
  { kind: "trivia", text: "Heron · NABA-WBA welter champ · Toronto's unbeaten 147." },
  { kind: "trivia", text: "Kane Heron · amateur national champ, then the pro unbeaten run." },
];

const FLOOR_MORRISON: FeedLine[] = [
  { kind: "trivia", text: "Tony “Kid” Morrison · Toronto · Canadian heavyweight champ." },
  { kind: "trivia", text: "Morrison · Jamaica to Lawrence Heights · Sully's trainer." },
  { kind: "trivia", text: "Kid Morrison stopped Leon Spinks in 33 seconds, 1988." },
  { kind: "trivia", text: "Morrison took the Canadian heavyweight belt in Mississauga, 1989." },
  { kind: "trivia", text: "Tony Morrison · Canadian light-heavy champ · 17-12-1, 11 KOs." },
  { kind: "trivia", text: "Morrison trained with Shawn O'Sullivan at Cabbagetown." },
  { kind: "trivia", text: "Kid Morrison still teaches on this floor. Ask him about the work." },
];

const FLOOR_EAST: FeedLine[] = [
  { kind: "trivia", text: "Shawn O'Sullivan · Cabbagetown Kid · Olympic silver, L.A. 1984." },
  { kind: "trivia", text: "O'Sullivan · amateur world champ 1981 · Toronto's 94-6 amateur run." },
  { kind: "trivia", text: "Egerton Marcus · Toronto · Olympic silver, Seoul 1988." },
  { kind: "trivia", text: "Marcus beat Sven Ottke on the way to that Olympic final." },
  { kind: "trivia", text: "Mark Leduc · Toronto · Olympic silver, Barcelona 1992." },
  { kind: "trivia", text: "Chris Johnson · Toronto · Olympic bronze, Barcelona 1992." },
  { kind: "trivia", text: "Frenchy Belanger · Cabbagetown · world flyweight champ, 1927." },
  { kind: "trivia", text: "Larry Gains · Toronto Terror · beat Schmeling and Carnera." },
  { kind: "trivia", text: "Gains · Cabbagetown · Canadian and British Empire heavyweight champ." },
  { kind: "trivia", text: "Otis “Magic” Grant · Montreal · WBO middleweight world champ." },
  { kind: "trivia", text: "Grant · first Black Quebecer to win a world title · 1997." },
  { kind: "trivia", text: "Otis Grant went 10 with Roy Jones Jr. after the middleweight crown." },
  { kind: "trivia", text: "Eric Lucas · Montreal · WBC super middleweight world champ." },
  { kind: "trivia", text: "David Lemieux · Montreal · IBF middleweight world champ." },
  { kind: "trivia", text: "Joachim Alcine · Montreal · WBA light-middleweight world champ." },
  { kind: "trivia", text: "Troy Amos-Ross · Brampton · two-time Olympic light heavyweight." },
];

const FLOOR_HISTORY: FeedLine[] = [
  { kind: "trivia", text: "George Dixon · Africville, Halifax · Little Chocolate · first Black world champ." },
  { kind: "trivia", text: "Dixon won bantamweight in 1890, then featherweight. Two-division pioneer." },
  { kind: "trivia", text: "George Dixon helped invent modern training — shadowboxing and the bag." },
  { kind: "trivia", text: "Sam Langford · Weymouth Falls, N.S. · one of the greatest never given a U.S. title shot." },
  { kind: "trivia", text: "Langford beat Joe Gans as a lightweight, then went 15 with Jack Johnson." },
  { kind: "trivia", text: "Langford held titles in Canada, England, Australia, and Mexico." },
  { kind: "trivia", text: "Tommy Burns · born Noah Brusso · Hanover, Ontario." },
  { kind: "trivia", text: "Burns · 5-foot-7 world heavyweight champ. Ten defences in 33 months." },
  { kind: "trivia", text: "Burns KO'd Ireland's Jem Roche in 88 seconds. Shortest title defence ever." },
  { kind: "trivia", text: "Christmas 1908 · Sydney · Burns vs Jack Johnson. The heavyweight world watched." },
  { kind: "trivia", text: "Jimmy McLarnin · Vancouver's Baby Face · beat Barney Ross for the welter crown." },
  { kind: "trivia", text: "Lou Brouillard · Quebec · world welterweight and middleweight champ in the '30s." },
  { kind: "trivia", text: "Jackie Callura · Hamilton · world featherweight champ, 1943." },
  { kind: "trivia", text: "Johnny Greco · Montreal welterweight · packed the Forum night after night." },
  { kind: "trivia", text: "Sammy Luftspring · Toronto · Canadian welter champ · Star of David on the trunks." },
  { kind: "trivia", text: "Luftspring boycotted Berlin 1936. Then won the Canadian welterweight belt." },
  { kind: "trivia", text: "Luftspring KO'd Frankie Genovese in 13 at Mutual Street Arena, 1938." },
  { kind: "trivia", text: "Lefty Gwynne · Toronto · Olympic bantamweight gold, Los Angeles 1932." },
  { kind: "trivia", text: "Bert Schneider · Montreal · Canada's first Olympic boxing gold, Antwerp 1920." },
  { kind: "trivia", text: "Antwerp 1920 · Canada's best Olympic boxing night. Five medals." },
  { kind: "trivia", text: "Horace “Lefty” Gwynne · the second Canadian Olympic boxing gold." },
  { kind: "trivia", text: "Canada has three Olympic boxing golds: Schneider, Gwynne, Lennox Lewis." },
  { kind: "trivia", text: "Yvon Durelle vs Archie Moore · Montreal Forum, 1958. Four knockdowns. Lore." },
  { kind: "trivia", text: "Durelle · Baie-Sainte-Anne's Fighting Fisherman · one night from the crown." },
  { kind: "trivia", text: "Maple Leaf Gardens · Ali vs Chuvalo · 15 rounds · March 29, 1966." },
  { kind: "trivia", text: "Championships used to go 15. Chuvalo went every round with Ali." },
  { kind: "trivia", text: "Clyde Gray · Toronto · two-time world-title challenger at welterweight." },
  { kind: "trivia", text: "Ruddock vs Tyson I and II · 1991. The Smash from Toronto." },
  { kind: "trivia", text: "Willie de Wit · Grande Prairie · Olympic heavyweight silver, L.A. 1984." },
  { kind: "trivia", text: "Dale Walters · Olympic bantamweight bronze, Los Angeles 1984." },
  { kind: "trivia", text: "Ray Downey · Halifax · Olympic bronze, Seoul 1988." },
  { kind: "trivia", text: "Seoul 1988 · Lewis gold, Marcus silver, Downey bronze. Canada's night." },
  { kind: "trivia", text: "Lewis stopped Riddick Bowe for Olympic gold in Seoul." },
  { kind: "trivia", text: "David Defiagbon · Olympic heavyweight silver, Atlanta 1996." },
  { kind: "trivia", text: "Wyatt Sanford · Paris 2024 bronze · first Canadian Olympic boxing medal in 28 years." },
  { kind: "trivia", text: "Mary Spencer · first Canadian woman in Olympic boxing, London 2012." },
  { kind: "trivia", text: "Women's Olympic boxing began in 2012. Canada was in that first draw." },
  { kind: "trivia", text: "Donny Lalonde · Winnipeg's Golden Boy · WBC light-heavy champ, 1987." },
  { kind: "trivia", text: "Lalonde fought Sugar Ray Leonard with two belts on the line." },
  { kind: "trivia", text: "Matthew Hilton · first Canadian world champ since Callura — 44 years later." },
  { kind: "trivia", text: "Arturo Gatti · born Montreal · three Fights of the Year with Micky Ward." },
  { kind: "trivia", text: "Gatti vs Ward I · Fight of the Year. A Canadian in a war." },
  { kind: "trivia", text: "Jean Pascal · Haitian-Canadian · light-heavy world champ out of Laval." },
  { kind: "trivia", text: "Pascal vs Hopkins · Bell Centre nights. Montreal on the world stage." },
  { kind: "trivia", text: "Adonis “Superman” Stevenson · KO'd Chad Dawson in 76 seconds for the WBC belt." },
  { kind: "trivia", text: "Stevenson · Haitian-Canadian southpaw · Knockout of the Year, 2013." },
  { kind: "trivia", text: "Scotty Olson · Edmonton's Bulldog · IBO flyweight world champ." },
  { kind: "trivia", text: "Leonard Dorin · Edmonton · IBF lightweight world champ." },
  { kind: "trivia", text: "Kirk Johnson · North Preston, N.S. · fought for the WBA heavyweight title." },
  { kind: "trivia", text: "Michael Olajide Jr. · Vancouver · a round from the WBA middleweight crown." },
  { kind: "trivia", text: "Arthur Biyarslanov · Toronto · Pan Am gold on home soil, 2015." },
  { kind: "trivia", text: "Ariane Fortin · Quebec · amateur world champion middleweight." },
  { kind: "trivia", text: "Tammara Thibeault · 2022 amateur world champ · Commonwealth gold too." },
  { kind: "trivia", text: "Amateur boxing in Canada runs through Boxing Canada. Nationals make teams." },
  { kind: "trivia", text: "The Canadian title is still a real belt. Earn it in a provincial ring." },
];

const FLOOR_WOMEN: FeedLine[] = [
  { kind: "trivia", text: "Jelena Mrdjenovich · Edmonton · long-time world featherweight champ." },
  { kind: "trivia", text: "Mrdjenovich · Canada's queen of the featherweights — belt after belt." },
  { kind: "trivia", text: "Kim Clavel · La Petite Furie · Montreal super-flyweight world champ." },
  { kind: "trivia", text: "Marie-Eve Dicaire · IBF super welter champ · Montreal technician." },
  { kind: "trivia", text: "Mary Spencer · three-time amateur world champ · Windsor to the Olympics." },
  { kind: "trivia", text: "Mandy Bujold · flyweight · Commonwealth gold and Olympic ring." },
  { kind: "trivia", text: "Tammara Thibeault · amateur world middleweight champ · Team Canada." },
  { kind: "trivia", text: "Caroline Veyre · Canadian amateur standout · Olympic boxing." },
  { kind: "trivia", text: "Women's boxing is championship boxing. Canada keeps proving it." },
];

const FLOOR_CURRENT: FeedLine[] = [
  { kind: "trivia", text: "Artur Beterbiev · fights out of Montreal · undisputed light heavyweight." },
  { kind: "trivia", text: "Christian Mbilli · Montreal super middleweight · ranked and coming." },
  { kind: "trivia", text: "Erik Bazinyan · Montreal · undefeated super middleweight hunter." },
  { kind: "trivia", text: "Custio Clayton · Dartmouth · Olympic welter, title-fight nights." },
  { kind: "trivia", text: "Wyatt Sanford · Nova Scotia · Olympic and Commonwealth boxing." },
  { kind: "trivia", text: "Steve Claggett · Calgary · super lightweight who keeps crashing the party." },
  { kind: "trivia", text: "Arslanbek Makhmudov · Montreal heavyweight · the Lion out of Quebec." },
  { kind: "trivia", text: "Lucian Bute · former super middleweight world champ · Quebec ring lore." },
  { kind: "trivia", text: "Eleider Alvarez · Montreal · the night he dropped Kovalev." },
];

const FLOOR_SYSTEM: FeedLine[] = [
  { kind: "system", text: "Sully XP for showing up. Levels for staying." },
  { kind: "system", text: "Passport stamps every class you finish." },
  { kind: "system", text: "Streaks pay bonus Sully XP. Miss a day, start over." },
  { kind: "system", text: "Book your spot. Last spots go fast." },
  { kind: "system", text: "Check in. Train. Earn Sully XP. Repeat." },
  { kind: "system", text: "Floor leaderboard is Sully XP — claim it today." },
  { kind: "system", text: "10-second clap — finish the round." },
  { kind: "system", text: "Character before the bell." },
  { kind: "system", text: "We don't lower standards. We raise people." },
  { kind: "system", text: "Family on the floor. Kids in the craft." },
  { kind: "system", text: "Youth boxing · kids 6–14 · ask the desk." },
];

const TICKER_FIRST_MS = 10000;
const TICKER_SCROLL_MS = 18000;
const TICKER_HOLD_MS = 7000;

const FLOOR_DEMO_CLASSES = [
  { title: "Beginner Boxing", coach: "Tony Morrison" },
  { title: "Open Gym", coach: "Tony Morrison" },
  { title: "Women's Boxing", coach: "Jacklyne Irvine" },
  { title: "Competitive Team", coach: "Rico Mancini" },
  { title: "Pads", coach: "Winslow" },
  { title: "Youth Boxing", coach: "Winslow" },
] as const;

function isKidsBoxingTitle(title?: string | null) {
  return Boolean(title && /kids boxing/i.test(title));
}

const CHECKIN_TEMPLATES = [
  (name: string) => `${name} · on the floor`,
  (name: string) => `Laced up · ${name}`,
  (name: string) => `${name} checked in`,
  (name: string) => `${name} · ready for the bell`,
  (name: string) => `In the house · ${name}`,
] as const;

function shuffleFeed<T>(items: T[], seed: number): T[] {
  const next = items.slice();
  let state = seed || 1;
  for (let i = next.length - 1; i > 0; i -= 1) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

function weaveFloorFeed(input: {
  checkIns: { name: string }[];
  liveTitle: string | null;
  roundLabel: string | null;
  leaderName: string | null;
  leaderXp: number | null;
  checkInsToday: number | null;
  spotsOpen: number | null;
  minute: number;
}): FeedLine[] {
  const knowledge = shuffleFeed(
    [
      ...FLOOR_QUOTES,
      ...FLOOR_SULLYS,
      ...FLOOR_CHUVALO,
      ...FLOOR_CANADA,
      ...FLOOR_VARGAS,
      ...FLOOR_HERON,
      ...FLOOR_MORRISON,
      ...FLOOR_EAST,
      ...FLOOR_HISTORY,
      ...FLOOR_WOMEN,
      ...FLOOR_CURRENT,
      ...FLOOR_TRIVIA,
      ...FLOOR_SYSTEM,
    ].filter(
      (line, index, all) =>
        all.findIndex((other) => other.text === line.text) === index,
    ),
    input.minute,
  );

  const extras: FeedLine[] = [];
  if (input.roundLabel) {
    extras.push({ kind: "system", text: input.roundLabel });
  }
  if (input.liveTitle) {
    extras.push({ kind: "system", text: `Live now · ${input.liveTitle}` });
  }
  if (input.leaderName) {
    extras.push({
      kind: "system",
      text: `${input.leaderName} leads the floor${input.leaderXp != null ? ` · ${input.leaderXp} XP` : ""}`,
    });
  }
  if (input.checkInsToday != null && input.checkInsToday > 0) {
    extras.push({
      kind: "system",
      text: `${input.checkInsToday} check-ins on the board today`,
    });
  }
  if (input.spotsOpen != null && input.spotsOpen > 0) {
    extras.push({ kind: "system", text: `${input.spotsOpen} spots still open` });
  }
  input.checkIns.forEach((person, i) => {
    extras.push({
      kind: "checkin",
      text: CHECKIN_TEMPLATES[i % CHECKIN_TEMPLATES.length](person.name),
    });
  });

  const out: FeedLine[] = [];
  const insertEvery = extras.length
    ? Math.max(2, Math.floor(knowledge.length / extras.length))
    : Number.POSITIVE_INFINITY;
  let extraIndex = 0;
  knowledge.forEach((line, i) => {
    out.push(line);
    if (extraIndex < extras.length && (i + 1) % insertEvery === 0) {
      out.push(extras[extraIndex]);
      extraIndex += 1;
    }
  });
  while (extraIndex < extras.length) {
    out.push(extras[extraIndex]);
    extraIndex += 1;
  }
  return out;
}

type RoundPhase = "work" | "rest";

type RoundState = {
  phase: RoundPhase;
  round: number;
  totalRounds: number | null;
  secondsLeft: number;
  secondsInPhase: number;
  progress: number;
  syncedToClass: boolean;
};

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function readTimerConfig() {
  if (typeof window === "undefined") {
    return { workSec: 180, restSec: 60, rounds: 12 };
  }
  const params = new URLSearchParams(window.location.search);
  const workSec = Math.max(30, Number(params.get("work")) || 180);
  const restSec = Math.max(15, Number(params.get("rest")) || 60);
  const rounds = Math.max(1, Number(params.get("rounds")) || 12);
  return { workSec, restSec, rounds };
}

/** Boxing-style interval timer — syncs to live class start, else wall-clock cycle. */
function computeRoundState(
  now: Date,
  live: SessionCard | null,
  workSec: number,
  restSec: number,
  configuredRounds: number,
): RoundState {
  const cycle = workSec + restSec;

  if (live?.phase === "live") {
    const start = new Date(live.startsAt).getTime();
    const end = new Date(live.endsAt).getTime();
    const elapsedMs = Math.max(0, now.getTime() - start);
    const classDurationSec = Math.max(1, Math.floor((end - start) / 1000));
    const totalRounds = Math.max(
      1,
      Math.min(configuredRounds, Math.ceil(classDurationSec / cycle)),
    );
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const cycleIndex = Math.floor(elapsedSec / cycle);
    const round = Math.min(totalRounds, cycleIndex + 1);
    const intoCycle = elapsedSec % cycle;
    const inWork = intoCycle < workSec;
    const secondsInPhase = inWork ? workSec : restSec;
    const secondsLeft = inWork
      ? workSec - intoCycle
      : restSec - (intoCycle - workSec);

    return {
      phase: inWork ? "work" : "rest",
      round,
      totalRounds,
      secondsLeft: Math.max(0, secondsLeft),
      secondsInPhase,
      progress: 1 - Math.max(0, secondsLeft) / secondsInPhase,
      syncedToClass: true,
    };
  }

  // Open-gym / between classes: shared wall-clock sync (all screens match)
  const epochSec = Math.floor(now.getTime() / 1000);
  const intoCycle = epochSec % cycle;
  const inWork = intoCycle < workSec;
  const secondsInPhase = inWork ? workSec : restSec;
  const secondsLeft = inWork
    ? workSec - intoCycle
    : restSec - (intoCycle - workSec);
  const round = Math.floor(epochSec / cycle) % configuredRounds || configuredRounds;

  return {
    phase: inWork ? "work" : "rest",
    round,
    totalRounds: configuredRounds,
    secondsLeft: Math.max(0, secondsLeft),
    secondsInPhase,
    progress: 1 - Math.max(0, secondsLeft) / secondsInPhase,
    syncedToClass: false,
  };
}

const CACHE_PREFIX = "sullys.tv.board.";

function cacheKey(profile: string) {
  return `${CACHE_PREFIX}${profile}`;
}

function readCachedBoard(profile: string): Board | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(profile));
    if (!raw) return null;
    return JSON.parse(raw) as Board;
  } catch {
    return null;
  }
}

function writeCachedBoard(profile: string, data: Board) {
  try {
    localStorage.setItem(cacheKey(profile), JSON.stringify(data));
  } catch {
    // quota / private mode — ignore
  }
}

export function TvBoard({ profile }: { profile: "floor" | "reception" }) {
  const brand = getBrand();
  const floor = floorLabel(brand.copy.appName);
  const [board, setBoard] = useState<Board | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [offline, setOffline] = useState(false);
  const [riveEnabled, setRiveEnabled] = useState(true);
  const [demoCelebrate, setDemoCelebrate] = useState(false);
  const [popupFreeze, setPopupFreeze] = useState<FloorPopupMode | null>(null);
  const [noteFreeze, setNoteFreeze] = useState<string | null>(null);
  const [demoModeIndex, setDemoModeIndex] = useState(0);
  const [timerCfg, setTimerCfg] = useState({
    workSec: 180,
    restSec: 60,
    rounds: 12,
  });
  const [soundReady, setSoundReady] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [adOn, setAdOn] = useState(false);
  const [tickerHold, setTickerHold] = useState(false);
  const [infoIndex, setInfoIndex] = useState(0);
  const [demoClassIndex, setDemoClassIndex] = useState(0);
  const [arrivalName, setArrivalName] = useState<string | null>(null);
  const warnedPhaseRef = useRef<string | null>(null);
  const startBellRef = useRef<string | null>(null);
  const previousTvModeRef = useRef<string | null>(null);
  const lastArrivalRef = useRef<string | null>(null);

  useEffect(() => {
    setTimerCfg(readTimerConfig());
    setRiveEnabled(readRiveEnabled());
    setDemoCelebrate(readDemoCelebrate());
    setPopupFreeze(readPopupFreeze());
    setNoteFreeze(readNoteFreeze());
    setSoundReady(isBoxingTimerSoundUnlocked());
    const cached = readCachedBoard(profile);
    if (cached) setBoard(cached);
  }, [profile]);

  useEffect(() => {
    if (!demoCelebrate || popupFreeze || profile !== "floor") return;
    const cycle = setInterval(() => {
      setDemoModeIndex((i) => (i + 1) % DEMO_MODES.length);
    }, 4000);
    return () => clearInterval(cycle);
  }, [demoCelebrate, popupFreeze, profile]);

  useEffect(() => {
    if (profile !== "floor" || popupFreeze || demoCelebrate) {
      setAdOn(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const show = () => {
      if (cancelled) return;
      setAdIndex((i) => (i + 1) % FLOOR_ADS.length);
      setAdOn(true);
      timer = setTimeout(hide, 12000);
    };
    const hide = () => {
      if (cancelled) return;
      setAdOn(false);
      timer = setTimeout(show, 16000);
    };
    timer = setTimeout(show, 6000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [demoCelebrate, popupFreeze, profile]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let holding = false;
    const tick = () => {
      holding = !holding;
      setTickerHold(holding);
      if (holding) setInfoIndex((i) => i + 1);
      timer = setTimeout(tick, holding ? TICKER_HOLD_MS : TICKER_SCROLL_MS);
    };
    timer = setTimeout(tick, TICKER_FIRST_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile !== "floor") return;
    const cycle = window.setInterval(() => {
      setDemoClassIndex((i) => (i + 1) % FLOOR_DEMO_CLASSES.length);
    }, 40000);
    return () => window.clearInterval(cycle);
  }, [profile]);

  const coachLive = Boolean(board?.coachTimer);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/tv/board?profile=${profile}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Board ${res.status}`);
        const data = (await res.json()) as Board;
        if (!cancelled) {
          setBoard(data);
          writeCachedBoard(profile, data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) {
          const cached = readCachedBoard(profile);
          if (cached) {
            setBoard(cached);
            setOffline(true);
          } else {
            setOffline(true);
          }
        }
      }
    }
    void load();
    // 500ms while coach live (tighter TV sync); else 3s floor / 15s reception
    const ms =
      profile === "floor" ? (coachLive || demoCelebrate ? 500 : 3_000) : 15_000;
    const poll = setInterval(load, ms);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [profile, coachLive, demoCelebrate]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(tick);
  }, []);

  const latestArrivalName = board?.ticker?.[0]?.name ?? null;
  const latestArrivalAt = board?.ticker?.[0]?.at ?? null;

  useEffect(() => {
    if (profile !== "reception" || !latestArrivalName || !latestArrivalAt) return;
    const arrivalKey = `${latestArrivalName}:${latestArrivalAt}`;
    if (lastArrivalRef.current === arrivalKey) return;
    lastArrivalRef.current = arrivalKey;
    const age = Date.now() - new Date(latestArrivalAt).getTime();
    if (age < 0 || age > 60_000) return;
    setArrivalName(latestArrivalName);
    const hide = window.setTimeout(() => setArrivalName(null), 7_000);
    return () => window.clearTimeout(hide);
  }, [latestArrivalAt, latestArrivalName, profile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen();
        } else {
          void document.exitFullscreen();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function enableSound() {
    // Plays an audible double-clap immediately so speakers are confirmed
    const ok = await testBoxingTimerSound();
    setSoundReady(ok);
  }

  const focus = board?.live ?? board?.next ?? null;
  const demoClass = FLOOR_DEMO_CLASSES[demoClassIndex] ?? FLOOR_DEMO_CLASSES[0];
  const scheduledTitle = focus?.title ?? null;
  const timerTitle = board?.coachTimer?.title ?? null;
  const floorClassTitle =
    scheduledTitle && !isKidsBoxingTitle(scheduledTitle)
      ? scheduledTitle
      : timerTitle && !isKidsBoxingTitle(timerTitle)
        ? timerTitle
        : demoClass.title;
  const floorClassCoach =
    floorClassTitle === scheduledTitle && focus?.coach
      ? focus.coach
      : floorClassTitle === timerTitle && board?.coachTimer?.coach
        ? board.coachTimer.coach
        : demoClass.coach;

  const classCountdown = useMemo(() => {
    if (!focus) return null;
    const target =
      focus.phase === "live"
        ? new Date(focus.endsAt).getTime()
        : new Date(focus.startsAt).getTime();
    return Math.max(0, Math.floor((target - now.getTime()) / 1000));
  }, [focus, now]);
  const boardAgeSeconds = board?.asOf
    ? Math.max(0, Math.floor((now.getTime() - new Date(board.asOf).getTime()) / 1000))
    : null;
  const bookingPercent = focus?.capacity
    ? Math.min(100, Math.round((focus.booked / focus.capacity) * 100))
    : 0;

  const round = useMemo(() => {
    const ct = board?.coachTimer;
    if (ct?.syncedToCoach) {
      const secondsInPhase = ct.phase === "work" ? ct.workSec : ct.restSec;
      let secondsLeft = ct.secondsLeft;
      if (ct.status === "paused") {
        secondsLeft = ct.pausedRemainSec ?? ct.secondsLeft;
      } else if (ct.status === "running" && ct.phaseEndsAt) {
        secondsLeft = Math.max(
          0,
          Math.ceil((new Date(ct.phaseEndsAt).getTime() - now.getTime()) / 1000),
        );
      }
      return {
        phase: (ct.phase === "rest" ? "rest" : "work") as RoundPhase,
        round: ct.round,
        totalRounds: ct.totalRounds,
        secondsLeft,
        secondsInPhase,
        progress: 1 - secondsLeft / Math.max(1, secondsInPhase),
        syncedToClass: true,
        coachControlled: true,
        paused: ct.status === "paused",
      };
    }
    return {
      ...computeRoundState(
        now,
        board?.live ?? null,
        timerCfg.workSec,
        timerCfg.restSec,
        timerCfg.rounds,
      ),
      coachControlled: false,
      paused: false,
    };
  }, [now, board?.live, board?.coachTimer, timerCfg]);

  // Boxing timer SFX — one bell per phase and a 10s wooden double-clap.
  useEffect(() => {
    if (profile !== "floor" || !soundReady) return;
    if (round.paused) return;

    const ct = board?.coachTimer;
    const running = ct ? ct.status === "running" : true;
    if (!running) return;

    const phaseKey = ct
      ? `${ct.sessionId}:${ct.phase}:${ct.round}:${ct.phaseEndsAt ?? ""}`
      : `auto:${round.phase}:${round.round}:${round.secondsInPhase}`;
    const left = round.secondsLeft;

    // Bell once when a new running phase begins (near full duration)
    if (
      left >= round.secondsInPhase - 1 &&
      left > 10 &&
      startBellRef.current !== phaseKey
    ) {
      startBellRef.current = phaseKey;
      playRoundBell();
    }

    // Fire once when we first enter the final 10s
    if (left <= 10 && left > 0 && warnedPhaseRef.current !== phaseKey) {
      warnedPhaseRef.current = phaseKey;
      playTenSecondWarning();
    }
  }, [
    profile,
    soundReady,
    round.paused,
    round.secondsLeft,
    round.secondsInPhase,
    round.phase,
    round.round,
    board?.coachTimer,
  ]);

  const floorFeed = useMemo(() => {
    const checkIns = board?.ticker?.length ? board.ticker : [];
    const liveTitle = board?.live?.title ?? board?.coachTimer?.title ?? null;
    const leader = board?.leaderboard?.[0] ?? null;
    return weaveFloorFeed({
      checkIns,
      liveTitle,
      roundLabel: `${round.phase === "work" ? "Work" : "Rest"} · round ${round.round}${round.totalRounds ? ` of ${round.totalRounds}` : ""}`,
      leaderName: leader?.displayName ?? null,
      leaderXp: leader?.xp ?? null,
      checkInsToday: board?.kpis.checkInsToday ?? null,
      spotsOpen: board?.kpis.spotsOpen ?? null,
      minute: Math.floor(now.getTime() / (10 * 60 * 1000)),
    });
  }, [
    board,
    round.phase,
    round.round,
    round.totalRounds,
    Math.floor(now.getTime() / (10 * 60 * 1000)),
  ]);

  const demoMode = DEMO_MODES[demoModeIndex] ?? "achievement";
  const coachMode = board?.coachTimer?.tvMode ?? "timer";
  const liveEvent =
    coachMode !== "timer" && hasArtPopup(coachMode) && !popupFreeze && !demoCelebrate;
  const infoFacts = useMemo(
    () => floorFeed.filter((line) => line.kind === "trivia"),
    [floorFeed],
  );
  const infoLine = infoFacts.length
    ? infoFacts[infoIndex % infoFacts.length]
    : null;
  const infoText = (infoLine?.text ?? "").replace(/^Trivia · /, "");
  const floorAd = adOn && profile === "floor" ? FLOOR_ADS[adIndex] : null;
  const tvMode =
    popupFreeze && profile === "floor"
      ? popupFreeze
      : demoCelebrate && profile === "floor"
        ? demoMode
        : liveEvent
          ? coachMode
          : floorAd
            ? floorAd.mode
            : coachMode;
  const modeActive =
    profile === "floor" &&
    (Boolean(board?.coachTimer) ||
      demoCelebrate ||
      Boolean(popupFreeze) ||
      Boolean(floorAd));
  const showAnnouncement =
    modeActive &&
    tvMode === "announcement" &&
    (board?.coachTimer || demoCelebrate || Boolean(popupFreeze));
  const showLeaderboardHero =
    modeActive && tvMode === "leaderboard";
  const showTeamsHero = modeActive && tvMode === "teams";
  const showChallengeHero =
    modeActive && (tvMode === "challenge" || tvMode === "achievement");
  const showClassComplete = modeActive && tvMode === "class_complete";
  const showXpBonusHero = modeActive && tvMode === "xp_bonus";
  const showRoundHero =
    !showAnnouncement &&
    !showLeaderboardHero &&
    !showTeamsHero &&
    !showChallengeHero &&
    !showClassComplete &&
    !showXpBonusHero &&
    (profile === "floor" || board?.live?.phase === "live");
  const riveActive =
    profile === "floor" &&
    (Boolean(board?.coachTimer) ||
      demoCelebrate ||
      Boolean(popupFreeze) ||
      Boolean(floorAd));
  const showArtPopup =
    riveActive &&
    hasArtPopup(tvMode) &&
    (tvMode !== "timer" || Boolean(popupFreeze) || demoCelebrate || Boolean(floorAd));
  const sceneKey = `${tvMode}:${round.phase}:${round.round}:${
    board?.coachTimer?.currentExercise?.title ?? ""
  }:${board?.coachTimer?.tvMessage ?? ""}`;

  useEffect(() => {
    if (profile !== "floor" || !soundReady) return;
    const previous = previousTvModeRef.current;
    previousTvModeRef.current = tvMode;
    if (!previous || previous === tvMode) return;
    if (
      tvMode === "achievement" ||
      tvMode === "class_complete" ||
      tvMode === "xp_bonus" ||
      tvMode === "challenge"
    ) {
      playCelebrationCue(tvMode);
    }
  }, [profile, soundReady, tvMode]);

  const topName = board?.leaderboard?.[0]?.displayName ?? null;
  const riveXp =
    tvMode === "class_complete"
      ? 25
      : tvMode === "achievement" || tvMode === "xp_bonus"
        ? 50
        : tvMode === "leaderboard" && board?.leaderboard?.[0]?.xp
          ? Math.min(99, board.leaderboard[0].xp % 100 || 10)
          : null;
  const riveBonusLabel =
    tvMode === "xp_bonus"
      ? "STREAK ×2"
      : tvMode === "achievement"
        ? "FIRST BELL"
        : tvMode === "class_complete"
          ? "CLASS BONUS"
          : tvMode === "leaderboard"
            ? "BOARD KING"
            : null;

  return (
    <div
      className={`${styles.shell} ${
        round.phase === "work" ? styles.phaseWork : styles.phaseRest
      } ${showArtPopup ? styles.shellArt : ""}`}
      data-profile={profile}
      onClick={() => {
        if (profile === "floor" && !soundReady) void enableSound();
      }}
    >
      {profile === "floor" ? (
        <button
          type="button"
          className={styles.soundUnlock}
          onClick={(e) => {
            e.stopPropagation();
            void enableSound();
          }}
        >
          {soundReady ? "🔊 Test sound (double clap)" : "Tap for sound — hear clap now"}
        </button>
      ) : null}
      {profile === "reception" && arrivalName ? (
        <div className={styles.arrivalMoment} role="status" aria-live="polite">
          <div className={styles.arrivalMark} aria-hidden>
            S
          </div>
          <div>
            <p>Welcome to Sully&apos;s</p>
            <strong>{arrivalName}</strong>
            <span>Checked in · ready for the bell</span>
          </div>
        </div>
      ) : null}
      {offline ? (
        <div className={styles.offlineBanner} role="status">
          Offline · last good board · timer running
        </div>
      ) : null}
      <header className={styles.top}>
        <div className={styles.brand}>
          <Image
            src={brand.assets.logoPrimary}
            alt={brand.assets.logoAlt}
            width={132}
            height={170}
            className={styles.logo}
            priority
          />
          <div className={styles.brandText}>
            <p className={styles.brandName}>{brand.copy.appName}</p>
            <p className={styles.brandSub}>
              {brand.copy.brandSub} · EST{" "}
              {board?.gym.established ?? brand.copy.established}
            </p>
            <p className={styles.profile}>
              {profile === "floor" ? "Training floor" : "Reception"}
            </p>
            {profile === "reception" ? (
              <p className={styles.deskStatus}>
                <span aria-hidden />
                {offline
                  ? "Saved board"
                  : boardAgeSeconds == null
                    ? "Connecting"
                    : `Live desk · ${boardAgeSeconds}s`}
              </p>
            ) : null}
          </div>
        </div>
        <div className={styles.clockBlock}>
          <p className={styles.clock}>{formatClock(now)}</p>
          <p className={styles.date}>
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <div className={`${styles.main} ${showArtPopup ? styles.mainArt : ""}`}>
        <section
          className={`${styles.hero} ${showArtPopup ? styles.heroArt : ""}`}
          aria-live="polite"
        >
          <TvRiveLayer
            active={riveActive}
            enabled={riveEnabled}
            tvMode={tvMode}
            phase={round.phase === "rest" ? "rest" : "work"}
            xpBonus={riveXp}
            bonusLabel={riveBonusLabel}
            artCover={showArtPopup}
            roundClock={formatCountdown(round.secondsLeft)}
            roundLabel={`${round.phase === "rest" ? "REST" : "WORK"}  •  ROUND ${round.round}${round.totalRounds ? ` / ${round.totalRounds}` : ""}`}
            rankLabel={board?.leaderboard?.[0] ? String(board.leaderboard[0].rank).padStart(2, "0") : null}
            scoreLabel={
              board?.leaderboard?.[0]
                ? `${board.leaderboard[0].xp} XP  •  LEVEL ${board.leaderboard[0].level}`
                : null
            }
            teamA={
              board?.coachTimer?.teams?.[0]
                ? {
                    name: board.coachTimer.teams[0].name,
                    points: board.coachTimer.teams[0].points,
                  }
                : demoCelebrate
                  ? { name: "Red Corner", points: 120 }
                  : null
            }
            teamB={
              board?.coachTimer?.teams?.[1]
                ? {
                    name: board.coachTimer.teams[1].name,
                    points: board.coachTimer.teams[1].points,
                  }
                : demoCelebrate
                  ? { name: "Blue Corner", points: 110 }
                  : null
            }
            highlightName={
              tvMode === "leaderboard" || tvMode === "xp_bonus"
                ? topName ?? (demoCelebrate ? "Gavin S" : null)
                : tvMode === "achievement"
                  ? (demoCelebrate ? "Gavin S" : topName)
                  : topName
            }
            heroSrc={floorAd?.hero ?? null}
            headline1={floorAd?.h1 ?? null}
            headline2={floorAd?.h2 ?? null}
            message={floorAd?.msg ?? board?.coachTimer?.tvMessage}
          />
          {profile === "floor" && riveEnabled && !showArtPopup ? (
            <TvBoxerRig motion={round.phase === "rest" ? "rest" : "work"} />
          ) : null}
          {profile === "floor" && noteFreeze && !showArtPopup ? (
            <TvArtNote
              mode={noteFreeze}
              title={
                noteFreeze === "nameplate" || noteFreeze === "birthday"
                  ? topName
                  : null
              }
            />
          ) : null}
          {showRoundHero && !showArtPopup ? (
            <div className={styles.phaseCurtain} key={`curtain-${sceneKey}`}>
              <span>{round.phase === "work" ? "WORK" : "REST"}</span>
              <strong>ROUND {String(round.round).padStart(2, "0")}</strong>
            </div>
          ) : null}
          {showArtPopup ? null : (
          <div
            key={sceneKey}
            className={`${styles.heroContent} ${
              showRoundHero ? styles.sceneRound : styles.sceneCelebration
            }`}
          >
          {showXpBonusHero ? (
            <>
              <p className={styles.phase}>XP bonus</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage || "+50 XP"}
              </h1>
              <p className={styles.meta}>
                {topName ?? (demoCelebrate ? "Gavin S" : "Floor athlete")}
                {" · keep swinging"}
              </p>
            </>
          ) : null}
          {showAnnouncement ? (
            <>
              <p className={styles.phase}>Coach announcement</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage || "Eyes up — listen in"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.title}
                {board?.coachTimer?.coach
                  ? ` · Coach ${board.coachTimer.coach}`
                  : ""}
              </p>
            </>
          ) : null}
          {showClassComplete ? (
            <>
              <p className={styles.phase}>Class complete</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ??
                  (demoCelebrate ? "Demo class complete" : "Session done")}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.tvMessage || "XP awarded · see you next bell"}
              </p>
            </>
          ) : null}
          {showTeamsHero ? (
            <>
              <p className={styles.phase}>Team battle</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ?? (demoCelebrate ? "Red vs Gold" : "Teams")}
              </h1>
              <ul className={styles.boardList} style={{ marginTop: "1.25rem" }}>
                {(board?.coachTimer?.teams ??
                  (demoCelebrate
                    ? [
                        {
                          rank: 1,
                          name: "Red Corner",
                          color: "#c82026",
                          points: 42,
                          members: [],
                        },
                        {
                          rank: 2,
                          name: "Gold Corner",
                          color: "#c4a06a",
                          points: 38,
                          members: [],
                        },
                      ]
                    : [])
                ).map((t) => (
                  <li key={t.name}>
                    <span>
                      #{t.rank} {t.name}
                    </span>
                    <strong>{t.points}</strong>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {showChallengeHero ? (
            <>
              <p className={styles.phase}>
                {tvMode === "achievement" ? "Achievement" : "Challenge"}
              </p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage ||
                  board?.coachTimer?.challenges?.[0]?.name ||
                  (demoCelebrate
                    ? tvMode === "achievement"
                      ? "First bell of the day"
                      : "30 clean jabs"
                    : "Eyes on the prize")}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.title ??
                  (demoCelebrate ? "Celebration preview" : "")}
                {board?.coachTimer?.currentExercise
                  ? ` · ${board.coachTimer.currentExercise.title}`
                  : ""}
              </p>
            </>
          ) : null}
          {showLeaderboardHero ? (
            <>
              <p className={styles.phase}>Floor leaderboard</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ?? "Claim the board"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.coach
                  ? `Coach ${board.coachTimer.coach}`
                  : floor}
                {" · coach controlled"}
              </p>
              <ul className={styles.boardList} style={{ marginTop: "1.25rem" }}>
                {(board?.leaderboard ?? []).slice(0, 6).map((row) => (
                  <li key={row.rank} className={styles.boardRow}>
                    <span>
                      <span className={styles.rank}>
                        {String(row.rank).padStart(2, "0")}
                      </span>
                      <strong>{row.displayName}</strong>
                    </span>
                    <span>
                      {row.score != null
                        ? `${row.score} pts`
                        : `${row.xp} XP · L${row.level}`}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {showRoundHero ? (
            <>
              <p className={styles.phase}>
                {round.phase === "work" ? "Work" : "Rest"}
                {" · "}
                Round {String(round.round).padStart(2, "0")}
                {round.totalRounds
                  ? ` / ${String(round.totalRounds).padStart(2, "0")}`
                  : ""}
              </p>
              <h1 className={styles.classTitle}>
                {floorClassTitle}
              </h1>
              <p className={styles.meta}>
                {floorClassCoach
                  ? `Coach ${floorClassCoach}`
                  : floor}
                {board?.coachTimer?.nextExercise
                  ? ` · Next: ${board.coachTimer.nextExercise.title}`
                  : ""}
                {focus && !board?.coachTimer
                  ? ` · ${focus.booked}/${focus.capacity} · ${focus.spotsLeft} spots`
                  : ""}
                {round.paused ? " · PAUSED" : ""}
                {classCountdown !== null && focus?.phase === "live" && !board?.coachTimer
                  ? ` · class ${formatCountdown(classCountdown)}`
                  : focus?.phase === "upcoming" && classCountdown !== null
                    ? ` · starts ${formatCountdown(classCountdown)}`
                    : ""}
              </p>
              <p className={styles.timerLabel}>
                {round.phase === "work" ? "Round clock" : "Rest clock"}
                {round.coachControlled
                  ? " · coach controlled"
                  : round.syncedToClass
                    ? " · synced to class"
                    : " · open gym sync"}
              </p>
              <p className={styles.timer}>
                {formatCountdown(round.secondsLeft)}
              </p>
              <div
                className={styles.roundBar}
                role="progressbar"
                aria-valuenow={Math.round(round.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={styles.roundBarFill}
                  style={{ width: `${Math.min(100, round.progress * 100)}%` }}
                />
              </div>
              <p className={styles.roundMeta}>
                {Math.floor(timerCfg.workSec / 60)}:
                {String(timerCfg.workSec % 60).padStart(2, "0")} work
                {" · "}
                {Math.floor(timerCfg.restSec / 60)}:
                {String(timerCfg.restSec % 60).padStart(2, "0")} rest
              </p>
            </>
          ) : !modeActive ? (
            profile === "reception" ? (
              <>
                <div className={styles.receptionStatus}>
                  <span aria-hidden />
                  {focus?.phase === "live"
                    ? "Class in progress"
                    : focus
                      ? "Next on the floor"
                      : "Open gym"}
                </div>
                <p className={styles.phase}>
                  {focus?.program ?? "Today at Sully's"}
                </p>
                <h1 className={styles.classTitle}>
                  {focus?.title ?? "Welcome to the gym"}
                </h1>
                <p className={styles.meta}>
                  {focus?.coach ? `Coach ${focus.coach}` : "Front desk ready"}
                  {focus
                    ? ` · ${new Date(focus.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}`
                    : " · Come in and say hello"}
                </p>
                {classCountdown !== null ? (
                  <div className={styles.receptionCountdown}>
                    <div>
                      <span>
                        {focus?.phase === "live" ? "Time left" : "Starts in"}
                      </span>
                      <strong>{formatCountdown(classCountdown)}</strong>
                    </div>
                    <div className={styles.capacityStatus}>
                      <span>
                        {focus?.booked ?? 0} of {focus?.capacity ?? 0} booked
                      </span>
                      <div aria-hidden>
                        <i style={{ width: `${bookingPercent}%` }} />
                      </div>
                      <strong>
                        {focus?.spotsLeft
                          ? `${focus.spotsLeft} spots available`
                          : "Class is full"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className={styles.receptionWelcome}>
                    Lace up · show respect · build character
                  </p>
                )}
              </>
            ) : (
              <>
                <p className={styles.phase}>
                  {focus?.phase === "live"
                    ? "Live now"
                    : focus
                      ? "Up next"
                      : "Open gym"}
                </p>
                <h1 className={styles.classTitle}>
                  {focus?.title ?? "Train with purpose"}
                </h1>
                <p className={styles.meta}>
                  {focus?.coach ? `Coach ${focus.coach}` : "Sully's floor"}
                  {focus
                    ? ` · ${focus.booked}/${focus.capacity} · ${focus.spotsLeft} spots`
                    : ""}
                </p>
                {classCountdown !== null ? (
                  <>
                    <p className={styles.timerLabel}>
                      {focus?.phase === "live"
                        ? "Class time remaining"
                        : "Starts in"}
                    </p>
                    <p className={styles.timer}>
                      {formatCountdown(classCountdown)}
                    </p>
                  </>
                ) : (
                  <p className={styles.meta}>Character before the bell.</p>
                )}
              </>
            )
          ) : null}
          </div>
          )}
        </section>

        <aside className={styles.side}>
          {profile === "floor" ? (
            <div className={`${styles.panel} ${styles.roundPanel}`}>
              <p className={styles.panelTitle}>Round status</p>
              <p className={styles.roundStatusBig}>
                {round.phase === "work" ? "WORK" : "REST"}
              </p>
              <p className={styles.meta}>
                Round {round.round}
                {round.totalRounds ? ` of ${round.totalRounds}` : ""}
                {" · "}
                {formatCountdown(round.secondsLeft)} left
              </p>
            </div>
          ) : null}

          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.checkInsToday ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Check-ins</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.classesToday ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Classes</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.spotsOpen ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Spots open</p>
            </div>
          </div>

          {profile === "floor" ? (
            <div className={`${styles.panel} ${styles.sideFill}`}>
              <p className={styles.panelTitle}>Floor leaderboard</p>
              <ul className={styles.boardList}>
                {(board?.leaderboard ?? []).slice(0, 5).map((row) => (
                  <li key={row.rank} className={styles.boardRow}>
                    <span>
                      <span className={styles.rank}>
                        {String(row.rank).padStart(2, "0")}
                      </span>
                      <strong>{row.displayName}</strong>
                    </span>
                    <span>
                      {row.score != null
                        ? `${row.score} pts`
                        : `${row.xp} XP · L${row.level}`}
                    </span>
                  </li>
                ))}
                {!board?.leaderboard?.length ? (
                  <li className={styles.boardRow}>
                    <span>Train today — claim the board</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : (
            <div className={`${styles.panel} ${styles.sideFill}`}>
              <p className={styles.panelTitle}>Today&apos;s schedule</p>
              <ul className={styles.boardList}>
                {(board?.schedule ?? []).slice(0, 6).map((s) => (
                  <li key={s.id} className={styles.boardRow}>
                    <span>
                      <strong>{s.title}</strong>
                    </span>
                    <span>
                      {new Date(s.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {s.spotsLeft} left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </aside>
      </div>

      <footer className={styles.bottom}>
        <div
          className={`${styles.ticker} ${tickerHold && infoText ? styles.isHold : ""}`}
          aria-label="Canadian boxing news"
        >
          <span className={styles.tickerFlag} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tv/icons/canada-flag.png" alt="" draggable={false} />
          </span>
          {tickerHold && infoText ? (
            <div className={styles.tickerInfo} aria-live="polite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/tv/icons/info.png"
                alt=""
                className={styles.tickerInfoIcon}
                draggable={false}
              />
              <span className={styles.tickerInfoMark}>INFO</span>
              <p className={styles.tickerInfoCopy}>{infoText}</p>
            </div>
          ) : null}
          <div className={styles.tickerCrawl} hidden={tickerHold && Boolean(infoText)}>
            <div className={styles.tickerTrack}>
            {[0, 1].map((copy) => (
              <div
                className={styles.tickerCopy}
                key={copy}
                aria-hidden={copy === 1}
              >
                {floorFeed.map((line, i) => (
                  <span
                    key={`${copy}-${line.kind}-${i}`}
                    className={
                      line.kind === "quote"
                        ? styles.tickerQuote
                        : line.kind === "trivia"
                          ? styles.tickerTrivia
                          : line.kind === "checkin"
                            ? styles.tickerCheckin
                            : styles.tickerSystem
                    }
                    data-kind={line.kind}
                  >
                    {line.text}
                  </span>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>
        <p className={styles.hint}>
          Press F for fullscreen
          {profile === "floor"
            ? soundReady
              ? " · Sound on"
              : ""
            : " · Auto-refreshes"}
        </p>
      </footer>
    </div>
  );
}
