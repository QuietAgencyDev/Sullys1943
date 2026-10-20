"use client";

import { useState } from "react";
import styles from "./tv-art-popup.module.css";

const CANVAS_W = 1600;
const CANVAS_H = 900;
const SHIELD = "/brand/sullys-heritage-shield.png";

const LAYERS = [
  { file: "01_panel.png", className: "panelLayer" },
  { file: "02_effects.png", className: "fxLayer" },
  { file: "03_hero.png", className: "heroLayer" },
  { file: "04_accent.png", className: "accentLayer" },
] as const;

const HEADLINE_IDS = new Set(["headline_1", "headline_2"]);
const STAT_IDS = new Set([
  "reward",
  "timer",
  "rank",
  "score_a",
  "score_b",
  "streak",
]);

type Field = {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  fill: string;
  live?: boolean;
};

type ArtSpec = {
  folder: string;
  brand: string;
  kind: string;
  kindFill: string;
  footer: string;
  fields: Field[];
};

const GOLD = "#F7C963";
const CREAM = "#FFF1D6";
const SCARLET = "#F52238";
const BLUE = "#65A9FF";

const SPECS: Record<string, ArtSpec> = {
  timer: {
    folder: "timer",
    brand: "SULLY’S BOXING GYM",
    kind: "ROUND TIMER",
    kindFill: GOLD,
    footer: "BREATHE. RESET. COME BACK STRONG.",
    fields: [
      { id: "headline_1", text: "TAKE A", x: 110, y: 350, size: 108, fill: CREAM },
      { id: "headline_2", text: "BREATHER.", x: 110, y: 462, size: 108, fill: CREAM },
      { id: "timer", text: "00:50", x: 112, y: 640, size: 176, fill: GOLD, live: true },
      {
        id: "round_label",
        text: "REST  •  ROUND 12 / 12",
        x: 118,
        y: 698,
        size: 30,
        fill: CREAM,
        live: true,
      },
    ],
  },
  class_complete: {
    folder: "class_complete",
    brand: "SULLY’S BOXING GYM",
    kind: "CLASS COMPLETE",
    kindFill: GOLD,
    footer: "BOXING IS THE ENGINE. PEOPLE ARE THE PURPOSE.",
    fields: [
      { id: "headline_1", text: "SESSION", x: 110, y: 350, size: 108, fill: CREAM },
      { id: "headline_2", text: "DONE!", x: 110, y: 462, size: 108, fill: CREAM },
      {
        id: "message",
        text: "GREAT WORK. SEE YOU NEXT BELL.",
        x: 118,
        y: 537,
        size: 30,
        fill: CREAM,
        live: true,
      },
      { id: "reward", text: "+25 XP", x: 118, y: 652, size: 92, fill: GOLD, live: true },
      {
        id: "reward_label",
        text: "CLASS BONUS",
        x: 118,
        y: 704,
        size: 28,
        fill: CREAM,
        live: true,
      },
    ],
  },
  leaderboard: {
    folder: "leaderboard",
    brand: "SULLY’S BOXING GYM",
    kind: "FLOOR LEADERBOARD",
    kindFill: GOLD,
    footer: "SHOW UP. PUT IN WORK. MOVE UP.",
    fields: [
      { id: "headline_1", text: "CLAIM THE", x: 110, y: 350, size: 108, fill: CREAM },
      { id: "headline_2", text: "BOARD.", x: 110, y: 462, size: 108, fill: CREAM },
      { id: "rank", text: "01", x: 118, y: 610, size: 100, fill: GOLD, live: true },
      {
        id: "member_name",
        text: "JORDAN M.",
        x: 300,
        y: 567,
        size: 43,
        fill: CREAM,
        live: true,
      },
      {
        id: "score",
        text: "70 XP  •  LEVEL 1",
        x: 300,
        y: 623,
        size: 29,
        fill: CREAM,
        live: true,
      },
    ],
  },
  challenge: {
    folder: "challenge",
    brand: "SULLY’S BOXING GYM",
    kind: "CHALLENGE",
    kindFill: SCARLET,
    footer: "FOCUS. FOOTWORK. FOLLOW THROUGH.",
    fields: [
      { id: "headline_1", text: "EYES ON", x: 110, y: 350, size: 108, fill: CREAM },
      { id: "headline_2", text: "THE PRIZE.", x: 110, y: 462, size: 108, fill: CREAM },
      {
        id: "challenge_name",
        text: "TODAY’S CHALLENGE",
        x: 118,
        y: 533,
        size: 28,
        fill: CREAM,
      },
      {
        id: "challenge_detail",
        text: "KEEP YOUR GUARD UP",
        x: 118,
        y: 595,
        size: 42,
        fill: CREAM,
        live: true,
      },
      {
        id: "progress",
        text: "3 / 5 ROUNDS",
        x: 118,
        y: 679,
        size: 45,
        fill: CREAM,
        live: true,
      },
    ],
  },
  teams: {
    folder: "teams",
    brand: "SULLY’S BOXING GYM",
    kind: "TEAM BATTLE",
    kindFill: BLUE,
    footer: "TRAIN TOGETHER. GROW TOGETHER.",
    fields: [
      { id: "headline_1", text: "YOUR CORNER.", x: 110, y: 350, size: 94, fill: CREAM },
      { id: "headline_2", text: "YOUR CREW.", x: 110, y: 462, size: 94, fill: CREAM },
      {
        id: "team_a",
        text: "RED CORNER",
        x: 118,
        y: 541,
        size: 33,
        fill: CREAM,
        live: true,
      },
      {
        id: "team_b",
        text: "BLUE CORNER",
        x: 510,
        y: 541,
        size: 33,
        fill: CREAM,
        live: true,
      },
      { id: "score_a", text: "120", x: 118, y: 652, size: 100, fill: SCARLET, live: true },
      { id: "score_b", text: "110", x: 510, y: 652, size: 100, fill: BLUE, live: true },
    ],
  },
  xp_bonus: {
    folder: "xp_bonus",
    brand: "SULLY’S BOXING GYM",
    kind: "SULLY XP",
    kindFill: GOLD,
    footer: "EVERY ROUND COUNTS.",
    fields: [
      { id: "headline_1", text: "+50 XP", x: 107, y: 424, size: 180, fill: GOLD, live: true },
      {
        id: "member_name",
        text: "JORDAN M.",
        x: 118,
        y: 524,
        size: 51,
        fill: CREAM,
        live: true,
      },
      {
        id: "message",
        text: "KEEP SWINGING.",
        x: 118,
        y: 582,
        size: 32,
        fill: CREAM,
        live: true,
      },
      {
        id: "streak",
        text: "STREAK ×2",
        x: 118,
        y: 680,
        size: 55,
        fill: GOLD,
        live: true,
      },
    ],
  },
  achievement: {
    folder: "achievement",
    brand: "SULLY’S BOXING GYM",
    kind: "ACHIEVEMENT UNLOCKED",
    kindFill: GOLD,
    footer: "YOUR NEXT CHAPTER STARTS HERE.",
    fields: [
      { id: "headline_1", text: "FIRST", x: 110, y: 350, size: 108, fill: CREAM },
      { id: "headline_2", text: "BELL!", x: 110, y: 462, size: 108, fill: CREAM },
      {
        id: "member_name",
        text: "JORDAN M.",
        x: 118,
        y: 543,
        size: 49,
        fill: CREAM,
        live: true,
      },
      { id: "reward", text: "+50 XP", x: 118, y: 665, size: 96, fill: GOLD, live: true },
    ],
  },
  check_in: card("check_in", "CHECK-IN", "ON THE", "FLOOR.", "LACE UP. YOU ARE HERE.", [
    nameField(),
    xpField("+10 XP"),
  ]),
  first_visit: card("first_visit", "FIRST BELL", "FIRST", "BELL!", "YOUR NEXT CHAPTER STARTS HERE.", [
    nameField(),
    xpField("+50 XP"),
  ]),
  level_up: card("level_up", "LEVEL UP", "LEVEL", "UP.", "KEEP CLIMBING.", [
    nameField(),
    xpField("+50 XP"),
    { id: "reward_label", text: "NEW LEVEL", x: 118, y: 720, size: 28, fill: CREAM, live: true },
  ]),
  streak: card("streak", "STREAK", "DON’T", "BREAK IT.", "SHOW UP AGAIN TOMORROW.", [
    nameField(),
    { id: "streak", text: "STREAK ×7", x: 118, y: 665, size: 72, fill: GOLD, live: true },
  ]),
  welcome_back: card("welcome_back", "WELCOME BACK", "LACE", "UP.", "GOOD TO HAVE YOU BACK.", [
    nameField(),
  ]),
  class_starting: card("class_starting", "UP NEXT", "CLASS", "STARTING.", "GET WRAPPED. GET ON THE FLOOR.", [
    { id: "message", text: "KIDS BOXING", x: 118, y: 543, size: 42, fill: CREAM, live: true },
    { id: "timer", text: "00:02:00", x: 118, y: 665, size: 72, fill: GOLD, live: true },
  ]),
  last_spots: card("last_spots", "FILL THE RING", "2 SPOTS", "LEFT.", "CLAIM THEM BEFORE THE BELL.", [
    { id: "message", text: "ADULTS BOXING", x: 118, y: 543, size: 36, fill: CREAM, live: true },
  ]),
  challenge_winner: card("challenge_winner", "WINNER", "TAKE THE", "WIN.", "EYES ON THE PRIZE.", [
    nameField(),
    xpField("+25 XP"),
  ]),
  session_mvp: card("session_mvp", "FIGHTER OF THE HOUR", "FIGHTER OF", "THE HOUR.", "SHOW UP. PUT IN WORK.", [
    nameField(),
  ]),
  kids: card("kids", "KIDS BOXING", "KIDS", "BOXING.", "GO. HAVE FUN. LISTEN UP.", [
    { id: "message", text: "KID 1  •  KID 2", x: 118, y: 543, size: 36, fill: CREAM },
  ]),
  kids_complete: card("kids_complete", "KIDS SESSION DONE", "SESSION", "DONE!", "SEE YOU NEXT BELL.", [
    xpField("+15 XP"),
  ]),
  heritage: card("heritage", "EST 1943", "EST", "1943.", "BOXING IS THE ENGINE.", []),
  announcement: card("announcement", "FROM THE DESK", "HANDS", "WRAPPED.", "PHONES DOWN. EYES UP.", [
    { id: "message", text: "LISTEN IN", x: 118, y: 543, size: 42, fill: CREAM, live: true },
  ]),
  birthday: card("birthday", "HAPPY BIRTHDAY", "HAPPY", "BIRTHDAY.", "MAKE IT A ROUND TO REMEMBER.", [
    nameField("KID 1"),
  ]),
  pads: card("pads", "PADS", "PADS.", "NOW.", "STATION 2. HANDS UP.", [
    { id: "message", text: "COACH 1", x: 118, y: 543, size: 42, fill: CREAM },
  ]),
  sparring: card("sparring", "SPARRING", "SPAR", "ON.", "HEADGEAR. CONTROL. RESPECT.", []),
  combo: card("combo", "COMBO OF THE ROUND", "1–2", "HOOK.", "SLIP. KEEP THE HANDS HOME.", [
    { id: "message", text: "KID 4", x: 118, y: 543, size: 42, fill: CREAM },
  ]),
  youth: card("kids", "YOUTH BOXING", "SIGN", "UP.", "KIDS 6–14. AFTER SCHOOL. ASK THE DESK.", [
    { id: "message", text: "CHARACTER FIRST.", x: 118, y: 543, size: 36, fill: CREAM, live: true },
  ]),
  legend: card(
    "announcement",
    "CANADIAN BOXING",
    "CANADA",
    "BOXES.",
    "SHOW UP. PUT IN WORK. STAY STANDING.",
    [
      { id: "message", text: "CANADIAN RING LORE", x: 118, y: 543, size: 32, fill: CREAM, live: true },
    ],
  ),
  sully_xp: card("xp_bonus", "SULLY XP", "EARN", "IT.", "SHOW UP. TRAIN. MOVE UP THE BOARD.", [
    { id: "message", text: "SULLY XP FOR EVERY ROUND.", x: 118, y: 543, size: 32, fill: GOLD, live: true },
  ]),
};

function card(
  folder: string,
  kind: string,
  h1: string,
  h2: string,
  footer: string,
  extra: Field[],
  kindFill = GOLD,
): ArtSpec {
  return {
    folder,
    brand: "SULLY’S BOXING GYM",
    kind,
    kindFill,
    footer,
    fields: [
      { id: "headline_1", text: h1, x: 110, y: 350, size: 96, fill: CREAM },
      { id: "headline_2", text: h2, x: 110, y: 462, size: 96, fill: CREAM },
      ...extra,
    ],
  };
}

function nameField(text = "JORDAN M."): Field {
  return { id: "member_name", text, x: 118, y: 543, size: 49, fill: CREAM, live: true };
}

function xpField(text: string): Field {
  return { id: "reward", text, x: 118, y: 665, size: 92, fill: GOLD, live: true };
}

export const ART_POPUP_MODES = Object.keys(SPECS);

export function hasArtPopup(tvMode: string): boolean {
  return tvMode in SPECS;
}

export type TvArtPopupLive = {
  tvMode: string;
  highlightName?: string | null;
  xpBonus?: number | null;
  bonusLabel?: string | null;
  message?: string | null;
  headline1?: string | null;
  headline2?: string | null;
  heroSrc?: string | null;
  roundClock?: string | null;
  roundLabel?: string | null;
  rankLabel?: string | null;
  scoreLabel?: string | null;
  teamA?: { name: string; points: number } | null;
  teamB?: { name: string; points: number } | null;
  hold?: boolean;
};

function liveText(id: string, spec: ArtSpec, live: TvArtPopupLive): string | null {
  const name = live.highlightName?.trim();
  switch (id) {
    case "member_name":
      return name ? name.toUpperCase() : null;
    case "reward":
      return live.xpBonus != null ? `+${live.xpBonus} XP` : null;
    case "reward_label":
      return live.bonusLabel ? live.bonusLabel.toUpperCase() : null;
    case "streak":
      return live.bonusLabel ? live.bonusLabel.toUpperCase() : null;
    case "headline_1":
      if (live.headline1) return live.headline1.toUpperCase();
      return spec.folder === "xp_bonus" && live.xpBonus != null
        ? `+${live.xpBonus} XP`
        : null;
    case "headline_2":
      return live.headline2 ? live.headline2.toUpperCase() : null;
    case "timer":
      return live.roundClock ?? null;
    case "round_label":
      return live.roundLabel ?? null;
    case "rank":
      return live.rankLabel ?? null;
    case "score":
      return live.scoreLabel ?? null;
    case "team_a":
      return live.teamA?.name ? live.teamA.name.toUpperCase() : null;
    case "team_b":
      return live.teamB?.name ? live.teamB.name.toUpperCase() : null;
    case "score_a":
      return live.teamA ? String(live.teamA.points) : null;
    case "score_b":
      return live.teamB ? String(live.teamB.points) : null;
    case "challenge_detail":
    case "message":
      return live.message ? live.message.toUpperCase() : null;
    case "progress":
      return live.roundLabel ?? null;
    default:
      return null;
  }
}

export function TvArtPopup(live: TvArtPopupLive) {
  const spec = SPECS[live.tvMode];
  if (!spec) return null;
  const base = `/tv/popups/${spec.folder}`;

  return (
    <div
      key={live.tvMode}
      className={`${styles.art} ${live.hold ? styles.hold : ""}`}
      aria-hidden
    >
      <div className={styles.stage}>
        {layersFor(spec.folder, live.tvMode).map((layer) => {
          const hero =
            live.heroSrc || CAST_HERO[live.tvMode] || null;
          const src =
            layer.file === "01_panel.png"
              ? "/tv/popups/_shared/01_panel.png"
              : layer.file === "03_hero.png" && hero
                ? hero
                : `${base}/${layer.file}`;
          const wide =
            layer.file === "03_hero.png" &&
            (WIDE_HERO.has(live.tvMode) || (hero ?? "").includes("sparring"));
          return (
            <ArtLayer
              key={layer.file}
              src={src}
              className={`${styles.layer} ${layerClass(layer.className)} ${
                wide ? styles.wideHero : ""
              }`.trim()}
            />
          );
        })}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHIELD}
          alt=""
          className={styles.logo}
          draggable={false}
        />
        <p
          className={`${styles.text} ${styles.brand}`}
          style={{
            left: pct(228, CANVAS_W),
            top: pct(139, CANVAS_H),
            fontSize: vw(36),
            color: CREAM,
            ["--in" as string]: "140ms",
          }}
        >
          <span className={styles.line}>{spec.brand}</span>
        </p>
        <p
          className={`${styles.text} ${styles.kind}`}
          style={{
            left: pct(228, CANVAS_W),
            top: pct(182, CANVAS_H),
            fontSize: vw(24),
            color: spec.kindFill,
            ["--in" as string]: "200ms",
          }}
        >
          <span className={styles.line}>{spec.kind}</span>
        </p>
        {spec.fields.map((field, i) => {
          const text = (field.live ? liveText(field.id, spec, live) : null) ?? field.text;
          const tone = HEADLINE_IDS.has(field.id)
            ? styles.headline
            : STAT_IDS.has(field.id)
              ? styles.stat
              : "";
          return (
            <p
              key={field.id}
              className={`${styles.text} ${tone}`.trim()}
              style={{
                left: pct(field.x, CANVAS_W),
                top: pct(field.y, CANVAS_H),
                fontSize: vw(field.size),
                color: field.fill,
                ["--in" as string]: `${240 + i * 70}ms`,
              }}
            >
              <span className={styles.line}>{text}</span>
            </p>
          );
        })}
        <p
          className={`${styles.text} ${styles.footer}`}
          style={{
            left: pct(118, CANVAS_W),
            top: pct(794, CANVAS_H),
            fontSize: vw(22),
            color: CREAM,
            ["--in" as string]: `${320 + spec.fields.length * 70}ms`,
          }}
        >
          <span className={styles.line}>{spec.footer}</span>
        </p>
      </div>
    </div>
  );
}

const CORE_FOLDERS = new Set([
  "achievement",
  "xp_bonus",
  "teams",
  "challenge",
  "leaderboard",
  "class_complete",
  "timer",
]);

const PANEL_ONLY = new Set(["heritage"]);

const CAST_HERO: Record<string, string> = {
  challenge: "/tv/cast/coach-1-jab-stage.png",
  pads: "/tv/cast/coach-1-pads-stage.png",
  check_in: "/tv/cast/coach-1-guard-stage.png",
  first_visit: "/tv/cast/coach-4-guard-stage.png",
  last_spots: "/tv/cast/teen-2-guard-stage.png",
  class_starting: "/tv/cast/kid-1-guard-stage.png",
  streak: "/tv/cast/teen-1-guard-stage.png",
  welcome_back: "/tv/cast/coach-2-guard-stage.png",
  announcement: "/tv/cast/coach-3-guard-stage.png",
  timer: "/tv/cast/coach-1-rest-stage.png",
  sparring: "/tv/cast/kids-sparring-4-stage.png",
  combo: "/tv/cast/kid-4-jab-stage.png",
  kids: "/tv/cast/kid-1-guard-stage.png",
  youth: "/tv/cast/kid-2-celebrate-stage.png",
  birthday: "/tv/cast/kid-2-celebrate-stage.png",
  kids_complete: "/tv/cast/kid-3-celebrate-stage.png",
  legend: "/tv/cast/teen-2-guard-stage.png",
  sully_xp: "/tv/cast/sully-xp-stage.png",
  achievement: "/tv/cast/coach-1-victory-stage.png",
  challenge_winner: "/tv/cast/coach-1-victory-stage.png",
  session_mvp: "/tv/cast/coach-1-victory-stage.png",
  class_complete: "/tv/cast/coach-1-victory-stage.png",
  level_up: "/tv/cast/coach-1-victory-stage.png",
};

const WIDE_HERO = new Set(["sparring", "youth"]);

export const FLOOR_ADS = [
  {
    mode: "youth",
    hero: "/tv/cast/kid-2-celebrate-stage.png",
    h1: "SIGN",
    h2: "UP.",
    msg: "YOUTH BOXING · KIDS 6–14 · ASK THE DESK",
  },
  {
    mode: "youth",
    hero: "/tv/cast/kid-6-guard-stage.png",
    h1: "KIDS",
    h2: "BOXING.",
    msg: "AFTER SCHOOL. CHARACTER FIRST.",
  },
  {
    mode: "youth",
    hero: "/tv/cast/kids-sparring-4-stage.png",
    h1: "YOUTH",
    h2: "RING.",
    msg: "GET THEM ON THE FLOOR. SULLY’S EST 1943.",
  },
  {
    mode: "youth",
    hero: "/tv/cast/kid-3-celebrate-stage.png",
    h1: "BRING",
    h2: "THEM.",
    msg: "YOUTH BOXING · LACE UP · HAVE FUN",
  },
  {
    mode: "legend",
    hero: "/tv/cast/teen-2-guard-stage.png",
    h1: "VARGAS",
    h2: "147.",
    msg: "SAM VARGAS · BRAMPTON · NABA WELTER CHAMP",
  },
  {
    mode: "legend",
    hero: "/tv/cast/coach-4-guard-stage.png",
    h1: "MOLITOR",
    h2: "IBF.",
    msg: "STEVE MOLITOR · SARNIA · TWO-TIME WORLD CHAMP",
  },
  {
    mode: "legend",
    hero: "/tv/cast/teen-1-guard-stage.png",
    h1: "HERON",
    h2: "UNBEATEN.",
    msg: "KANE HERON · ETOBICOKE · 17-0-1 WELTER",
  },
  {
    mode: "legend",
    hero: "/tv/cast/coach-1-victory-stage.png",
    h1: "CHUVALO",
    h2: "1937–2026.",
    msg: "NEVER KNOCKED DOWN. TORONTO REMEMBERS.",
  },
  {
    mode: "legend",
    hero: "/tv/cast/coach-3-guard-stage.png",
    h1: "LEWIS",
    h2: "UNDISPUTED.",
    msg: "LENNOX LEWIS · KITCHENER · HEAVYWEIGHT CROWN",
  },
  {
    mode: "sully_xp",
    hero: "/tv/cast/sully-xp-stage.png",
    h1: "SULLY",
    h2: "XP.",
    msg: "SHOW UP. EARN IT. MOVE UP THE BOARD.",
  },
  {
    mode: "sully_xp",
    hero: "/tv/cast/kid-4-celebrate-stage.png",
    h1: "EARN",
    h2: "IT.",
    msg: "SULLY XP FOR EVERY CLASS YOU FINISH.",
  },
] as const;

function layersFor(folder: string, tvMode: string) {
  let layers: readonly (typeof LAYERS)[number][];
  if (CORE_FOLDERS.has(folder)) layers = LAYERS;
  else if (PANEL_ONLY.has(folder)) {
    layers = LAYERS.filter(
      (layer) => layer.file === "01_panel.png" || layer.file === "02_effects.png",
    );
  } else {
    layers = LAYERS.filter((layer) => layer.file !== "04_accent.png");
  }
  if (CAST_HERO[tvMode] || tvMode === "youth" || tvMode === "legend" || tvMode === "sully_xp") {
    layers = layers.filter((layer) => layer.file !== "04_accent.png");
  }
  return layers;
}

function layerClass(name: (typeof LAYERS)[number]["className"]) {
  if (name === "panelLayer") return styles.panelLayer;
  if (name === "fxLayer") return styles.fxLayer;
  if (name === "heroLayer") return styles.heroLayer;
  if (name === "accentLayer") return styles.accentLayer;
  return "";
}

function ArtLayer({ src, className }: { src: string; className: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      draggable={false}
      onError={() => setOk(false)}
    />
  );
}

function pct(value: number, total: number) {
  return `${((value / total) * 100).toFixed(3)}%`;
}

function vw(px: number) {
  return `calc(${((px / CANVAS_W) * 100).toFixed(3)}cqw)`;
}
