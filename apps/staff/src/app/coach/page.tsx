"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, get } from "@/lib/api";
import { me } from "@/lib/auth";
import styles from "./coach.module.css";

type Live = {
  status: string;
  phase: string;
  round: number;
  totalRounds: number;
  secondsLeft: number;
  syncedToCoach: boolean;
};

type SessionRow = {
  id: string;
  title: string;
  program: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  checkedIn: number;
  waitlisted: number;
  phase: string;
  coachName: string | null;
  live: Live;
};

type Home = {
  current: SessionRow | null;
  next: SessionRow | null;
  today: SessionRow[];
  kpis: { classesToday: number; checkedInToday: number; spotsOpen: number };
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CoachHomePage() {
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    me().then((data) => {
      const u = data?.user ?? data;
      if (u?.role) setRole(u.role);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await get<Home>("/api/v1/coach/home");
        if (!cancelled) {
          setHome(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load");
        }
      }
    }
    void load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <main className={styles.shell}>
      <nav className={styles.topNav} aria-label="Coach">
        <Link href="/coach">Home</Link>
        <Link href="/coach/roster">Roster</Link>
        <Link href="/">Staff hub</Link>
      </nav>

      <p className={styles.eyebrow}>COACH COMMAND CENTER</p>
      <h1 className={styles.title}>Today on the floor</h1>
      <p className={styles.meta}>
        Who&apos;s here · what you&apos;re running · timer under your control
        {role ? ` · signed in as ${role}` : ""}
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}

      {home ? (
        <>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <strong>{home.kpis.classesToday}</strong>
              <span>Classes</span>
            </div>
            <div className={styles.kpi}>
              <strong>{home.kpis.checkedInToday}</strong>
              <span>Checked in</span>
            </div>
            <div className={styles.kpi}>
              <strong>{home.kpis.spotsOpen}</strong>
              <span>Spots open</span>
            </div>
          </div>

          <div className={`${styles.grid} ${styles.grid2}`} style={{ marginTop: "1.25rem" }}>
            <section className={styles.card}>
              <p className={styles.eyebrow}>
                {home.current ? "Current / live" : "Up next"}
              </p>
              <h2>
                {(home.current ?? home.next)?.title ?? "No classes today"}
              </h2>
              {(home.current ?? home.next) ? (
                <>
                  <p className={styles.rowMeta}>
                    {fmtTime((home.current ?? home.next)!.startsAt)}–
                    {fmtTime((home.current ?? home.next)!.endsAt)}
                    {" · "}
                    {(home.current ?? home.next)!.checkedIn}/
                    {(home.current ?? home.next)!.booked} in
                    {" · "}
                    {(home.current ?? home.next)!.live.status}
                  </p>
                  <p>
                    <Link
                      href={`/coach/live/${(home.current ?? home.next)!.id}`}
                    >
                      Open Live Class Mode →
                    </Link>
                  </p>
                </>
              ) : (
                <p className={styles.hint}>Nothing on your schedule today.</p>
              )}
            </section>

            <section className={styles.card}>
              <p className={styles.eyebrow}>Next</p>
              <h2>{home.next?.title ?? "—"}</h2>
              {home.next ? (
                <p className={styles.rowMeta}>
                  {fmtTime(home.next.startsAt)} · {home.next.booked}/
                  {home.next.capacity} booked · {home.next.waitlisted} waitlist
                </p>
              ) : (
                <p className={styles.hint}>No upcoming class.</p>
              )}
            </section>
          </div>

          <section className={styles.card} style={{ marginTop: "1rem" }}>
            <p className={styles.eyebrow}>Today&apos;s classes</p>
            <ul className={styles.list}>
              {home.today.map((s) => (
                <li key={s.id}>
                  <Link className={styles.row} href={`/coach/live/${s.id}`}>
                    <span className={styles.rowTitle}>{s.title}</span>
                    <span className={styles.rowMeta}>
                      {fmtTime(s.startsAt)} · {s.phase} · {s.checkedIn}/
                      {s.booked} checked in · timer {s.live.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : !error ? (
        <p className={styles.hint}>Loading coach home…</p>
      ) : null}
    </main>
  );
}
