/**
 * How to integrate:
 * Mount on /app/profile (or similar) next to FighterRecordLinks.
 *   import { FighterVerificationForm } from "@/components/fighter-verification/FighterVerificationForm";
 * Saves ONLY via PATCH /api/v1/fighter-verification — never auth/user update routes.
 */
"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, patch } from "@/lib/api";
import type { FighterVerification } from "./types";
import styles from "./fighter-verification.module.css";

type Props = {
  initial: FighterVerification | null;
  onSaved?: (next: FighterVerification) => void;
};

const ID_PATTERN = /^[A-Za-z0-9/_.-]*$/;

function validateId(label: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 120) return `${label} is too long`;
  if (!ID_PATTERN.test(trimmed)) {
    return `${label}: use letters, numbers, /, -, _, . only`;
  }
  return null;
}

export function FighterVerificationForm({ initial, onSaved }: Props) {
  const [isCompetitive, setIsCompetitive] = useState(
    initial?.isCompetitiveFighter ?? false,
  );
  const [ontario, setOntario] = useState(initial?.boxingOntarioRegNum ?? "");
  const [boxrecPro, setBoxrecPro] = useState(initial?.boxrecIdPro ?? "");
  const [boxrecAmateur, setBoxrecAmateur] = useState(
    initial?.boxrecIdAmateur ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setIsCompetitive(initial?.isCompetitiveFighter ?? false);
    setOntario(initial?.boxingOntarioRegNum ?? "");
    setBoxrecPro(initial?.boxrecIdPro ?? "");
    setBoxrecAmateur(initial?.boxrecIdAmateur ?? "");
  }, [initial]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const errors = [
      validateId("Boxing Ontario #", ontario),
      validateId("BoxRec Pro", boxrecPro),
      validateId("BoxRec Amateur", boxrecAmateur),
    ].filter(Boolean);
    if (errors.length) {
      setError(errors[0] as string);
      return;
    }

    setBusy(true);
    try {
      const saved = await patch<FighterVerification>(
        "/api/v1/fighter-verification",
        {
          isCompetitiveFighter: isCompetitive,
          boxingOntarioRegNum: ontario.trim() || null,
          boxrecIdPro: boxrecPro.trim() || null,
          boxrecIdAmateur: boxrecAmateur.trim() || null,
        },
      );
      setSuccess("Fighter verification saved.");
      onSaved?.(saved);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save fighter IDs",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.wrap} ${styles.formCard}`} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.eyebrow}>Verification</p>
          <h2 className={styles.title}>Competitive fighter IDs</h2>
        </div>
        <span className={styles.optional}>Optional</span>
      </div>
      <p className={styles.hint} id="fighter-id-help">
        Connect your official Boxing Ontario and BoxRec records. Enter the
        number or path at the end of the profile URL, such as{" "}
        <code>/en/box-pro/123456</code>.
      </p>

      <label className={styles.checkboxRow}>
        <input
          className={styles.checkbox}
          type="checkbox"
          checked={isCompetitive}
          onChange={(e) => setIsCompetitive(e.target.checked)}
          disabled={busy}
        />
        <span>
          <strong>Competitive fighter</strong>
          <small>Show verified record links on my member profile.</small>
        </span>
      </label>

      <div className={styles.fieldGrid}>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label}>Boxing Ontario registration</span>
          <input
            className={styles.input}
            value={ontario}
            onChange={(e) => setOntario(e.target.value)}
            placeholder="BO-12345"
            autoComplete="off"
            aria-describedby="fighter-id-help"
            disabled={busy}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>BoxRec Pro</span>
          <input
            className={styles.input}
            value={boxrecPro}
            onChange={(e) => setBoxrecPro(e.target.value)}
            placeholder="123456"
            autoComplete="off"
            aria-describedby="fighter-id-help"
            disabled={busy}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>BoxRec Amateur</span>
          <input
            className={styles.input}
            value={boxrecAmateur}
            onChange={(e) => setBoxrecAmateur(e.target.value)}
            placeholder="123456"
            autoComplete="off"
            aria-describedby="fighter-id-help"
            disabled={busy}
          />
        </label>
      </div>

      <div className={styles.status} aria-live="polite">
        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save fighter IDs"}
        </Button>
      </div>
    </form>
  );
}
