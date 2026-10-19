"use client";

import styles from "./tv-art-note.module.css";

type NoteSpec = {
  kicker: string;
  title: string;
  meta?: string;
  wide?: boolean;
  chip?: boolean;
};

export const FLOOR_NOTE_MODES = [
  "nameplate",
  "coach",
  "round_flash",
  "rest_flash",
  "ten",
  "birthday",
  "xp_chip",
  "streak_chip",
  "rank_bump",
  "wraps",
  "next_up",
  "values",
] as const;

export type FloorNoteMode = (typeof FLOOR_NOTE_MODES)[number];

const NOTES: Record<FloorNoteMode, NoteSpec> = {
  nameplate: { kicker: "Just walked in", title: "JORDAN M.", meta: "Checked in" },
  coach: { kicker: "Coach", title: "NICE JAB", meta: "Hands up" },
  round_flash: { kicker: "Work", title: "ROUND 4", wide: true },
  rest_flash: { kicker: "Rest", title: "BREATHE", wide: true },
  ten: { kicker: "Warning", title: "10", wide: true },
  birthday: { kicker: "Happy birthday", title: "KID 1" },
  xp_chip: { kicker: "XP", title: "+10 XP", chip: true },
  streak_chip: { kicker: "Streak", title: "×3", chip: true },
  rank_bump: { kicker: "Board", title: "2ND → 1ST", chip: true },
  wraps: { kicker: "Floor", title: "WRAPS ON", meta: "Water up", chip: true },
  next_up: { kicker: "Up next", title: "KIDS BOXING", meta: "4:00", wide: true },
  values: {
    kicker: "Sully’s",
    title: "LACE UP",
    meta: "Show respect · Build character",
    wide: true,
  },
};

export function hasArtNote(mode: string): mode is FloorNoteMode {
  return (FLOOR_NOTE_MODES as readonly string[]).includes(mode);
}

export function readNoteFreeze(): FloorNoteMode | null {
  if (typeof window === "undefined") return null;
  const n = new URLSearchParams(window.location.search).get("note");
  if (n && hasArtNote(n)) return n;
  return null;
}

export function TvArtNote({
  mode,
  title,
  meta,
  hold,
}: {
  mode: string;
  title?: string | null;
  meta?: string | null;
  hold?: boolean;
}) {
  if (!hasArtNote(mode)) return null;
  const spec = NOTES[mode];
  return (
    <div
      className={`${styles.note} ${spec.wide ? styles.wide : ""} ${
        spec.chip ? styles.chip : ""
      } ${hold ? styles.hold : ""}`}
      aria-hidden
    >
      <div className={styles.plate}>
        <p className={styles.kicker}>{spec.kicker}</p>
        <p className={styles.title}>{(title ?? spec.title).toUpperCase()}</p>
        {spec.meta || meta ? (
          <p className={styles.meta}>{(meta ?? spec.meta ?? "").toUpperCase()}</p>
        ) : null}
      </div>
    </div>
  );
}
