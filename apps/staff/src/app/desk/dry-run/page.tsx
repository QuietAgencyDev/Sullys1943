"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, post } from "@/lib/api";
import styles from "../../staff.module.css";

type Step = {
  id: string;
  title: string;
  ok: boolean;
  detail: string;
};

type Result = {
  asOf: string;
  passed: number;
  total: number;
  steps: Step[];
};

const MANUAL = [
  {
    title: "Focus the scan field",
    detail: "On /desk, click Scan target. USB wedge types like a keyboard.",
  },
  {
    title: "Member QR happy path",
    detail:
      "member@ portal → Digital card → scan QR (or paste token + Enter).",
  },
  {
    title: "Waiver gate",
    detail:
      "Unsigned guest should fail. Tick Staff override, reason (≥4 chars), retry.",
  },
  {
    title: "Drop-in sale",
    detail: "Sell drop-in with check-in checked — guest walks in same day.",
  },
  {
    title: "Attach today’s class",
    detail: "Pick a session so late flags appear on coach roster.",
  },
] as const;

export default function DeskDryRunPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  async function runAuto() {
    setPending(true);
    setError(null);
    try {
      const res = await post<Result>("/api/v1/desk/dry-run");
      setResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Dry-run failed — sign in as desk@ or owner@",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>FRONT DESK</p>
      <h1 className={styles.title}>Scanner dry-run</h1>
      <p className={styles.copy}>
        Rehearse HID wedge + waiver gate + override + drop-in before the USB
        scanner arrives.
      </p>
      <p>
        <Link href="/desk">← Desk scanner</Link>
        {" · "}
        <Link href="/">Staff home</Link>
      </p>

      <section className={styles.panel} style={{ maxWidth: 560 }}>
        <h2 className={styles.sectionTitle}>Auto checks</h2>
        <Button type="button" disabled={pending} onClick={runAuto}>
          {pending ? "Running…" : "Run API dry-run"}
        </Button>
        {error ? <p className={styles.error}>{error}</p> : null}
        {result ? (
          <>
            <p className={styles.copy}>
              {result.passed}/{result.total} passed ·{" "}
              {new Date(result.asOf).toLocaleString()}
            </p>
            <ul className={styles.list}>
              {result.steps.map((s) => (
                <li
                  key={s.id}
                  className={`${styles.listRow} ${s.ok ? "" : styles.warn}`}
                >
                  <div>
                    <strong>
                      {s.ok ? "✓" : "✗"} {s.title}
                    </strong>
                    <p className={styles.hint}>{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section
        className={styles.panel}
        style={{ maxWidth: 560, marginTop: "1.5rem" }}
      >
        <h2 className={styles.sectionTitle}>Manual floor checklist</h2>
        <ul className={styles.list}>
          {MANUAL.map((item) => (
            <li key={item.title} className={styles.listRow}>
              <label
                style={{ display: "grid", gap: "0.25rem", cursor: "pointer" }}
              >
                <span>
                  <input
                    type="checkbox"
                    checked={Boolean(checked[item.title])}
                    onChange={(e) =>
                      setChecked((prev) => ({
                        ...prev,
                        [item.title]: e.target.checked,
                      }))
                    }
                  />{" "}
                  <strong>{item.title}</strong>
                </span>
                <span className={styles.hint}>{item.detail}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
