"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Skeleton } from "@sullys/ui";
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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
    setLoading(true);
    (async () => {
      try {
        const home = await get<HomeData>("/api/v1/portal/home", {
          signal: controller.signal,
        });
        if (!active) return;
        setData(home);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof DOMException && err.name === "AbortError"
              ? "The member service took too long to respond."
            : "Could not load your home. Check the connection and try again.",
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className={styles.page} aria-label="Opening your member home">
        <div className={styles.headerBlock}>
          <Skeleton width="6rem" height="0.7rem" />
          <Skeleton width="65%" height="3rem" />
          <Skeleton width="90%" height="1rem" />
        </div>
        <Card>
          <Skeleton width="5rem" height="0.7rem" />
          <Skeleton width="75%" height="2rem" />
          <Skeleton width="100%" height="5rem" />
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.headerBlock}>
          <p className={styles.eyebrow}>Member home</p>
          <h1 className={styles.title}>Your corner needs a reconnect.</h1>
        </div>
        <Card accent>
          <Alert title="Nothing was changed" tone="warning">
            {error ?? "We could not reach the member service."}
          </Alert>
          <div className={styles.actionsRow}>
            <Button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Retry
            </Button>
            <Link href="/app/login">
              <Button type="button" variant="secondary">
                Sign in
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const first = data.user.firstName || "Athlete";
  const membershipReady = data.membership?.status === "active";
  const waiverReady = data.waiver.signed;
  const bookingReady = Boolean(data.nextClass);
  const cardReady = waiverReady;
  const checklist = [
    {
      label: "Sign your waiver",
      detail: "Required before you step onto the floor.",
      complete: waiverReady,
      href: "/app/waiver",
      action: "Review waiver",
    },
    {
      label: "Activate membership",
      detail: "Make sure your training plan is active.",
      complete: membershipReady,
      href: "/join",
      action: "View plans",
    },
    {
      label: "Book your first class",
      detail: "Choose the session that starts your next round.",
      complete: bookingReady,
      href: "/app/book",
      action: "Book class",
    },
    {
      label: "Open your check-in card",
      detail: "Your rotating QR is ready after the waiver is signed.",
      complete: cardReady,
      href: "/app/card",
      action: "Open card",
    },
  ];
  const completedSteps = checklist.filter((step) => step.complete).length;
  const nextAction = !waiverReady
    ? { href: "/app/waiver", label: "Sign waiver", note: "Required to train" }
    : !membershipReady
      ? { href: "/join", label: "Activate membership", note: "Choose your plan" }
      : !bookingReady
        ? { href: "/app/book", label: "Book your first class", note: "Find a time" }
        : { href: "/app/card", label: "Open check-in card", note: "Ready for the desk" };

  return (
    <div className={styles.page}>
      <div className={styles.homeHeader}>
        <div className={styles.headerBlock}>
          <p className={styles.eyebrow}>Your corner</p>
          <h1 className={styles.title}>Hey, {first}</h1>
          <p className={styles.lead}>Know what&apos;s next. Get fight ready.</p>
        </div>
        <Badge tone="accent">Level {data.level}</Badge>
      </div>

      <Card accent className={styles.nextActionCard}>
        <div className={styles.rowTop}>
          <div>
            <p className={styles.eyebrow}>Do this next</p>
            <h2 className={styles.actionTitle}>{nextAction.label}</h2>
            <p className={styles.muted}>{nextAction.note}</p>
          </div>
          <span className={styles.actionNumber}>01</span>
        </div>
        <Link href={nextAction.href} className={styles.fullAction}>
          <Button type="button">{nextAction.label} →</Button>
        </Link>
      </Card>

      <Card>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Next up</p>
            <h2 className={styles.sectionTitle}>
              {data.nextClass ? data.nextClass.title : "Choose your next class"}
            </h2>
          </div>
          {data.nextClass ? (
            <Badge
              tone={
                data.nextClass.status === "waitlisted" ? "warning" : "success"
              }
            >
              {data.nextClass.status}
            </Badge>
          ) : null}
        </div>
        {data.nextClass ? (
          <div className={styles.classDetails}>
            <p className={styles.classWhen}>
              {formatWhen(data.nextClass.startsAt)}
            </p>
            <p className={styles.muted}>
              {data.nextClass.coach
                ? `Coach ${data.nextClass.coach}`
                : "Coach assignment coming soon"}
            </p>
          </div>
        ) : (
          <p className={styles.muted}>
            No booking yet. Find a class that works for your week.
          </p>
        )}
        <div className={styles.actionsRow}>
          <Link href="/app/book">
            <Button type="button">
              {data.nextClass ? "Manage booking" : "Book a class"}
            </Button>
          </Link>
          <Link href="/app/calendar">
            <Button type="button" variant="secondary">
              Today&apos;s schedule
            </Button>
          </Link>
        </div>
      </Card>

      {completedSteps < checklist.length ? (
        <Card>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Fight ready</p>
              <h2 className={styles.sectionTitle}>First-visit checklist</h2>
            </div>
            <Badge tone={completedSteps === 0 ? "warning" : "accent"}>
              {completedSteps}/{checklist.length}
            </Badge>
          </div>
          <div className={styles.progressTrack} aria-hidden>
            <span
              style={{
                width: `${Math.round(
                  (completedSteps / checklist.length) * 100,
                )}%`,
              }}
            />
          </div>
          <ol className={styles.checklist}>
            {checklist.map((step, index) => (
              <li
                key={step.label}
                className={step.complete ? styles.stepComplete : ""}
              >
                <span className={styles.stepMarker} aria-hidden>
                  {step.complete ? "✓" : index + 1}
                </span>
                <span className={styles.stepCopy}>
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </span>
                <Link href={step.href}>
                  {step.complete ? "Review" : step.action}
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      ) : (
        <Alert title="You’re fight ready" tone="success">
          Your waiver, membership, booking and digital card are set.
        </Alert>
      )}

      <div className={styles.quickGrid}>
        <Link href="/app/card" className={styles.quickAction}>
          <span className={styles.quickIcon} aria-hidden>
            ▣
          </span>
          <strong>Check-in card</strong>
          <small>Rotating desk QR</small>
        </Link>
        <Link href="/app/passport" className={styles.quickAction}>
          <span className={styles.quickStat}>{data.xp}</span>
          <strong>Boxing passport</strong>
          <small>{data.points} points earned</small>
        </Link>
        <Link href="/app/messages" className={styles.quickAction}>
          <span className={styles.quickIcon} aria-hidden>
            ◫
          </span>
          <strong>Messages</strong>
          <small>Gym and coach updates</small>
        </Link>
      </div>
    </div>
  );
}
