"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get } from "@/lib/api";
import styles from "../ui.module.css";

type CalendarItem = {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  kind?: string;
  location?: string;
  meta?: string;
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

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await get<TodayResponse>("/api/v1/calendar/today");
        if (!active) return;
        setItems(data.items ?? data.schedule ?? []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setItems([]);
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load today's schedule.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Calendar hub</p>
        <h1 className={styles.title}>Today&apos;s Schedule</h1>
        <p className={styles.lead}>
          Classes, bookings, and gym events for today.
        </p>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading schedule…</p>
      ) : error ? (
        <div className={styles.empty}>
          <p className={styles.muted}>{error}</p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Button type="button" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Link href="/app">
              <Button type="button" variant="secondary">
                Member home
              </Button>
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.muted}>
            Nothing on your board yet for today. Book a class to fill the day.
          </p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Link href="/app/book">
              <Button type="button">Book a class</Button>
            </Link>
            <Link href="/app">
              <Button type="button" variant="secondary">
                Home
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div className={styles.rowTop}>
                <div>
                  <p className={styles.rowTitle}>{item.title}</p>
                  <p className={styles.rowMeta}>
                    {formatTime(item.startsAt)}
                    {item.endsAt ? ` – ${formatTime(item.endsAt)}` : ""}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                  {item.meta ? (
                    <p className={styles.rowMeta}>{item.meta}</p>
                  ) : null}
                </div>
                {item.kind ? (
                  <span className={styles.badge}>{item.kind}</span>
                ) : (
                  <span className={styles.badgeMuted}>session</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
