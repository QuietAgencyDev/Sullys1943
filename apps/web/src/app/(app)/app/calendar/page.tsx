"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Skeleton } from "@sullys/ui";
import { ApiError, get } from "@/lib/api";
import styles from "../ui.module.css";
import calendarStyles from "./calendar.module.css";

type CalendarItem = {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  kind?: string;
  location?: string;
  meta?: string;
  body?: string;
  booked?: boolean;
  program?: string;
};

type TodayResponse = {
  items?: CalendarItem[];
  schedule?: CalendarItem[];
};

function formatTime(value?: string) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function itemDetails(item: CalendarItem) {
  if (item.kind === "class_session") {
    return item.booked
      ? "Your spot is confirmed."
      : "Space may still be available.";
  }
  if (item.kind === "achievement_nudge") {
    return "Keep building your boxing passport.";
  }
  return item.body ?? item.meta ?? item.program ?? null;
}

function itemLabel(kind?: string) {
  if (kind === "class_session") return "Class";
  if (kind === "gym_event") return "Gym news";
  if (kind === "achievement_nudge") return "Progress";
  if (kind === "nutrition_plan") return "Nutrition";
  if (kind === "nutrition_pickup") return "Pickup";
  return "Today";
}

function itemTone(
  item: CalendarItem,
): "neutral" | "accent" | "success" | "warning" {
  if (item.kind === "class_session") {
    return item.booked ? "success" : "accent";
  }
  if (item.kind === "nutrition_pickup") return "warning";
  if (item.kind === "achievement_nudge") return "accent";
  return "neutral";
}

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
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
        const data = await get<TodayResponse>("/api/v1/calendar/today", {
          signal: controller.signal,
        });
        if (!active) return;
        setItems(data.items ?? data.schedule ?? []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setItems([]);
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof DOMException && err.name === "AbortError"
              ? "Today’s training board took too long to respond."
            : "Could not load today's schedule.",
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

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aTime = a.startsAt ? new Date(a.startsAt).getTime() : 0;
        const bTime = b.startsAt ? new Date(b.startsAt).getTime() : 0;
        return aTime - bTime;
      }),
    [items],
  );
  const bookedClasses = items.filter(
    (item) => item.kind === "class_session" && item.booked,
  ).length;
  const availableClasses = items.filter(
    (item) => item.kind === "class_session" && !item.booked,
  ).length;
  const nextBooked = sortedItems.find(
    (item) =>
      item.kind === "class_session" &&
      item.booked &&
      (!item.startsAt || new Date(item.startsAt).getTime() >= Date.now()),
  );

  return (
    <div className={styles.page}>
      <div className={calendarStyles.header}>
        <div className={styles.headerBlock}>
          <p className={styles.eyebrow}>Training hub</p>
          <h1 className={styles.title}>Today</h1>
          <p className={styles.lead}>
            Classes, gym updates, progress, and nutrition in one corner.
          </p>
        </div>
        <div className={calendarStyles.dateBlock} aria-label="Today’s date">
          <strong>{new Date().getDate()}</strong>
          <span>
            {new Date().toLocaleDateString([], {
              weekday: "short",
              month: "short",
            })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className={calendarStyles.loading} aria-label="Loading today">
          <Card>
            <Skeleton width="35%" height="0.8rem" />
            <Skeleton width="70%" height="2rem" />
            <Skeleton width="100%" height="5rem" />
          </Card>
          <Card>
            <Skeleton width="25%" height="0.8rem" />
            <Skeleton width="85%" height="4rem" />
          </Card>
        </div>
      ) : error ? (
        <Card accent>
          <Alert title="Today’s board is offline" tone="warning">
            {error}
          </Alert>
          <div className={styles.actionsRow}>
            <Button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Retry
            </Button>
            <Link href="/app">
              <Button type="button" variant="secondary">
                Member home
              </Button>
            </Link>
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <p className={styles.eyebrow}>Clear board</p>
          <h2 className={styles.sectionTitle}>Build today’s plan</h2>
          <p className={styles.muted}>
            Nothing is scheduled yet. Choose a class and put your next round on
            the board.
          </p>
          <div className={styles.actionsRow}>
            <Link href="/app/book">
              <Button type="button">Book a class</Button>
            </Link>
            <Link href="/app">
              <Button type="button" variant="secondary">
                Home
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className={calendarStyles.summaryGrid}>
            <Card className={calendarStyles.nextCard} accent>
              <p className={styles.eyebrow}>Your next bell</p>
              <h2>
                {nextBooked ? nextBooked.title : "Choose today’s class"}
              </h2>
              <p>
                {nextBooked
                  ? `${formatTime(nextBooked.startsAt)}${
                      nextBooked.endsAt
                        ? ` – ${formatTime(nextBooked.endsAt)}`
                        : ""
                    }`
                  : `${availableClasses} session${
                      availableClasses === 1 ? "" : "s"
                    } available today`}
              </p>
              <Link href={nextBooked ? "/app/card" : "/app/book"}>
                <Button type="button">
                  {nextBooked ? "Open check-in card" : "Find a class"}
                </Button>
              </Link>
            </Card>
            <div className={calendarStyles.stats}>
              <div>
                <strong>{bookedClasses}</strong>
                <span>Booked</span>
              </div>
              <div>
                <strong>{availableClasses}</strong>
                <span>Available</span>
              </div>
            </div>
          </div>

          <section className={calendarStyles.timeline}>
            <div className={calendarStyles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Your day</p>
                <h2 className={styles.sectionTitle}>On the board</h2>
              </div>
              <Link href="/app/book">View all classes</Link>
            </div>
            <ol>
              {sortedItems.map((item) => {
                const details = itemDetails(item);
                return (
                  <li key={`${item.kind ?? "item"}-${item.id}`}>
                    <time dateTime={item.startsAt}>
                      {formatTime(item.startsAt)}
                    </time>
                    <span className={calendarStyles.timelineMarker} aria-hidden />
                    <Card className={calendarStyles.timelineCard}>
                      <div className={calendarStyles.itemHeading}>
                        <div>
                          <Badge tone={itemTone(item)}>
                            {itemLabel(item.kind)}
                          </Badge>
                          <h3>{item.title}</h3>
                        </div>
                        {item.kind === "class_session" ? (
                          <Link href="/app/book">
                            {item.booked ? "Manage" : "Book"}
                          </Link>
                        ) : item.kind === "achievement_nudge" ? (
                          <Link href="/app/passport">Passport</Link>
                        ) : item.kind?.startsWith("nutrition") ? (
                          <Link href="/app/nutrition">Nutrition</Link>
                        ) : null}
                      </div>
                      {item.endsAt || item.location ? (
                        <p className={styles.rowMeta}>
                          {item.endsAt
                            ? `${formatTime(item.startsAt)} – ${formatTime(
                                item.endsAt,
                              )}`
                            : formatTime(item.startsAt)}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                      ) : null}
                      {details ? (
                        <p className={calendarStyles.details}>{details}</p>
                      ) : null}
                    </Card>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
