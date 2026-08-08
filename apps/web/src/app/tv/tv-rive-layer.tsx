"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import styles from "./tv-rive.module.css";

export type TvRivePhase = "work" | "rest";

type Props = {
  active: boolean;
  enabled: boolean;
  tvMode: string;
  phase: TvRivePhase;
  message?: string | null;
};

const SM = "TV";

function srcForMode(tvMode: string): string {
  if (tvMode === "teams") return "/rive/teams.riv";
  if (tvMode === "challenge") return "/rive/challenge.riv";
  if (tvMode === "achievement" || tvMode === "class_complete") {
    return "/rive/celebration.riv";
  }
  return "/rive/phase.riv";
}

function modeNumber(tvMode: string): number {
  switch (tvMode) {
    case "achievement":
    case "class_complete":
      return 1;
    case "teams":
      return 2;
    case "challenge":
    case "leaderboard":
      return 3;
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
    tvMode === "leaderboard"
  );
}

function CssFallback({
  tvMode,
  phase,
  pulseKey,
}: {
  tvMode: string;
  phase: TvRivePhase;
  pulseKey: string;
}) {
  const celebrate = celebrationModes(tvMode);
  return (
    <div
      key={pulseKey}
      className={`${styles.cssFallback} ${
        celebrate ? styles.cssCelebrate : styles.cssPhase
      } ${phase === "work" ? styles.cssWork : styles.cssRest}`}
      aria-hidden
    >
      <div className={styles.ring} />
      <div className={styles.ringDelay} />
      <div className={styles.burst} />
      {celebrate ? (
        <>
          <span className={styles.spark} style={{ left: "18%", top: "22%" }} />
          <span className={styles.spark} style={{ left: "72%", top: "18%" }} />
          <span className={styles.spark} style={{ left: "55%", top: "58%" }} />
          <span className={styles.spark} style={{ left: "30%", top: "62%" }} />
        </>
      ) : null}
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
  const modeInput = useStateMachineInput(rive, SM, "mode");

  useEffect(() => {
    if (!rive) return;
    if (modeInput) modeInput.value = modeNumber(tvMode);

    if (lastMode.current !== null && lastMode.current !== tvMode) {
      if (tvMode === "teams") teamsReveal?.fire();
      else if (tvMode === "challenge" || tvMode === "leaderboard") {
        challenge?.fire();
      } else if (
        tvMode === "achievement" ||
        tvMode === "class_complete"
      ) {
        celebrate?.fire();
      } else {
        // Remount-friendly: restart artboard if no SM triggers
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
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = useMemo(() => srcForMode(tvMode), [tvMode]);
  const pulseKey = `${tvMode}-${phase}-${message ?? ""}`;

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  if (!active || !enabled) return null;

  const useCss = failedSrc === src || celebrationModes(tvMode);

  return (
    <div className={styles.layer} aria-hidden>
      {/* CSS always paints atmosphere; Rive sits on top when the file loads */}
      <CssFallback tvMode={tvMode} phase={phase} pulseKey={pulseKey} />
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
      {useCss && celebrationModes(tvMode) ? (
        <p className={styles.badge}>
          {tvMode === "class_complete"
            ? "CLASS COMPLETE"
            : tvMode === "teams"
              ? "TEAM BATTLE"
              : tvMode === "challenge"
                ? "CHALLENGE"
                : tvMode === "leaderboard"
                  ? "LEADERBOARD"
                  : "ACHIEVEMENT"}
        </p>
      ) : null}
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
