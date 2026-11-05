"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { apiFetch } from "@/lib/api";
import { me } from "@/lib/auth";
import styles from "../staff.module.css";

type Round = {
  id: string;
  name: string;
  stance: string;
  signal: string;
  correction: string;
  drillTitle: string;
  drillSteps: string[];
  jabs: number;
  crosses: number;
  hooks: number;
  uppercuts: number;
  coachStatus: string;
  coachNote: string | null;
  createdAt: string;
};

export default function StaffShadowPage() {
  const [rows, setRows] = useState<Round[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await apiFetch<Round[]>("/api/v1/shadow/review");
    setRows(data);
  }

  useEffect(() => {
    me().then((data) => {
      const user = data?.user ?? data;
      if (!user?.role) {
        setError("Sign in to read the rounds.");
        setRows([]);
        return;
      }
      load().catch(() => {
        setError("The gym system is not answering yet.");
        setRows([]);
      });
    });
  }, []);

  async function review(id: string, coachStatus: "confirmed" | "replaced") {
    const existing = rows?.find((row) => row.id === id)?.coachNote ?? "";
    const note = (notes[id] ?? existing).trim();
    if (coachStatus === "replaced" && !note) {
      setError("Write the note that replaces the phone's read.");
      return;
    }
    setError(null);
    try {
      await apiFetch(`/api/v1/shadow/rounds/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ coachStatus, coachNote: note }),
      });
      await load();
    } catch {
      setError("That note did not save. Try again when the gym system is on.");
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>FLOOR</p>
      <h1 className={styles.title}>Shadow rounds</h1>
      <p className={styles.copy}>
        Adult members only. The phone keeps the film. You see the punch counts,
        the one fix, and you can change it. This is not a power reading and not
        an injury score.
      </p>
      <p className={styles.copy}>
        <Link href="/">Back to staff home</Link>
      </p>
      {error ? <p className={styles.copy}>{error}</p> : null}
      {!rows ? <p className={styles.copy}>Loading…</p> : null}
      <ul className={styles.list}>
        {(rows ?? []).map((row) => (
          <li key={row.id} className={styles.item}>
            <p className={styles.sectionTitle}>
              {row.name} · {row.drillTitle}
            </p>
            <p className={styles.meta}>
              {new Date(row.createdAt).toLocaleString()} · {row.stance} · {row.coachStatus}
            </p>
            <p className={styles.copy}>{row.correction}</p>
            <p className={styles.meta}>
              Jab {row.jabs} · Cross {row.crosses} · Hook {row.hooks} · Uppercut {row.uppercuts}
            </p>
            <ol>
              {row.drillSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {row.coachNote ? <p className={styles.copy}>Your note: {row.coachNote}</p> : null}
            <label className={styles.noteField}>
              Note for the member
              <input
                className={styles.input}
                value={notes[row.id] ?? row.coachNote ?? ""}
                onChange={(event) =>
                  setNotes((prev) => ({ ...prev, [row.id]: event.target.value }))
                }
              />
            </label>
            <div className={styles.actions}>
              <Button type="button" onClick={() => void review(row.id, "confirmed")}>
                Confirm
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void review(row.id, "replaced")}
              >
                Replace with my note
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
