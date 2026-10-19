"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";
import styles from "./tv-rive.module.css";
import { TvArtPopup, hasArtPopup } from "./tv-art-popup";

export type TvRivePhase = "work" | "rest";

export type TvRiveProps = {
  active: boolean;
  enabled: boolean;
  tvMode: string;
  phase: TvRivePhase;
  message?: string | null;
  /** XP awarded this moment (class complete / achievement) */
  xpBonus?: number | null;
  /** Extra bonus chip (streak, first check-in, etc.) */
  bonusLabel?: string | null;
  /** Athlete / winner callout */
  highlightName?: string | null;
  /** Use the anime art card (hides Coach 2). Timer uses art only when true. */
  artCover?: boolean;
  roundClock?: string | null;
  roundLabel?: string | null;
  rankLabel?: string | null;
  scoreLabel?: string | null;
  teamA?: { name: string; points: number } | null;
  teamB?: { name: string; points: number } | null;
};

const SM = "TV";

function srcForMode(tvMode: string): string {
  switch (tvMode) {
    case "teams":
      return "/rive/teams.riv";
    case "challenge":
      return "/rive/challenge.riv";
    case "leaderboard":
      return "/rive/belt.riv";
    case "achievement":
      return "/rive/belt.riv";
    case "class_complete":
      return "/rive/class-complete.riv";
    case "xp_bonus":
      return "/rive/xp.riv";
    case "announcement":
      return "/rive/announcement.riv";
    default:
      return "/rive/phase.riv";
  }
}

function modeNumber(tvMode: string): number {
  switch (tvMode) {
    case "achievement":
    case "class_complete":
      return 1;
    case "teams":
      return 2;
    case "challenge":
      return 3;
    case "xp_bonus":
      return 4;
    case "leaderboard":
      return 5;
    case "announcement":
      return 6;
    default:
      return 0;
  }
}

function celebrationModes(tvMode: string) {
  return (
    tvMode === "achievement" ||
    tvMode === "class_complete" ||
    tvMode === "teams" ||
    tvMode === "challenge" ||
    tvMode === "leaderboard" ||
    tvMode === "xp_bonus"
  );
}

function badgeForMode(tvMode: string) {
  switch (tvMode) {
    case "class_complete":
      return "CLASS COMPLETE";
    case "teams":
      return "TEAM BATTLE";
    case "challenge":
      return "CHALLENGE";
    case "leaderboard":
      return "LEADERBOARD";
    case "xp_bonus":
      return "XP BONUS";
    case "achievement":
      return "ACHIEVEMENT";
    default:
      return null;
  }
}

/** Public icon pack — illustrated PNGs in apps/web/public/tv/icons/ */
const TV_ICONS = {
  glove: "/tv/icons/glove-1.png",
  gloveAlt: "/tv/icons/glove.png",
  surprise: "/tv/icons/glove-surprise.png",
  boxing: "/tv/icons/boxing.png",
  boxer: "/tv/icons/boxer.png",
  ring: "/tv/icons/ring.png",
  shorts: "/tv/icons/shorts.png",
  gear: "/tv/icons/kickboxing-equipment.png",
  belt: "/tv/icons/champion-belt.png",
} as const;

function iconsForMode(tvMode: string): {
  left: string;
  right: string;
  /** Accent icon sits in the bottom dock — never over titles */
  dock?: string;
  tint?: boolean;
} {
  switch (tvMode) {
    case "teams":
      return {
        left: "/tv/icons/glove-2.png",
        right: "/tv/icons/glove-3.png",
        dock: TV_ICONS.ring,
      };
    case "challenge":
      return {
        left: TV_ICONS.glove,
        right: TV_ICONS.glove,
        dock: TV_ICONS.boxing,
      };
    case "class_complete":
      return {
        left: TV_ICONS.glove,
        right: TV_ICONS.glove,
        dock: TV_ICONS.boxer,
      };
    case "leaderboard":
      return {
        left: TV_ICONS.glove,
        right: TV_ICONS.glove,
        dock: TV_ICONS.belt,
      };
    case "achievement":
      return {
        left: TV_ICONS.glove,
        right: TV_ICONS.glove,
        dock: TV_ICONS.belt,
      };
    case "xp_bonus":
      return {
        left: TV_ICONS.glove,
        right: TV_ICONS.glove,
        dock: TV_ICONS.surprise,
      };
    default:
      return { left: TV_ICONS.glove, right: TV_ICONS.glove };
  }
}

const CONFETTI = [
  { left: "12%", top: "10%", color: "#c82026", delay: "0s" },
  { left: "28%", top: "6%", color: "#c4a06a", delay: "0.08s" },
  { left: "45%", top: "4%", color: "#f3e6c8", delay: "0.14s" },
  { left: "62%", top: "8%", color: "#c82026", delay: "0.05s" },
  { left: "78%", top: "12%", color: "#c4a06a", delay: "0.18s" },
  { left: "88%", top: "18%", color: "#f3e6c8", delay: "0.1s" },
  { left: "18%", top: "22%", color: "#c4a06a", delay: "0.22s" },
  { left: "70%", top: "16%", color: "#c82026", delay: "0.16s" },
];

function CssFallback({
  tvMode,
  phase,
  pulseKey,
  xpBonus,
  bonusLabel,
  highlightName,
  hold = false,
}: {
  tvMode: string;
  phase: TvRivePhase;
  pulseKey: string;
  xpBonus?: number | null;
  bonusLabel?: string | null;
  highlightName?: string | null;
  hold?: boolean;
}) {
  const celebrate = celebrationModes(tvMode);
  const modeClass = celebrate
    ? tvMode === "teams"
      ? styles.cssTeams
      : styles.cssCelebrate
    : styles.cssPhase;

  const showXp =
    (xpBonus != null && xpBonus > 0) ||
    tvMode === "class_complete" ||
    tvMode === "achievement" ||
    tvMode === "xp_bonus";

  const xpValue =
    xpBonus != null && xpBonus > 0
      ? xpBonus
      : tvMode === "class_complete"
        ? 25
        : tvMode === "achievement" || tvMode === "xp_bonus"
          ? 50
          : null;

  const pack = iconsForMode(tvMode);

  return (
    <div
      key={pulseKey}
      className={`${styles.cssFallback} ${modeClass} ${
        phase === "work" ? styles.cssWork : styles.cssRest
      } ${hold ? styles.cssHold : ""}`}
      aria-hidden
    >
      <div className={styles.vignette} />
      <div className={styles.flash} />
      <div className={styles.ring} />
      <div className={styles.ringDelay} />
      <div className={styles.burst} />
      <div className={styles.impact} />

      {celebrate
        ? CONFETTI.map((c, i) => (
            <span
              key={i}
              className={styles.confetti}
              style={{
                left: c.left,
                top: c.top,
                background: c.color,
                animationDelay: c.delay,
              }}
            />
          ))
        : null}

      {celebrate ? (
        <>
          <span className={styles.spark} style={{ left: "18%", top: "22%" }} />
          <span className={styles.spark} style={{ left: "72%", top: "18%" }} />
          <span className={styles.spark} style={{ left: "55%", top: "58%" }} />
          <span className={styles.spark} style={{ left: "30%", top: "62%" }} />
        </>
      ) : null}

      <div className={styles.gloves}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pack.left}
          alt=""
          className={`${styles.glove} ${styles.gloveLeft}`}
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pack.right}
          alt=""
          className={`${styles.glove} ${styles.gloveRight}`}
          draggable={false}
        />
      </div>

      {/* Bottom dock: XP + accent icon — clear of hero titles */}
      <div className={styles.dock}>
        {pack.dock ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pack.dock}
            alt=""
            className={`${styles.dockIcon} ${
              pack.tint ? styles.iconTintCream : ""
            } ${
              pack.dock === TV_ICONS.belt ? styles.dockBelt : ""
            }`}
            draggable={false}
          />
        ) : null}
        {showXp && xpValue != null ? (
          <div className={styles.xpStack}>
            {highlightName ? (
              <p className={styles.xpName}>{highlightName}</p>
            ) : null}
            <p className={styles.xpPop}>+{xpValue} XP</p>
            {bonusLabel ? (
              <p className={`${styles.xpPop} ${styles.xpPopBonus}`}>
                {bonusLabel}
              </p>
            ) : tvMode === "class_complete" ? (
              <p className={`${styles.xpPop} ${styles.xpPopBonus}`}>
                CLASS BONUS
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RiveCanvas({
  src,
  tvMode,
  phase,
  onFail,
}: {
  src: string;
  tvMode: string;
  phase: TvRivePhase;
  onFail: () => void;
}) {
  const lastMode = useRef<string | null>(null);
  const lastPhase = useRef<TvRivePhase | null>(null);

  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: SM,
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
    onLoadError: () => onFail(),
  });

  const celebrate = useStateMachineInput(rive, SM, "celebrate");
  const teamsReveal = useStateMachineInput(rive, SM, "teamsReveal");
  const challenge = useStateMachineInput(rive, SM, "challenge");
  const phasePunch = useStateMachineInput(rive, SM, "phasePunch");
  const xpBurst = useStateMachineInput(rive, SM, "xpBurst");
  const beltReveal = useStateMachineInput(rive, SM, "beltReveal");
  const announce = useStateMachineInput(rive, SM, "announce");
  const photoReveal = useStateMachineInput(rive, SM, "photoReveal");
  const modeInput = useStateMachineInput(rive, SM, "mode");

  useEffect(() => {
    if (!rive) return;
    if (modeInput) modeInput.value = modeNumber(tvMode);

    if (lastMode.current !== null && lastMode.current !== tvMode) {
      if (tvMode === "teams") teamsReveal?.fire();
      else if (tvMode === "challenge") challenge?.fire();
      else if (tvMode === "announcement") announce?.fire();
      else if (tvMode === "xp_bonus") {
        xpBurst?.fire() ?? celebrate?.fire();
      } else if (tvMode === "leaderboard" || tvMode === "achievement") {
        beltReveal?.fire();
        celebrate?.fire();
        photoReveal?.fire();
      } else if (tvMode === "class_complete") {
        celebrate?.fire();
        xpBurst?.fire();
        beltReveal?.fire();
        photoReveal?.fire();
      } else {
        try {
          rive.reset();
          rive.play();
        } catch {
          /* ignore */
        }
      }
    }
    lastMode.current = tvMode;
  }, [
    rive,
    tvMode,
    celebrate,
    teamsReveal,
    challenge,
    xpBurst,
    beltReveal,
    announce,
    photoReveal,
    modeInput,
  ]);

  useEffect(() => {
    if (!rive) return;
    if (lastPhase.current !== null && lastPhase.current !== phase) {
      phasePunch?.fire();
      if (!phasePunch) {
        try {
          rive.reset();
          rive.play();
        } catch {
          /* ignore */
        }
      }
    }
    lastPhase.current = phase;
  }, [rive, phase, phasePunch]);

  return <RiveComponent className={styles.canvas} />;
}

export function TvRiveLayer({
  active,
  enabled,
  tvMode,
  phase,
  message,
  xpBonus,
  bonusLabel,
  highlightName,
  artCover,
  roundClock,
  roundLabel,
  rankLabel,
  scoreLabel,
  teamA,
  teamB,
}: TvRiveProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const src = useMemo(() => srcForMode(tvMode), [tvMode]);
  const pulseKey = `${tvMode}-${phase}-${message ?? ""}-${xpBonus ?? 0}-${bonusLabel ?? ""}`;
  const useArt =
    artCover ?? (hasArtPopup(tvMode) && tvMode !== "timer");

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!active) return null;

  if (useArt && hasArtPopup(tvMode)) {
    return (
      <TvArtPopup
        key={tvMode}
        tvMode={tvMode}
        highlightName={highlightName}
        xpBonus={xpBonus}
        bonusLabel={bonusLabel}
        message={message}
        roundClock={roundClock}
        roundLabel={roundLabel}
        rankLabel={rankLabel}
        scoreLabel={scoreLabel}
        teamA={teamA}
        teamB={teamB}
      />
    );
  }

  const badge = badgeForMode(tvMode);

  return (
    <div className={styles.layer} aria-hidden>
      <CssFallback
        tvMode={tvMode}
        phase={phase}
        pulseKey={pulseKey}
        xpBonus={xpBonus}
        bonusLabel={bonusLabel}
        highlightName={highlightName}
      />
      {enabled && !reducedMotion && failedSrc !== src ? (
        <div className={styles.riveHost}>
          <RiveCanvas
            key={src}
            src={src}
            tvMode={tvMode}
            phase={phase}
            onFail={() => setFailedSrc(src)}
          />
        </div>
      ) : null}
      {badge ? <p className={styles.badge}>{badge}</p> : null}
    </div>
  );
}

export function TvCssPopup(props: {
  tvMode: string;
  phase?: TvRivePhase;
  xpBonus?: number | null;
  bonusLabel?: string | null;
  highlightName?: string | null;
  roundClock?: string | null;
  roundLabel?: string | null;
  rankLabel?: string | null;
  scoreLabel?: string | null;
  teamA?: { name: string; points: number } | null;
  teamB?: { name: string; points: number } | null;
}) {
  if (hasArtPopup(props.tvMode)) {
    return (
      <TvArtPopup
        tvMode={props.tvMode}
        highlightName={props.highlightName}
        xpBonus={props.xpBonus}
        bonusLabel={props.bonusLabel}
        roundClock={props.roundClock}
        roundLabel={props.roundLabel}
        rankLabel={props.rankLabel}
        scoreLabel={props.scoreLabel}
        teamA={props.teamA}
        teamB={props.teamB}
        hold
      />
    );
  }
  return (
    <CssFallback
      tvMode={props.tvMode}
      phase={props.phase ?? "rest"}
      pulseKey={props.tvMode}
      xpBonus={props.xpBonus}
      bonusLabel={props.bonusLabel}
      highlightName={props.highlightName}
      hold
    />
  );
}

/** Resolve kill-switch from URL + localStorage (client only). */
export function readRiveEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (window.localStorage.getItem("sullys_tv_rive") === "off") return false;
  } catch {
    /* ignore */
  }
  const q = new URLSearchParams(window.location.search);
  if (q.get("rive") === "0" || q.get("rive") === "off") return false;
  return true;
}

export function readDemoCelebrate(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("demo") === "celebrate";
}

export const FLOOR_POPUP_MODES = [
  "achievement",
  "xp_bonus",
  "teams",
  "challenge",
  "leaderboard",
  "class_complete",
  "timer",
  "check_in",
  "first_visit",
  "level_up",
  "streak",
  "welcome_back",
  "class_starting",
  "last_spots",
  "challenge_winner",
  "session_mvp",
  "kids",
  "kids_complete",
  "heritage",
  "announcement",
  "birthday",
  "pads",
  "sparring",
  "combo",
] as const;

export type FloorPopupMode = (typeof FLOOR_POPUP_MODES)[number];

/** Freeze one popup on Floor TV: /tv/floor?popup=achievement */
export function readPopupFreeze(): FloorPopupMode | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const p = q.get("popup");
  if (p && (FLOOR_POPUP_MODES as readonly string[]).includes(p)) {
    return p as FloorPopupMode;
  }
  return null;
}

export const TV_ICON_FILES = [
  { file: "glove-1.png", use: "Primary gloves" },
  { file: "glove.png", use: "Alternate glove" },
  { file: "glove-2.png", use: "Teams left glove" },
  { file: "glove-3.png", use: "Teams right glove" },
  { file: "glove-surprise.png", use: "XP bonus" },
  { file: "boxing.png", use: "Challenge" },
  { file: "boxer.png", use: "Class complete" },
  { file: "ring.png", use: "Teams / ring" },
  { file: "ring-alt.png", use: "Spare ring" },
  { file: "shorts.png", use: "Apparel" },
  { file: "kickboxing-equipment.png", use: "Gear" },
  { file: "champion-belt.png", use: "Achievement / leaderboard" },
] as const;

export { hasArtPopup };
export {
  FLOOR_NOTE_MODES,
  TvArtNote,
  hasArtNote,
  readNoteFreeze,
} from "./tv-art-note";
