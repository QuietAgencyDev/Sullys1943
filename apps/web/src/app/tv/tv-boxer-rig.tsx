"use client";

import styles from "./tv-boxer-rig.module.css";

type CoachMotion = "idle" | "work" | "rest" | "pads";

type TvBoxerRigProps = {
  className?: string;
  motion?: CoachMotion;
};

const SRC = "/rive/characters/coach-2/03_Aligned_599x801";

const PARTS = [
  ["shoe_R", styles.shoeR],
  ["shoe_L", styles.shoeL],
  ["shin_R", styles.shinR],
  ["shin_L", styles.shinL],
  ["pelvis", styles.pelvis],
  ["thigh_R", styles.thighR],
  ["thigh_L", styles.thighL],
  ["upperarm_R", styles.upperarmR],
  ["neck", styles.neck],
  ["torso", styles.torso],
  ["upperarm_L", styles.upperarmL],
  ["forearm_R", styles.forearmR],
  ["forearm_L", styles.forearmL],
  ["head", styles.head],
  ["glove_R", styles.gloveR],
  ["glove_L", styles.gloveL],
] as const;

export function TvBoxerRig({ className, motion = "idle" }: TvBoxerRigProps) {
  const motionClass =
    motion === "work"
      ? styles.work
      : motion === "rest"
        ? styles.rest
        : styles.idle;

  return (
    <div className={`${styles.stage} ${motionClass} ${className ?? ""}`} aria-hidden>
      <div className={styles.glow} />
      <div className={styles.ground} />
      <div className={styles.figureWrap}>
        <div className={styles.figure}>
          {PARTS.map(([file, partClass]) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={file}
              className={`${styles.part} ${partClass}`}
              src={`${SRC}/${file}.png?v=shoe-l`}
              alt=""
              draggable={false}
            />
          ))}
        </div>
      </div>
      <div className={styles.rim} />
    </div>
  );
}
