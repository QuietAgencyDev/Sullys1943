"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApiError, get } from "@/lib/api";
import styles from "../programs/programs.module.css";

type LiveClass = {
  id: string;
  startsAt: string;
  name: string;
  spotsLeft: number;
  capacity: number;
  status: "open" | "full";
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await get<{ classes: LiveClass[] }>("/api/v1/classes/live");
        if (!active) return;
        setClasses(data.classes ?? []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load today’s classes.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>On the floor</p>
        <h1 className={styles.title}>Classes</h1>
        <p className={styles.copy}>
          Today&apos;s sessions at Sully&apos;s — times, spots, and what&apos;s
          open. Book from your member account after you join.
        </p>

        {loading ? (
          <p className={styles.copy}>Loading schedule…</p>
        ) : error ? (
          <p className={styles.copy}>{error}</p>
        ) : (
          <ul className={styles.grid}>
            {classes.map((c) => (
              <li key={c.id} className={styles.card}>
                <p className={styles.eyebrow}>{c.startsAt}</p>
                <h2 className={styles.cardTitle}>{c.name}</h2>
                <p className={styles.cardCopy}>
                  {c.status === "full"
                    ? "Class is full"
                    : `${c.spotsLeft} of ${c.capacity} spots left`}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.cta}>
          <Link href="/join">
            <Button type="button">Join to book</Button>
          </Link>
          <Link href="/programs">
            <Button type="button" variant="secondary">
              View programs
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
