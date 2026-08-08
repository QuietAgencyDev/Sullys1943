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
  initials?: string;
  photoUrl?: string | null;
  bookingStatus: string;
  attendanceId: string | null;
  checkedIn: boolean;
  late: boolean;
  noShow: boolean;
  voided: boolean;
  lateBySeconds: number | null;
  xp?: number;
  level?: number;
  rank?: string;
  streak?: number;
  skillLevel?: string | null;
  lastNote?: string | null;
  chips?: { new?: boolean; late?: boolean; streak?: number };
};

type Note = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
};

type Badge = { code: string; name: string };

const SKILL_CATS = [
  "stance",
  "guard",
  "jab",
  "cross",
  "hook",
  "uppercut",
  "footwork",
  "defense",
  "combinations",
  "conditioning",
];

const LEVELS = [
  "LEARNING",
  "DEVELOPING",
  "COMPETENT",
  "ADVANCED",
  "MASTERED",
];

const XP_CODES = [
  "coach.choice",
  "skill.milestone",
  "personal.best",
  "teamwork",
];

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
  const [level, setLevel] = useState("DEVELOPING");
  const [category, setCategory] = useState("jab");
  const [goal, setGoal] = useState("");
  const [drill, setDrill] = useState("");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xpCode, setXpCode] = useState("coach.choice");
  const [card, setCard] = useState<{
    progression: { xp: number; level: number; rank: string };
    assessments: { category: string; level: string | null }[];
  } | null>(null);

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
    get<{ badges: Badge[] }>("/api/v1/coach/badges")
      .then((r) => setBadges(r.badges))
      .catch(() => undefined);
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
    setGoal("");
    setDrill("");
    setCard(null);
    try {
      const [notesRes, cardRes] = await Promise.all([
        get<{ notes: Note[] }>(
          `/api/v1/coach/athletes/${row.userId}/notes?limit=3`,
        ),
        get<{
          progression: { xp: number; level: number; rank: string };
          assessments: { category: string; level: string | null }[];
        }>(`/api/v1/coach/athletes/${row.userId}/card`),
      ]);
      setNotes(notesRes.notes);
      setCard(cardRes);
    } catch {
      setNotes([]);
    }
  }

  async function saveAssessment() {
    if (!drawerUser || !activeId) return;
    setBusy(true);
    try {
      if (noteBody.trim()) {
        await post("/api/v1/coach/notes", {
          athleteId: drawerUser.userId,
          sessionId: activeId,
          body: noteBody.trim(),
        });
      }
      await post("/api/v1/coach/assessments", {
        athleteId: drawerUser.userId,
        sessionId: activeId,
        category,
        level,
        notes: noteBody.trim() || undefined,
        goal: goal.trim() || undefined,
        recommendedDrill: drill.trim() || undefined,
      });
      setMessage(`Assessment saved for ${drawerUser.name}`);
      await openAthlete(drawerUser);
      setNoteBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function awardXp() {
    if (!drawerUser || !activeId) return;
    setBusy(true);
    try {
      const res = await post<{ delta: number; awarded: boolean }>(
        "/api/v1/coach/xp",
        {
          userId: drawerUser.userId,
          code: xpCode,
          sessionId: activeId,
          idempotencyKey: `coach.xp:${xpCode}:${activeId}:${drawerUser.userId}:${Date.now()}`,
        },
      );
      setMessage(
        res.awarded
          ? `+${res.delta} XP (${xpCode})`
          : "XP already awarded (duplicate)",
      );
      await openAthlete(drawerUser);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "XP failed");
    } finally {
      setBusy(false);
    }
  }

  async function grantBadge(code: string) {
    if (!drawerUser || !activeId) return;
    setBusy(true);
    try {
      const res = await post<{ granted: boolean; xp: number }>(
        "/api/v1/coach/achievements",
        {
          userId: drawerUser.userId,
          badgeCode: code,
          sessionId: activeId,
        },
      );
      setMessage(
        res.granted
          ? `Achievement granted · +${res.xp} XP`
          : "Already has this badge",
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Badge failed");
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    if (!activeId) return;
    setBusy(true);
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
        Present · Boxing Card · XP · assessments — one or two taps.
      </p>
      <p>
        <Link href="/coach">← Coach home</Link>
        {" · "}
        <Link href="/coach/builder">Builder</Link>
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
          Finalize no-shows
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
            <strong>
              {r.initials ? `[${r.initials}] ` : ""}
              {r.name}
            </strong>
            <div className={styles.meta}>
              {r.voided
                ? "VOIDED"
                : r.noShow
                  ? "No-show"
                  : r.checkedIn
                    ? "Checked in"
                    : "Booked"}
              {r.rank ? ` · ${r.rank} L${r.level}` : ""}
              {r.xp != null ? ` · ${r.xp} XP` : ""}
              {r.chips?.new ? " · NEW" : ""}
              {r.chips?.late ? " · LATE" : ""}
              {r.streak && r.streak >= 3 ? ` · ${r.streak}d streak` : ""}
              {r.skillLevel ? ` · ${r.skillLevel}` : ""}
              {r.lastNote ? ` · “${r.lastNote}”` : ""}
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
                Boxing Card
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
          <p className={styles.eyebrow}>BOXING CARD</p>
          <h2 className={styles.title} style={{ fontSize: "1.6rem" }}>
            {drawerUser.name}
          </h2>
          {card ? (
            <p className={styles.meta}>
              {card.progression.rank} · Level {card.progression.level} ·{" "}
              {card.progression.xp} XP
            </p>
          ) : null}

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Award XP</span>
              <select
                className={styles.input}
                value={xpCode}
                onChange={(e) => setXpCode(e.target.value)}
              >
                {XP_CODES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" disabled={busy} onClick={() => void awardXp()}>
              Award XP
            </Button>
          </div>

          <label className={styles.field}>
            <span>Achievement</span>
            <select
              className={styles.input}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) void grantBadge(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Give achievement…</option>
              {badges.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Coach note</span>
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
              <span>Skill</span>
              <select
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {SKILL_CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Level</span>
              <select
                className={styles.input}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.field}>
            <span>Goal</span>
            <input
              className={styles.input}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Recommended drill</span>
            <input
              className={styles.input}
              value={drill}
              onChange={(e) => setDrill(e.target.value)}
            />
          </label>
          <div className={styles.row}>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void saveAssessment()}
            >
              Save assessment
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
          </ul>
        </div>
      ) : null}
    </main>
  );
}
