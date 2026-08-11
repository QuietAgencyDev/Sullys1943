/**
 * How to integrate:
 * Import into member Profile (or any surface) and pass fighter fields as props.
 *   import { FighterRecordLinks } from "@/components/fighter-verification/FighterRecordLinks";
 * Renders nothing when all IDs are empty — safe to mount unconditionally.
 * Do not wire into auth or TV boards.
 */
"use client";

import type { FighterVerification } from "./types";
import { normalizeBoxrecHref } from "./types";
import styles from "./fighter-verification.module.css";

type Props = {
  profile: Pick<
    FighterVerification,
    | "isCompetitiveFighter"
    | "boxingOntarioRegNum"
    | "boxrecIdPro"
    | "boxrecIdAmateur"
  > | null;
};

export function FighterRecordLinks({ profile }: Props) {
  if (!profile) return null;

  const boxrecPro =
    profile.boxrecIdPro &&
    normalizeBoxrecHref(profile.boxrecIdPro);
  const boxrecAmateur =
    profile.boxrecIdAmateur &&
    normalizeBoxrecHref(profile.boxrecIdAmateur);
  const ontario = profile.boxingOntarioRegNum
    ? "https://boxingon.ca"
    : null;

  if (!boxrecPro && !boxrecAmateur && !ontario) return null;

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Competitive fighter</p>
      <p className={styles.title}>Official records</p>
      <div className={styles.badges}>
        {boxrecPro ? (
          <a
            className={styles.badgeLink}
            href={boxrecPro}
            target="_blank"
            rel="noopener noreferrer"
          >
            BoxRec Pro
            <span className={styles.badgeMeta}>{profile.boxrecIdPro}</span>
          </a>
        ) : null}
        {boxrecAmateur ? (
          <a
            className={styles.badgeLink}
            href={boxrecAmateur}
            target="_blank"
            rel="noopener noreferrer"
          >
            BoxRec Amateur
            <span className={styles.badgeMeta}>{profile.boxrecIdAmateur}</span>
          </a>
        ) : null}
        {ontario ? (
          <a
            className={styles.badgeLink}
            href={ontario}
            target="_blank"
            rel="noopener noreferrer"
          >
            Boxing Ontario
            <span className={styles.badgeMeta}>
              #{profile.boxingOntarioRegNum}
            </span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
