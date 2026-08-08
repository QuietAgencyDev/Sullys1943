"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../../staff.module.css";

type HomeSession = {
  id: string;
  title: string;
  startsAt: string;
  coachName?: string | null;
  booked: number;
  capacity: number;
  checkedIn: number;
  phase: string;
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
  chips?: { new?: boolean; late?: boolean; streak?: number };
};

type Note = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
};

export default function CoachRosterPage() {
  const [sessions, setSessions] = useState<HomeSession[]>([]);
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
  const [drawerUser, setDrawerUser] = useState<RosterRow | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [score, setScore] = useState(3);
  const [category, setCategory] = useState("discipline");

  const loadRoster = useCallback(async (sessionId: string) => {
    const res = await get<{
      roster: RosterRow[];
      counts: {
        booked: number;
        checkedIn: number;
        late: number;
        noShow: number;
      };
    }>(`/api/v1/coach/sessions/${sessionId}/roster`);
    setRoster(res.roster);
    setCounts(res.counts);
  }, []);

  useEffect(() => {
    get<{ today: HomeSession[] }>("/api/v1/coach/home")
      .then((res) => {
        setSessions(res.today);
        if (res.today[0]) setActiveId(res.today[0].id);
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

  async function markPresent(userId: string) {
    if (!activeId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ duplicate?: boolean; xpAwarded?: number }>(
        `/api/v1/coach/sessions/${activeId}/roster/${userId}/present`,
      );
      setMessage(
        res.duplicate
          ? "Already checked in"
          : `Present · +${res.xpAwarded ?? 0} XP`,
      );
      await loadRoster(activeId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Present failed");
    } finally {
      setBusy(false);
    }
  }

  async function openAthlete(row: RosterRow) {
    setDrawerUser(row);
    setNoteBody("");
    setScore(3);
    try {
      const res = await get<{ notes: Note[] }>(
        `/api/v1/coach/athletes/${row.userId}/notes?limit=3`,
      );
      setNotes(res.notes);
    } catch {
      setNotes([]);
    }
  }

  async function saveNote() {
    if (!drawerUser || !noteBody.trim() || !activeId) return;
    setBusy(true);
    try {
      await post("/api/v1/coach/notes", {
        athleteId: drawerUser.userId,
        sessionId: activeId,
        body: noteBody.trim(),
      });
      await post("/api/v1/coach/assessments", {
        athleteId: drawerUser.userId,
        sessionId: activeId,
        category,
        score,
      });
      setMessage(`Note saved for ${drawerUser.name}`);
      const res = await get<{ notes: Note[] }>(
        `/api/v1/coach/athletes/${drawerUser.userId}/notes?limit=3`,
      );
      setNotes(res.notes);
      setNoteBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

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
        One-tap present, attention chips, notes, and finalize no-shows — scoped
        to your classes.
      </p>
      <p>
        <Link href="/coach">← Coach home</Link>
        {" · "}
        <Link href="/">Staff hub</Link>
        {activeId ? (
          <>
            {" · "}
            <Link href={`/coach/live/${activeId}`}>Live Class Mode</Link>
          </>
        ) : null}
      </p>

      <div className={styles.row}>
        {sessions.map((s) => (
          <Button
            key={s.id}
            type="button"
            variant={activeId === s.id ? "primary" : "secondary"}
            onClick={() => setActiveId(s.id)}
          >
            {s.title} · {s.checkedIn}/{s.booked}
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
              {r.chips?.new ? " · NEW" : ""}
              {r.chips?.late ? " · LATE" : ""}
              {r.chips?.streak ? ` · ${r.chips.streak}-day streak` : ""}
              {" · "}
              {r.email}
            </div>
            <div className={styles.actions}>
              {!r.checkedIn && !r.voided && !r.noShow ? (
                <button
                  type="button"
                  className={styles.buttonish}
                  disabled={busy}
                  onClick={() => void markPresent(r.userId)}
                >
                  Present
                </button>
              ) : null}
              <button
                type="button"
                className={styles.buttonish}
                disabled={busy}
                onClick={() => void openAthlete(r)}
              >
                Note
              </button>
              {r.attendanceId && r.checkedIn ? (
                <button
                  type="button"
                  className={styles.buttonish}
                  disabled={busy}
                  onClick={() => void voidCheckIn(r.attendanceId!)}
                >
                  Void
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {roster.length === 0 ? (
          <li className={styles.item}>
            <span className={styles.meta}>No bookings for this session.</span>
          </li>
        ) : null}
      </ul>

      {drawerUser ? (
        <div className={styles.panel} style={{ marginTop: "1.25rem" }}>
          <p className={styles.eyebrow}>ATHLETE</p>
          <h2 className={styles.title} style={{ fontSize: "1.6rem" }}>
            {drawerUser.name}
          </h2>
          <label className={styles.field}>
            <span>Quick note</span>
            <textarea
              className={styles.input}
              rows={3}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Footwork cleaned up in round 3…"
            />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Category</span>
              <select
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {[
                  "stance",
                  "guard",
                  "jab",
                  "footwork",
                  "defense",
                  "conditioning",
                  "discipline",
                  "teamwork",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Score 1–5</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={5}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </label>
          </div>
          <div className={styles.row}>
            <Button type="button" disabled={busy} onClick={() => void saveNote()}>
              Save note + score
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerUser(null)}
            >
              Close
            </Button>
          </div>
          <ul className={styles.list}>
            {notes.map((n) => (
              <li key={n.id} className={styles.item}>
                <div className={styles.meta}>
                  {n.author} · {new Date(n.createdAt).toLocaleString()}
                </div>
                <strong>{n.body}</strong>
              </li>
            ))}
            {notes.length === 0 ? (
              <li className={styles.item}>
                <span className={styles.meta}>No notes yet.</span>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
