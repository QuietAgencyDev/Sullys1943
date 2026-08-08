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

/** Public SVG pack — see apps/web/public/tv/icons/ */
const TV_ICONS = {
  glove: "/tv/icons/glove-1.svg",
  gloveAlt: "/tv/icons/glove.svg",
  surprise: "/tv/icons/glove-surprise.svg",
  boxing: "/tv/icons/boxing.svg",
  boxer: "/tv/icons/boxer.svg",
  ring: "/tv/icons/ring.svg",
  shorts: "/tv/icons/shorts.svg",
  gear: "/tv/icons/kickboxing-equipment.svg",
  belt: "/tv/icons/champion-belt.svg",
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
      return { left: TV_ICONS.glove, right: TV_ICONS.glove, dock: TV_ICONS.ring };
    case "challenge":
      return {
        left: TV_ICONS.glove,
        right: TV_ICONS.glove,
        dock: TV_ICONS.boxing,
        tint: true,
      };
    case "class_complete":
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
        tint: true,
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
}: {
  tvMode: string;
  phase: TvRivePhase;
  pulseKey: string;
  xpBonus?: number | null;
  bonusLabel?: string | null;
  highlightName?: string | null;
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
      }`}
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
}: TvRiveProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = useMemo(() => srcForMode(tvMode), [tvMode]);
  const pulseKey = `${tvMode}-${phase}-${message ?? ""}-${xpBonus ?? 0}-${bonusLabel ?? ""}`;

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  if (!active || !enabled) return null;

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
      {failedSrc !== src ? (
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
