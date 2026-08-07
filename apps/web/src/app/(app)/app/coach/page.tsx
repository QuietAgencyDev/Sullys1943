"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, get } from "@/lib/api";
import styles from "./coach.module.css";

type SessionRow = {
  id: string;
  title: string;
  startsAt: string;
  phase: string;
  checkedIn: number;
  booked: number;
  live: { status: string };
};

type Home = {
  current: SessionRow | null;
  next: SessionRow | null;
  today: SessionRow[];
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AppCoachHomePage() {
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<Home>("/api/v1/coach/home")
      .then(setHome)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Coach access required"),
      );
  }, []);

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>COACH · PHONE</p>
      <h1 className={styles.title}>Command</h1>
      <p className={styles.copy}>
        Start class, control the round clock, finish and award XP. Tablet tools
        live on the staff app.
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {home?.current || home?.next ? (
        <Link
          className={styles.hero}
          href={`/app/coach/live/${(home.current ?? home.next)!.id}`}
        >
          <span className={styles.heroLabel}>
            {home.current ? "Live now" : "Up next"}
          </span>
          <strong>{(home.current ?? home.next)!.title}</strong>
          <span>
            {fmtTime((home.current ?? home.next)!.startsAt)} · Open Live Mode
          </span>
        </Link>
      ) : null}
      <ul className={styles.list}>
        {home?.today.map((s) => (
          <li key={s.id}>
            <Link href={`/app/coach/live/${s.id}`}>
              <strong>{s.title}</strong>
              <span>
                {fmtTime(s.startsAt)} · {s.checkedIn}/{s.booked} · timer{" "}
                {s.live.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
