"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, get } from "@/lib/api";
import styles from "./analytics.module.css";

type Analytics = {
  windowDays: number;
  classesTaught: number;
  averageAttendance: number;
  totalAttendance: number;
  challengeParticipation: number;
  achievementsGranted: number;
  attendanceTrend: { date: string; count: number }[];
};

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default function CoachAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(() => {
    get<Analytics>("/api/v1/coach/analytics")
      .then((result) => {
        setData(result);
        setUpdatedAt(new Date());
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Training intelligence is temporarily unavailable.",
        );
      });
  }, []);

  useEffect(() => {
    load();
    const refresh = window.setInterval(load, 30_000);
    return () => window.clearInterval(refresh);
  }, [load]);

  const intelligence = useMemo(() => {
    if (!data) return null;
    const values = data.attendanceTrend.map((day) => day.count);
    const peak = data.attendanceTrend.reduce<
      { date: string; count: number } | undefined
    >(
      (best, day) => (!best || day.count > best.count ? day : best),
      undefined,
    );
    const midpoint = Math.ceil(values.length / 2);
    const earlier = values.slice(0, midpoint);
    const recent = values.slice(midpoint);
    const earlierAverage = earlier.length
      ? earlier.reduce((sum, value) => sum + value, 0) / earlier.length
      : 0;
    const recentAverage = recent.length
      ? recent.reduce((sum, value) => sum + value, 0) / recent.length
      : earlierAverage;
    const momentum =
      earlierAverage === 0
        ? recentAverage > 0
          ? 100
          : 0
        : Math.round(((recentAverage - earlierAverage) / earlierAverage) * 100);

    return {
      peak,
      maxAttendance: Math.max(1, ...values),
      momentum,
      classesPerWeek: (data.classesTaught / (data.windowDays / 7)).toFixed(1),
      challengeRate:
        data.classesTaught > 0
          ? Math.round(
              (data.challengeParticipation / data.classesTaught) * 100,
            )
          : 0,
    };
  }, [data]);

  return (
    <main className={styles.shell}>
      <nav className={styles.topNav} aria-label="Coach navigation">
        <Link href="/coach">Coach home</Link>
        <span aria-hidden>/</span>
        <strong>Training intelligence</strong>
        <Link className={styles.staffLink} href="/">
          Staff command
        </Link>
      </nav>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>SULLY&apos;S · COACH INTELLIGENCE</p>
          <h1>Know your corner.</h1>
          <p className={styles.intro}>
            A clear read on class rhythm, athlete attendance and the energy
            you&apos;re building on the floor.
          </p>
        </div>
        <div className={styles.liveStatus}>
          <i aria-hidden />
          <span>
            <strong>Live from Neon</strong>
            {updatedAt
              ? `Updated ${updatedAt.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}`
              : "Connecting…"}
          </span>
        </div>
      </header>

      {error ? (
        <div className={styles.error} role="alert">
          <strong>Couldn&apos;t refresh the corner report.</strong>
          <span>{error}</span>
          <button type="button" onClick={load}>
            Try again
          </button>
        </div>
      ) : null}

      {data && intelligence ? (
        <>
          <section className={styles.scoreboard} aria-label="30 day summary">
            <div className={styles.leadMetric}>
              <span>ATHLETES COACHED · {data.windowDays} DAYS</span>
              <strong>{data.totalAttendance}</strong>
              <p>
                Across {data.classesTaught}{" "}
                {data.classesTaught === 1 ? "class" : "classes"}
              </p>
            </div>
            <div className={styles.metric}>
              <span>Average corner</span>
              <strong>{data.averageAttendance}</strong>
              <small>Athletes per class</small>
            </div>
            <div className={styles.metric}>
              <span>Weekly rhythm</span>
              <strong>{intelligence.classesPerWeek}</strong>
              <small>Classes per week</small>
            </div>
            <div className={styles.metric}>
              <span>Momentum</span>
              <strong
                className={
                  intelligence.momentum >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {intelligence.momentum > 0 ? "+" : ""}
                {intelligence.momentum}%
              </strong>
              <small>Recent training days</small>
            </div>
          </section>

          <div className={styles.dashboard}>
            <section className={styles.trendCard}>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>ATTENDANCE RHYTHM</p>
                  <h2>Who showed up</h2>
                </div>
                <span>Check-ins by training day</span>
              </div>

              {data.attendanceTrend.length ? (
                <>
                  <div
                    className={styles.chart}
                    role="img"
                    aria-label={`Attendance by training day. Peak was ${intelligence.peak?.count ?? 0} check-ins.`}
                  >
                    {data.attendanceTrend.map((day) => (
                      <div className={styles.barSlot} key={day.date}>
                        <span className={styles.barValue}>{day.count}</span>
                        <i
                          className={styles.bar}
                          style={{
                            height: `${Math.max(
                              8,
                              (day.count / intelligence.maxAttendance) * 100,
                            )}%`,
                          }}
                        />
                        <small>{shortDate(day.date)}</small>
                      </div>
                    ))}
                  </div>
                  <div className={styles.chartFooter}>
                    <span>
                      <i className={styles.legendDot} aria-hidden />
                      Verified check-ins
                    </span>
                    <strong>
                      Peak: {intelligence.peak?.count ?? 0} on{" "}
                      {intelligence.peak
                        ? shortDate(intelligence.peak.date)
                        : "—"}
                    </strong>
                  </div>
                </>
              ) : (
                <div className={styles.empty}>
                  <span aria-hidden>◎</span>
                  <strong>Your next round starts the story.</strong>
                  <p>
                    Attendance will appear here after athletes check into a
                    coached class.
                  </p>
                  <Link href="/coach">Open today&apos;s classes</Link>
                </div>
              )}
            </section>

            <aside className={styles.cornerCard}>
              <p className={styles.eyebrow}>CORNER READ</p>
              <h2>
                {data.totalAttendance > 0
                  ? "Keep the rhythm moving."
                  : "Ready for the first bell."}
              </h2>
              <p>
                {intelligence.peak
                  ? `Your strongest training day landed on ${shortDate(
                      intelligence.peak.date,
                    )} with ${intelligence.peak.count} athlete${
                      intelligence.peak.count === 1 ? "" : "s"
                    } in the gym.`
                  : "Run a class and check in your athletes to unlock coaching insights."}
              </p>
              <div className={styles.cornerStats}>
                <div>
                  <span>Challenges run</span>
                  <strong>{data.challengeParticipation}</strong>
                </div>
                <div>
                  <span>Achievements earned</span>
                  <strong>{data.achievementsGranted}</strong>
                </div>
                <div>
                  <span>Challenge rhythm</span>
                  <strong>{intelligence.challengeRate}%</strong>
                  <small>Per 100 classes</small>
                </div>
              </div>
              <Link className={styles.actionLink} href="/coach/builder">
                Build the next workout <span aria-hidden>→</span>
              </Link>
            </aside>
          </div>

          <section className={styles.actions}>
            <div>
              <span className={styles.actionNumber}>01</span>
              <p>
                <strong>Run the room</strong>
                Launch today&apos;s session and keep every screen in sync.
              </p>
              <Link href="/coach">Coach live →</Link>
            </div>
            <div>
              <span className={styles.actionNumber}>02</span>
              <p>
                <strong>Know your athletes</strong>
                Review attendance and prepare the right corner notes.
              </p>
              <Link href="/coach/roster">Open boxing cards →</Link>
            </div>
            <div>
              <span className={styles.actionNumber}>03</span>
              <p>
                <strong>Keep them connected</strong>
                Follow up with a fighter or send the whole class a note.
              </p>
              <Link href="/coach/messages">Open communications →</Link>
            </div>
          </section>
        </>
      ) : !error ? (
        <div className={styles.loading} aria-live="polite">
          <span aria-hidden />
          <p>Reading the training floor…</p>
        </div>
      ) : null}
    </main>
  );
}
