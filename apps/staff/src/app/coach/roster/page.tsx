"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../../staff.module.css";

type Session = {
  id: string;
  title: string;
  startsAt: string;
  coachName?: string | null;
  booked: number;
  capacity: number;
};

type RosterRow = {
  userId: string;
  name: string;
  email: string;
  bookingStatus: string;
  attendanceId: string | null;
  checkedIn: boolean;
  late: boolean;
  noShow: boolean;
  voided: boolean;
  lateBySeconds: number | null;
};

export default function CoachRosterPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [counts, setCounts] = useState({
    booked: 0,
    checkedIn: 0,
    late: 0,
    noShow: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("Entered in error");
  const [busy, setBusy] = useState(false);

  const loadRoster = useCallback(async (sessionId: string) => {
    const res = await get<{
      roster: RosterRow[];
      counts: {
        booked: number;
        checkedIn: number;
        late: number;
        noShow: number;
      };
    }>(`/api/v1/sessions/${sessionId}/roster`);
    setRoster(res.roster);
    setCounts(res.counts);
  }, []);

  useEffect(() => {
    get<{ sessions: Session[] }>("/api/v1/sessions")
      .then((res) => {
        setSessions(res.sessions);
        if (res.sessions[0]) setActiveId(res.sessions[0].id);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadRoster(activeId).catch((err) =>
      setError(err instanceof ApiError ? err.message : "Roster failed"),
    );
  }, [activeId, loadRoster]);

  async function finalize() {
    if (!activeId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ markedNoShow: number }>(
        `/api/v1/sessions/${activeId}/attendance/finalize`,
      );
      setMessage(`Finalized · ${res.markedNoShow} marked no-show`);
      await loadRoster(activeId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Finalize failed");
    } finally {
      setBusy(false);
    }
  }

  async function voidCheckIn(attendanceId: string) {
    if (!activeId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await post(`/api/v1/attendance/${attendanceId}/void`, {
        reason: voidReason,
      });
      setMessage("Check-in voided");
      await loadRoster(activeId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Void failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>COACH</p>
      <h1 className={styles.title}>Live roster</h1>
      <p className={styles.copy}>
        Check-ins, late flags, finalize no-shows, and void mistakes with a
        reason.
      </p>
      <p>
        <Link href="/">← Staff home</Link>
      </p>

      <div className={styles.row}>
        {sessions.map((s) => (
          <Button
            key={s.id}
            type="button"
            variant={activeId === s.id ? "primary" : "secondary"}
            onClick={() => setActiveId(s.id)}
          >
            {s.title}
          </Button>
        ))}
      </div>

      <p className={styles.meta}>
        {counts.checkedIn}/{counts.booked} checked in · {counts.late} late ·{" "}
        {counts.noShow} no-show
      </p>

      <div className={styles.row}>
        <Button type="button" disabled={busy || !activeId} onClick={finalize}>
          {busy ? "Working…" : "Finalize no-shows"}
        </Button>
        <label className={styles.field} style={{ flex: 1, minWidth: 200 }}>
          <span>Void reason</span>
          <input
            className={styles.input}
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
          />
        </label>
      </div>

      {message ? <p className={styles.copy}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <ul className={styles.list}>
        {roster.map((r) => (
          <li
            key={r.userId}
            className={`${styles.item} ${r.late ? styles.late : ""} ${r.voided ? styles.warn : ""}`}
          >
            <strong>{r.name}</strong>
            <div className={styles.meta}>
              {r.voided
                ? "VOIDED"
                : r.noShow
                  ? "No-show"
                  : r.checkedIn
                    ? "Checked in"
                    : "Booked"}
              {r.late ? " · LATE" : ""} · {r.email}
            </div>
            {r.attendanceId && r.checkedIn ? (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.buttonish}
                  disabled={busy}
                  onClick={() => voidCheckIn(r.attendanceId!)}
                >
                  Void check-in
                </button>
              </div>
            ) : null}
          </li>
        ))}
        {roster.length === 0 ? (
          <li className={styles.item}>
            <span className={styles.meta}>No bookings for this session.</span>
          </li>
        ) : null}
      </ul>
    </main>
  );
}
