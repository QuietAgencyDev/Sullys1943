"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, get } from "@/lib/api";
import styles from "../coach.module.css";

type Analytics = {
  windowDays: number;
  classesTaught: number;
  averageAttendance: number;
  totalAttendance: number;
  challengeParticipation: number;
  achievementsGranted: number;
  attendanceTrend: { date: string; count: number }[];
};

export default function CoachAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<Analytics>("/api/v1/coach/analytics")
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed"),
      );
  }, []);

  return (
    <main className={styles.shell}>
      <nav className={styles.topNav}>
        <Link href="/coach">Home</Link>
        <Link href="/coach/analytics">Analytics</Link>
        <Link href="/">Staff hub</Link>
      </nav>
      <p className={styles.eyebrow}>COACH ANALYTICS</p>
      <h1 className={styles.title}>Last 30 days</h1>
      {error ? <p className={styles.error}>{error}</p> : null}
      {data ? (
        <>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <strong>{data.classesTaught}</strong>
              <span>Classes taught</span>
            </div>
            <div className={styles.kpi}>
              <strong>{data.averageAttendance}</strong>
              <span>Avg attendance</span>
            </div>
            <div className={styles.kpi}>
              <strong>{data.challengeParticipation}</strong>
              <span>Challenges</span>
            </div>
            <div className={styles.kpi}>
              <strong>{data.achievementsGranted}</strong>
              <span>Achievements</span>
            </div>
          </div>
          <section className={styles.card} style={{ marginTop: "1.25rem" }}>
            <p className={styles.eyebrow}>Attendance trend</p>
            <ul className={styles.plainList}>
              {data.attendanceTrend.length === 0 ? (
                <li>No sessions in window.</li>
              ) : (
                data.attendanceTrend.map((d) => (
                  <li key={d.date}>
                    {d.date}: {d.count} check-ins
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : !error ? (
        <p className={styles.hint}>Loading…</p>
      ) : null}
    </main>
  );
}
