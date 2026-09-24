"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Skeleton } from "@sullys/ui";
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
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
    setLoading(true);
    setError(null);
    try {
      const from = weekDays[0] ? isoDate(weekDays[0]) : isoDate(new Date());
      const data = await get<SessionsResponse>(
        `/api/v1/sessions?from=${from}`,
        { signal: controller.signal },
      );
      setSessions(data.sessions ?? data.items ?? []);
    } catch (err) {
      setSessions([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof DOMException && err.name === "AbortError"
            ? "The class schedule took too long to respond."
          : "Could not load classes. Check your connection and retry.",
      );
    } finally {
      window.clearTimeout(timeoutId);
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
      setConfirmCancelId(null);
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

      <div
        className={bookStyles.weekStrip}
        role="group"
        aria-label="Choose a class date"
      >
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
              aria-pressed={active}
              aria-label={`${d.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}, ${count} ${count === 1 ? "class" : "classes"}`}
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

      <div aria-live="polite">
        {message ? (
          <Alert title="Corner updated" tone="success">
            {message}
          </Alert>
        ) : null}
        {error && sessions.length > 0 ? (
          <Alert title="That action didn’t land" tone="danger">
            {error}
          </Alert>
        ) : null}
      </div>

      {loading ? (
        <div className={bookStyles.loadingList} aria-label="Loading classes">
          {[0, 1, 2].map((item) => (
            <Card key={item}>
              <Skeleton width="35%" height="0.8rem" />
              <Skeleton width="70%" height="1.7rem" />
              <Skeleton width="100%" height="3.25rem" />
            </Card>
          ))}
        </div>
      ) : error && sessions.length === 0 ? (
        <Card accent>
          <Alert title="Classes couldn’t load" tone="warning">
            {error}
          </Alert>
          <div className={styles.actionsRow}>
            <Button type="button" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : daySessions.length === 0 ? (
        <Card>
          <p className={styles.eyebrow}>Rest day</p>
          <h2 className={styles.sectionTitle}>No sessions on this date</h2>
          <p className={styles.muted}>
            Choose another day above to find your next round.
          </p>
        </Card>
      ) : (
        <ul className={bookStyles.sessionList}>
          {daySessions.map((session) => {
            const title = session.name ?? session.title ?? "Class";
            const full =
              session.status === "full" ||
              (typeof session.spotsLeft === "number" &&
                session.spotsLeft <= 0);
            const mine = session.myBookingStatus;
            const busy = busyId === session.id;

            return (
              <li key={session.id} className={bookStyles.sessionItem}>
                <Card
                  className={`${bookStyles.sessionCard} ${
                    mine ? bookStyles.sessionCardMine : ""
                  }`}
                >
                  <div className={bookStyles.sessionTop}>
                    <div className={bookStyles.timeBlock}>
                      <span>{formatTime(session.startsAt)}</span>
                      <small>
                        {session.endsAt
                          ? `to ${formatTime(session.endsAt)}`
                          : "Start time"}
                      </small>
                    </div>
                    <div className={bookStyles.sessionCopy}>
                      <div className={bookStyles.titleRow}>
                        <h2>{title}</h2>
                        {mine === "confirmed" ? (
                          <Badge tone="success">Booked</Badge>
                        ) : mine === "waitlisted" ? (
                          <Badge tone="warning">Waitlisted</Badge>
                        ) : mine === "checked_in" ? (
                          <Badge tone="accent">Checked in</Badge>
                        ) : full ? (
                          <Badge tone="warning">Waitlist</Badge>
                        ) : (
                          <Badge tone="success">Open</Badge>
                        )}
                      </div>
                      <p className={styles.rowMeta}>
                        {session.coachName
                          ? `Coach ${session.coachName}`
                          : "Coach assignment coming soon"}
                        {session.room ? ` · ${session.room}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className={bookStyles.sessionBottom}>
                    <div className={bookStyles.capacity}>
                      <span
                        className={bookStyles.capacityBar}
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            width:
                              typeof session.booked === "number" &&
                              typeof session.capacity === "number" &&
                              session.capacity > 0
                                ? `${Math.min(
                                    100,
                                    Math.round(
                                      (session.booked / session.capacity) * 100,
                                    ),
                                  )}%`
                                : full
                                  ? "100%"
                                  : "0%",
                          }}
                        />
                      </span>
                      <small>
                        {typeof session.spotsLeft === "number"
                          ? session.spotsLeft > 0
                            ? `${session.spotsLeft} spots open`
                            : "Class full"
                          : "Capacity updating"}
                        {typeof session.waitlisted === "number" &&
                        session.waitlisted > 0
                          ? ` · ${session.waitlisted} waiting`
                          : ""}
                      </small>
                    </div>
                    <div className={bookStyles.actionsCol}>
                      {confirmCancelId === session.id ? (
                        <div
                          className={bookStyles.confirmCancel}
                          role="group"
                          aria-label={`Confirm cancellation for ${title}`}
                        >
                          <p>
                            {mine === "waitlisted"
                              ? "Leave this waitlist?"
                              : "Release your spot?"}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => setConfirmCancelId(null)}
                          >
                            Keep it
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => void cancelBooking(session.id)}
                          >
                            {busy ? "Updating…" : "Confirm"}
                          </Button>
                        </div>
                      ) : mine === "confirmed" ||
                        mine === "waitlisted" ||
                        mine === "checked_in" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={busy || mine === "checked_in"}
                          onClick={() => setConfirmCancelId(session.id)}
                        >
                          {mine === "checked_in"
                            ? "Checked in"
                            : mine === "waitlisted"
                              ? "Leave waitlist"
                              : "Cancel booking"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() => void bookOrWaitlist(session)}
                        >
                          {busy
                            ? "Updating…"
                            : full
                              ? "Join waitlist"
                              : "Book this class"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
