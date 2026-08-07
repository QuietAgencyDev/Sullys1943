"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get } from "@/lib/api";
import styles from "./ui.module.css";

type HomeData = {
  user: { name: string; firstName: string; email: string; role: string };
  membership: { status: string; productName: string } | null;
  waiver: { status: string; signed: boolean };
  nextClass: {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    status: string;
    coach: string | null;
  } | null;
  xp: number;
  points: number;
  level: number;
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MemberHomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const home = await get<HomeData>("/api/v1/portal/home");
        if (!active) return;
        setData(home);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load your home. Check the connection and try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Opening your locker…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.headerBlock}>
          <p className={styles.eyebrow}>Member home</p>
          <h1 className={styles.title}>Couldn&apos;t load home</h1>
        </div>
        <div className={styles.empty}>
          <p className={styles.muted}>{error ?? "Unknown error"}</p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Button type="button" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Link href="/app/login">
              <Button type="button" variant="secondary">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const first = data.user.firstName || "Athlete";

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Member home</p>
        <h1 className={styles.title}>Hey, {first}</h1>
        <p className={styles.lead}>
          Your next class, card, and membership — one place before you hit the
          floor.
        </p>
      </div>

      <section className={styles.card}>
        <p className={styles.eyebrow}>Next up</p>
        {data.nextClass ? (
          <>
            <h2 className={styles.sectionTitle}>{data.nextClass.title}</h2>
            <p className={styles.muted}>
              {formatWhen(data.nextClass.startsAt)}
              {data.nextClass.coach ? ` · ${data.nextClass.coach}` : ""}
            </p>
            <p className={styles.muted}>
              {data.nextClass.status === "waitlisted"
                ? "You're on the waitlist — we'll promote you if a spot opens."
                : data.nextClass.status === "checked_in"
                  ? "Checked in — train hard."
                  : "Spot confirmed."}
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>No class booked yet</h2>
            <p className={styles.muted}>
              Grab a session this week — open classes fill fast.
            </p>
          </>
        )}
        <div className={styles.actionsRow}>
          <Link href="/app/book">
            <Button type="button">Book a class</Button>
          </Link>
          <Link href="/app/calendar">
            <Button type="button" variant="secondary">
              Today&apos;s schedule
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.rowTop}>
          <div>
            <p className={styles.eyebrow}>Digital card</p>
            <h2 className={styles.sectionTitle}>Show at the desk</h2>
            <p className={styles.muted}>
              QR check-in for the front desk scanner.
            </p>
          </div>
          <Link href="/app/card">
            <Button type="button" variant="secondary">
              Open card
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.card}>
        <p className={styles.eyebrow}>Status</p>
        <ul className={styles.list}>
          <li className={styles.row}>
            <div className={styles.rowTop}>
              <div>
                <p className={styles.rowTitle}>Membership</p>
                <p className={styles.rowMeta}>
                  {data.membership
                    ? `${data.membership.productName} · ${data.membership.status}`
                    : "No active plan — join or renew at the desk."}
                </p>
              </div>
              <span
                className={
                  data.membership?.status === "active"
                    ? styles.badgeOk
                    : styles.badgeMuted
                }
              >
                {data.membership?.status ?? "none"}
              </span>
            </div>
          </li>
          <li className={styles.row}>
            <div className={styles.rowTop}>
              <div>
                <p className={styles.rowTitle}>Waiver</p>
                <p className={styles.rowMeta}>
                  {data.waiver.signed
                    ? "Signed — you're cleared for the floor."
                    : "Required before training. Sign in Join or Documents."}
                </p>
              </div>
              <span
                className={data.waiver.signed ? styles.badgeOk : styles.badge}
              >
                {data.waiver.signed ? "signed" : data.waiver.status}
              </span>
            </div>
          </li>
          <li className={styles.row}>
            <div className={styles.rowTop}>
              <div>
                <p className={styles.rowTitle}>Passport</p>
                <p className={styles.rowMeta}>
                  Level {data.level} · {data.xp} XP · {data.points} points
                </p>
              </div>
              <Link href="/app/passport" className={styles.link}>
                View
              </Link>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
