"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@/lib/api";
import { resolveMemberPhoto } from "@/lib/member-photo";
import styles from "../ui.module.css";
import passportStyles from "./passport.module.css";

type Passport = {
  member: {
    name: string;
    photoUrl?: string | null;
    joinedAt: string;
    yearsAtGym: number;
  };
  progression: {
    xp: number;
    level: number;
    rank: string;
    xpToNextLevel?: number;
    progressPct?: number;
  };
  points?: number;
  lastClass?: { title: string; at: string; xp: number } | null;
  recentXp?: {
    delta: number;
    reason: string;
    sessionTitle?: string | null;
    at: string;
  }[];
  games?: {
    name: string;
    score: number;
    xpAwarded: number;
    classTitle: string;
    at: string;
  }[];
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

function reasonLabel(reason: string) {
  const map: Record<string, string> = {
    "attendance.checked_in": "Check-in",
    "class.completed": "Class complete",
    "kids.participation": "Kids class",
    "coach.choice": "Coach's Choice",
    "game.win": "Game win",
    "skill.milestone": "Skill milestone",
    "personal.best": "Personal best",
    teamwork: "Teamwork",
    achievement: "Achievement",
    "challenge.win": "Challenge",
  };
  return map[reason] ?? reason.replace(/\./g, " ");
}

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

  const pct = data.progression.progressPct ?? 0;
  const photo = resolveMemberPhoto({
    photoUrl: data.member.photoUrl,
    name: data.member.name,
  });

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Boxing Passport</p>

      <header className={passportStyles.identity}>
        {photo ? (
          <img
            className={passportStyles.portrait}
            src={photo}
            alt={data.member.name}
          />
        ) : null}
        <div className={passportStyles.identityText}>
          <h1 className={styles.title}>{data.member.name}</h1>
          <p className={styles.muted}>
            Member since {new Date(data.member.joinedAt).toLocaleDateString()} ·{" "}
            {data.member.yearsAtGym} yrs in the gym
          </p>
        </div>
      </header>

      <section className={passportStyles.hero}>
        <p className={passportStyles.rank}>{data.progression.rank}</p>
        <p className={passportStyles.levelLine}>
          Level {data.progression.level} · {data.progression.xp} XP
          {data.points != null ? ` · ${data.points} pts` : ""}
        </p>
        <div className={passportStyles.barTrack} aria-hidden>
          <div
            className={passportStyles.barFill}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={styles.muted}>
          {data.progression.xpToNextLevel ?? 0} XP to next level
        </p>
        <p className={passportStyles.ctaRow}>
          <Link href="/app/card" className={styles.link}>
            Open digital card
          </Link>
          {" · "}
          <Link href="/app/book" className={styles.link}>
            Book a class
          </Link>
        </p>
      </section>

      {data.lastClass ? (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Last class</h2>
          <p>
            <strong>{data.lastClass.title}</strong> · +{data.lastClass.xp} XP
          </p>
          <p className={styles.muted}>
            {new Date(data.lastClass.at).toLocaleString()}
          </p>
        </section>
      ) : null}

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Activity</h2>
        {(data.recentXp ?? []).length === 0 ? (
          <p className={styles.muted}>Train to fill your ledger.</p>
        ) : (
          <ul className={styles.list}>
            {data.recentXp!.map((x) => (
              <li key={x.at + x.reason + x.delta}>
                +{x.delta} · {reasonLabel(x.reason)}
                {x.sessionTitle ? ` · ${x.sessionTitle}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Games</h2>
        {(data.games ?? []).length === 0 ? (
          <p className={styles.muted}>Bag Battle scores land here.</p>
        ) : (
          <ul className={styles.list}>
            {data.games!.map((g) => (
              <li key={g.at + g.name}>
                <strong>{g.name}</strong> · {g.score} pts
                {g.xpAwarded ? ` · +${g.xpAwarded} XP` : ""} · {g.classTitle}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Attendance</h2>
        <p>
          {data.attendance.total} check-ins · {data.attendance.uniqueDays} days
          · streak {data.attendance.streak}
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Stamps</h2>
        {data.achievements.length === 0 ? (
          <p className={styles.muted}>Keep showing up — stamps land here.</p>
        ) : (
          <div className={passportStyles.stamps}>
            {data.achievements.map((a) => (
              <div key={a.code} className={passportStyles.stamp}>
                <strong>{a.name}</strong>
              </div>
            ))}
          </div>
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
