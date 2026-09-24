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
    normalizeBoxrecHref(profile.boxrecIdPro, "pro");
  const boxrecAmateur =
    profile.boxrecIdAmateur &&
    normalizeBoxrecHref(profile.boxrecIdAmateur, "amateur");
  const ontario = profile.boxingOntarioRegNum
    ? "https://boxingontario.com"
    : null;

  if (!boxrecPro && !boxrecAmateur && !ontario) return null;

  return (
    <section className={`${styles.wrap} ${styles.recordCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.eyebrow}>Competitive fighter</p>
          <h2 className={styles.title}>Official records</h2>
        </div>
        <span className={styles.verified}>Records linked</span>
      </div>
      <div className={styles.badges}>
        {boxrecPro ? (
          <a
            className={styles.badgeLink}
            href={boxrecPro}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open BoxRec Pro record in a new tab"
          >
            <span>
              <strong>BoxRec Pro</strong>
              <small>{profile.boxrecIdPro}</small>
            </span>
            <span className={styles.external} aria-hidden="true">↗</span>
          </a>
        ) : null}
        {boxrecAmateur ? (
          <a
            className={styles.badgeLink}
            href={boxrecAmateur}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open BoxRec Amateur record in a new tab"
          >
            <span>
              <strong>BoxRec Amateur</strong>
              <small>{profile.boxrecIdAmateur}</small>
            </span>
            <span className={styles.external} aria-hidden="true">↗</span>
          </a>
        ) : null}
        {ontario ? (
          <a
            className={styles.badgeLink}
            href={ontario}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Boxing Ontario in a new tab"
          >
            <span>
              <strong>Boxing Ontario</strong>
              <small>#{profile.boxingOntarioRegNum}</small>
            </span>
            <span className={styles.external} aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
