"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@/lib/api";
import styles from "../ui.module.css";

type Passport = {
  member: { name: string; joinedAt: string; yearsAtGym: number };
  progression: { xp: number; level: number; rank: string };
  attendance: {
    total: number;
    uniqueDays: number;
    streak: number;
    recent: { at: string; status: string; method: string }[];
  };
  achievements: {
    code: string;
    name: string;
    description?: string | null;
    earnedAt: string;
  }[];
};

export default function PassportPage() {
  const [data, setData] = useState<Passport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<Passport>("/api/v1/passport/me")
      .then(setData)
      .catch((e) => setError(e.message ?? "Failed to load passport"));
  }, []);

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading Boxing Passport…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Boxing Passport</p>
      <h1 className={styles.title}>{data.member.name}</h1>
      <p className={styles.muted}>
        Member since {new Date(data.member.joinedAt).toLocaleDateString()} ·{" "}
        {data.member.yearsAtGym} yrs in the gym
      </p>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Progression</h2>
        <p>
          <strong>{data.progression.rank}</strong> · Level{" "}
          {data.progression.level} · {data.progression.xp} XP
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Attendance</h2>
        <p>
          {data.attendance.total} check-ins · {data.attendance.uniqueDays} days
          · streak {data.attendance.streak}
        </p>
        <ul className={styles.list}>
          {data.attendance.recent.map((r) => (
            <li key={r.at}>
              {new Date(r.at).toLocaleString()} — {r.status} ({r.method})
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Achievements</h2>
        {data.achievements.length === 0 ? (
          <p className={styles.muted}>Keep showing up — stamps land here.</p>
        ) : (
          <ul className={styles.list}>
            {data.achievements.map((a) => (
              <li key={a.code}>
                <strong>{a.name}</strong>
                {a.description ? ` — ${a.description}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p>
        <Link href="/legacy" className={styles.link}>
          Explore the Legacy Wall →
        </Link>
      </p>
    </div>
  );
}
