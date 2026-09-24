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
  development?: {
    category: string;
    level: string | null;
    score: number;
    goal?: string | null;
    recommendedDrill?: string | null;
    reviewedAt: string;
    nextReviewAt?: string | null;
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
  const development = data.development ?? [];
  const skillAverage = development.length
    ? (
        development.reduce((sum, skill) => sum + skill.score, 0) /
        development.length
      ).toFixed(1)
    : "—";
  const currentFocus = development.find((skill) => skill.goal) ?? development[0];
  const nextReview = development
    .filter((skill) => skill.nextReviewAt)
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt!).getTime() -
        new Date(b.nextReviewAt!).getTime(),
    )[0];

  return (
    <div className={`${styles.page} ${passportStyles.page}`}>
      <header className={passportStyles.passportHeader}>
        <div className={passportStyles.identity}>
          {photo ? (
            <img
              className={passportStyles.portrait}
              src={photo}
              alt={data.member.name}
            />
          ) : (
            <span className={passportStyles.initials} aria-hidden>
              {data.member.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
          <div className={passportStyles.identityText}>
            <p className={styles.eyebrow}>SULLY&apos;S BOXING PASSPORT</p>
            <h1>{data.member.name}</h1>
            <p>
              Athlete since{" "}
              {new Date(data.member.joinedAt).toLocaleDateString([], {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span className={passportStyles.verified}>● VERIFIED ATHLETE</span>
      </header>

      <section className={passportStyles.hero}>
        <div className={passportStyles.rankBlock}>
          <span>Current rank</span>
          <strong>{data.progression.rank}</strong>
          <p>
            Level {data.progression.level} · {data.progression.xp} XP
          </p>
        </div>
        <div className={passportStyles.levelBlock}>
          <div>
            <span>Next level</span>
            <strong>{pct}%</strong>
          </div>
          <div className={passportStyles.barTrack} aria-hidden>
            <div
              className={passportStyles.barFill}
              style={{ width: `${pct}%` }}
            />
          </div>
          <small>{data.progression.xpToNextLevel ?? 0} XP to go</small>
        </div>
        <div className={passportStyles.heroStat}>
          <strong>{data.attendance.total}</strong>
          <span>Classes</span>
        </div>
        <div className={passportStyles.heroStat}>
          <strong>{data.attendance.streak}</strong>
          <span>Day streak</span>
        </div>
      </section>

      <div className={passportStyles.quickActions}>
        <Link href="/app/book">Book the next round <span>→</span></Link>
        <Link href="/app/card">Open check-in card <span>▣</span></Link>
      </div>

      <section className={passportStyles.development}>
        <div className={passportStyles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>COACH DEVELOPMENT</p>
            <h2>Your boxing craft</h2>
          </div>
          <div className={passportStyles.skillScore}>
            <strong>{skillAverage}</strong>
            <span>Skill average / 5</span>
          </div>
        </div>

        {development.length ? (
          <>
            <div className={passportStyles.skillGrid}>
              {development.map((skill) => (
                <div key={skill.category} className={passportStyles.skill}>
                  <div>
                    <span>{skill.category}</span>
                    <strong>{skill.level ?? "Rated"}</strong>
                  </div>
                  <div className={passportStyles.skillBars} aria-hidden>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <i
                        key={score}
                        className={
                          score <= skill.score ? passportStyles.skillActive : ""
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {currentFocus ? (
              <div className={passportStyles.focus}>
                <div className={passportStyles.focusTitle}>
                  <span>COACH&apos;S CURRENT FOCUS</span>
                  <strong>{currentFocus.category}</strong>
                </div>
                <div>
                  <span>Your next target</span>
                  <strong>
                    {currentFocus.goal ?? "Keep sharpening the fundamentals"}
                  </strong>
                </div>
                <div>
                  <span>Put in the work</span>
                  <strong>
                    {currentFocus.recommendedDrill ??
                      "Ask your coach for today’s drill"}
                  </strong>
                </div>
              </div>
            ) : null}

            {nextReview ? (
              <p className={passportStyles.reviewDate}>
                Next coach review ·{" "}
                <strong>
                  {new Date(nextReview.nextReviewAt!).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </p>
            ) : null}
          </>
        ) : (
          <div className={passportStyles.developmentEmpty}>
            <strong>Your first coach assessment is ahead.</strong>
            <p>
              Train, get feedback and watch your boxing craft build here.
            </p>
            <Link href="/app/book">Book a class →</Link>
          </div>
        )}
      </section>

      <div className={passportStyles.twoColumn}>
        <section className={passportStyles.panel}>
          <div className={passportStyles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>MOMENTUM</p>
              <h2>Work logged</h2>
            </div>
          </div>
          {(data.recentXp ?? []).length ? (
            <ul className={passportStyles.timeline}>
              {data.recentXp!.slice(0, 6).map((entry) => (
                <li key={entry.at + entry.reason + entry.delta}>
                  <span>+{entry.delta}</span>
                  <div>
                    <strong>{reasonLabel(entry.reason)}</strong>
                    <small>
                      {entry.sessionTitle ?? "Sully’s Boxing"} ·{" "}
                      {new Date(entry.at).toLocaleDateString()}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={passportStyles.emptyCopy}>
              Train to begin your momentum ledger.
            </p>
          )}
        </section>

        <section className={passportStyles.panel}>
          <div className={passportStyles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>PERFORMANCE</p>
              <h2>Game results</h2>
            </div>
          </div>
          {(data.games ?? []).length ? (
            <ul className={passportStyles.gameList}>
              {data.games!.slice(0, 5).map((game) => (
                <li key={game.at + game.name}>
                  <div>
                    <strong>{game.name}</strong>
                    <small>{game.classTitle}</small>
                  </div>
                  <span>{game.score}<small>PTS</small></span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={passportStyles.emptyCopy}>
              Your class game scores will land here.
            </p>
          )}
        </section>
      </div>

      <section className={passportStyles.achievements}>
        <div className={passportStyles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>EARNED AT SULLY&apos;S</p>
            <h2>Achievement wall</h2>
          </div>
          <span>{data.achievements.length} earned</span>
        </div>
        {data.achievements.length ? (
          <div className={passportStyles.stamps}>
            {data.achievements.map((achievement) => (
              <div key={achievement.code} className={passportStyles.stamp}>
                <span aria-hidden>★</span>
                <strong>{achievement.name}</strong>
                <small>
                  {new Date(achievement.earnedAt).toLocaleDateString([], {
                    month: "short",
                    year: "numeric",
                  })}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className={passportStyles.emptyCopy}>
            Keep showing up. Your first achievement is waiting.
          </p>
        )}
      </section>

      <Link href="/legacy" className={passportStyles.legacyLink}>
        Explore the Sully&apos;s Legacy Wall <span>→</span>
      </Link>
    </div>
  );
}
