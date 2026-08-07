"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../ui.module.css";
import bookStyles from "./book.module.css";

type Session = {
  id: string;
  title?: string;
  name?: string;
  startsAt: string;
  endsAt?: string;
  spotsLeft?: number;
  capacity?: number;
  booked?: number;
  waitlisted?: number;
  status?: string;
  coachName?: string | null;
  room?: string | null;
  myBookingStatus?: string | null;
};

type SessionsResponse = {
  sessions?: Session[];
  items?: Session[];
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dayLabel(d: Date) {
  return d.toLocaleDateString([], { weekday: "short" });
}

export default function BookPage() {
  const weekDays = useMemo(() => {
    const start = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const [selectedDay, setSelectedDay] = useState(() => isoDate(new Date()));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = weekDays[0] ? isoDate(weekDays[0]) : isoDate(new Date());
      const data = await get<SessionsResponse>(`/api/v1/sessions?from=${from}`);
      setSessions(data.sessions ?? data.items ?? []);
    } catch (err) {
      setSessions([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load classes. Check your connection and retry.",
      );
    } finally {
      setLoading(false);
    }
  }, [weekDays]);

  useEffect(() => {
    void load();
  }, [load]);

  const daySessions = useMemo(() => {
    return sessions.filter((s) => s.startsAt.slice(0, 10) === selectedDay);
  }, [sessions, selectedDay]);

  async function bookOrWaitlist(session: Session) {
    setBusyId(session.id);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ message?: string; waitlisted?: boolean }>(
        `/api/v1/sessions/${session.id}/bookings`,
        {},
      );
      setMessage(
        res.message ??
          (res.waitlisted
            ? "You're on the waitlist."
            : "Booked. See you on the floor."),
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Booking failed. Try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function cancelBooking(sessionId: string) {
    setBusyId(sessionId);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ promoted?: { userId: string } | null }>(
        `/api/v1/sessions/${sessionId}/bookings/cancel`,
        {},
      );
      setMessage(
        res.promoted
          ? "Cancelled — next waitlisted member was promoted."
          : "Booking cancelled.",
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not cancel booking.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Classes</p>
        <h1 className={styles.title}>Book a Session</h1>
        <p className={styles.lead}>
          Pick a day, claim a spot, or join the waitlist when the room is full.
        </p>
      </div>

      <div className={bookStyles.weekStrip} role="tablist" aria-label="Week">
        {weekDays.map((d) => {
          const key = isoDate(d);
          const active = key === selectedDay;
          const count = sessions.filter(
            (s) => s.startsAt.slice(0, 10) === key,
          ).length;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${bookStyles.dayChip} ${active ? bookStyles.dayChipActive : ""}`}
              onClick={() => setSelectedDay(key)}
            >
              <span className={bookStyles.dayName}>{dayLabel(d)}</span>
              <span className={bookStyles.dayNum}>{d.getDate()}</span>
              <span className={bookStyles.dayCount}>
                {count ? `${count}` : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {message ? <p className={styles.muted}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {loading ? (
        <p className={styles.muted}>Loading sessions…</p>
      ) : error && sessions.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.muted}>Classes couldn&apos;t load right now.</p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Button type="button" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        </div>
      ) : daySessions.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.muted}>
            No classes on this day. Try another day in the week strip.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {daySessions.map((session) => {
            const title = session.name ?? session.title ?? "Class";
            const full =
              session.status === "full" ||
              (typeof session.spotsLeft === "number" &&
                session.spotsLeft <= 0);
            const mine = session.myBookingStatus;
            const busy = busyId === session.id;

            return (
              <li key={session.id} className={styles.row}>
                <div className={styles.rowTop}>
                  <div>
                    <p className={styles.rowTitle}>{title}</p>
                    <p className={styles.rowMeta}>
                      {formatTime(session.startsAt)}
                      {session.endsAt ? ` – ${formatTime(session.endsAt)}` : ""}
                      {session.coachName ? ` · ${session.coachName}` : ""}
                      {session.room ? ` · ${session.room}` : ""}
                    </p>
                    <div className={bookStyles.chips}>
                      <span className={styles.badgeMuted}>
                        {typeof session.booked === "number" &&
                        typeof session.capacity === "number"
                          ? `${session.booked}/${session.capacity}`
                          : full
                            ? "Full"
                            : `${session.spotsLeft ?? "?"} open`}
                      </span>
                      {full ? (
                        <span className={styles.badge}>Waitlist</span>
                      ) : (
                        <span className={styles.badgeOk}>Open</span>
                      )}
                      {mine === "confirmed" || mine === "checked_in" ? (
                        <span className={styles.badgeOk}>Booked</span>
                      ) : null}
                      {mine === "waitlisted" ? (
                        <span className={styles.badge}>Waitlisted</span>
                      ) : null}
                      {typeof session.waitlisted === "number" &&
                      session.waitlisted > 0 ? (
                        <span className={styles.badgeMuted}>
                          {session.waitlisted} waiting
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className={bookStyles.actionsCol}>
                    {mine === "confirmed" ||
                    mine === "waitlisted" ||
                    mine === "checked_in" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy || mine === "checked_in"}
                        onClick={() => void cancelBooking(session.id)}
                      >
                        {busy ? "…" : mine === "waitlisted" ? "Leave" : "Cancel"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => void bookOrWaitlist(session)}
                      >
                        {busy
                          ? "…"
                          : full
                            ? "Join waitlist"
                            : "Book"}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
