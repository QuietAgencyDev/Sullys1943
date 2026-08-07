"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { API_URL } from "@/lib/api";
import styles from "./legacy.module.css";

type Entry = {
  id: string;
  decade: number;
  year: number | null;
  type: string;
  title: string;
  body: string;
  mediaUrl: string | null;
};

export default function LegacyPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeDecade, setActiveDecade] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/legacy/timeline`)
      .then((r) => r.json())
      .then((data: { entries: Entry[] }) => {
        setEntries(data.entries ?? []);
        if (data.entries?.[0]) setActiveDecade(data.entries[0].decade);
      })
      .catch(() => setError("Could not load timeline"));
  }, []);

  const decades = [...new Set(entries.map((e) => e.decade))].sort(
    (a, b) => a - b,
  );
  const visible = entries.filter(
    (e) => activeDecade == null || e.decade === activeDecade,
  );

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Character is the legacy</p>
        <h1 className={styles.title}>Legacy Wall</h1>
        <p className={styles.copy}>
          Earl “Sully” Sullivan bought a gym so youth could find a second chance.
          That spirit still runs the floor — from Ossington to today.
        </p>
        <p className={styles.manifesto}>
          Boxing is the engine · People are the purpose · Character is the legacy
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.decades} role="tablist" aria-label="Decades">
          {decades.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={activeDecade === d}
              className={`${styles.decade} ${activeDecade === d ? styles.decadeActive : ""}`}
              onClick={() => setActiveDecade(d)}
            >
              {d}s
            </button>
          ))}
        </div>

        <ol className={styles.timeline}>
          {visible.map((e) => (
            <li key={e.id} className={styles.entry}>
              <span className={styles.year}>{e.year ?? `${e.decade}s`}</span>
              <span className={styles.type}>{e.type}</span>
              <h2 className={styles.entryTitle}>{e.title}</h2>
              <p className={styles.entryBody}>{e.body}</p>
            </li>
          ))}
        </ol>

        <div className={styles.cta}>
          <Link href="/app/passport">
            <Button type="button">Open your Boxing Passport</Button>
          </Link>
          <Link href="/">
            <Button type="button" variant="secondary">
              Back home
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
