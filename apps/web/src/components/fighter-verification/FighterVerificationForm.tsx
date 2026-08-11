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
    <form className={styles.wrap} onSubmit={onSubmit}>
      <p className={styles.eyebrow}>Verification</p>
      <p className={styles.title}>Competitive fighter IDs</p>
      <p className={styles.hint}>
        Optional. Link your Boxing Ontario registration and BoxRec profiles so
        coaches and the gym can verify competitive status. Find BoxRec IDs in
        the numbers (or path) at the end of your BoxRec URL — e.g.
        boxrec.com/en/box-pro/<strong>123456</strong> → store{" "}
        <code>/box-pro/123456</code> or <code>123456</code>.
      </p>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={isCompetitive}
          onChange={(e) => setIsCompetitive(e.target.checked)}
        />
        I am a competitive fighter
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Boxing Ontario registration #</span>
        <input
          className={styles.input}
          value={ontario}
          onChange={(e) => setOntario(e.target.value)}
          placeholder="e.g. BO-12345"
          autoComplete="off"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>BoxRec Pro ID / path</span>
        <input
          className={styles.input}
          value={boxrecPro}
          onChange={(e) => setBoxrecPro(e.target.value)}
          placeholder="/box-pro/123456"
          autoComplete="off"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>BoxRec Amateur ID / path</span>
        <input
          className={styles.input}
          value={boxrecAmateur}
          onChange={(e) => setBoxrecAmateur(e.target.value)}
          placeholder="/box-am/123456"
          autoComplete="off"
        />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save fighter IDs"}
        </Button>
      </div>
    </form>
  );
}
