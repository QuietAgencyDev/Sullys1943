"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../../staff.module.css";
import rosterStyles from "./roster.module.css";

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

type AthleteCard = {
  athlete: {
    id: string;
    name: string;
    photoUrl?: string | null;
    initials: string;
    joinedAt: string;
  };
  progression: {
    xp: number;
    level: number;
    rank: string;
    xpToNextLevel?: number;
    progressPct?: number;
  };
  notes: { body: string; author: string; at: string }[];
  assessments: {
    category: string;
    level: string | null;
    score?: number | null;
    goal?: string | null;
    recommendedDrill?: string | null;
    notes?: string | null;
    at?: string;
    nextAt?: string | null;
  }[];
  achievements: { code: string; name: string; earnedAt: string }[];
  recentXp: { delta: number; reason: string; at: string }[];
  games: {
    name: string;
    score: number;
    xpAwarded: number;
    classTitle: string;
    at: string;
  }[];
};

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
  const [nextReview, setNextReview] = useState("");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xpCode, setXpCode] = useState("coach.choice");
  const [search, setSearch] = useState("");
  const [card, setCard] = useState<AthleteCard | null>(null);

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
    setNextReview("");
    setCard(null);
    try {
      const [notesRes, cardRes] = await Promise.all([
        get<{ notes: Note[] }>(
          `/api/v1/coach/athletes/${row.userId}/notes?limit=3`,
        ),
        get<AthleteCard>(`/api/v1/coach/athletes/${row.userId}/card`),
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
        nextAt: nextReview
          ? new Date(`${nextReview}T12:00:00`).toISOString()
          : undefined,
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

  const filteredRoster = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roster;
    return roster.filter((athlete) =>
      [athlete.name, athlete.email, athlete.rank, athlete.skillLevel]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [roster, search]);

  const selectedAssessment = card?.assessments.find(
    (item) => item.category === category,
  );
  const ratedSkills = card
    ? SKILL_CATS.filter((skill) =>
        card.assessments.some((item) => item.category === skill),
      ).length
    : 0;
  const averageSkill = card
    ? (() => {
        const latest = SKILL_CATS.map((skill) =>
          card.assessments.find((item) => item.category === skill),
        ).filter((item): item is NonNullable<typeof item> => Boolean(item));
        return latest.length
          ? (
              latest.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              latest.length
            ).toFixed(1)
          : "—";
      })()
    : "—";

  return (
    <main className={`${styles.main} ${rosterStyles.rosterMain}`}>
      <header className={rosterStyles.rosterHeader}>
        <div>
          <p className={styles.eyebrow}>ATHLETE DEVELOPMENT</p>
          <h1 className={styles.title}>Roster &amp; Boxing Cards</h1>
          <p className={styles.copy}>
            See who is ready, capture what changed, and give every athlete a
            clear next step.
          </p>
        </div>
        <nav className={rosterStyles.rosterNav} aria-label="Coach navigation">
          <Link href="/coach">Coach home</Link>
          <Link href="/coach/builder">Builder</Link>
          {activeId ? (
            <Link className={rosterStyles.liveLink} href={`/coach/live/${activeId}`}>
              Open Live Mode →
            </Link>
          ) : null}
        </nav>
      </header>

      <section className={rosterStyles.sessionRail} aria-label="Today's classes">
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
      </section>

      <section className={rosterStyles.rosterPulse} aria-label="Roster status">
        <div>
          <strong>{counts.checkedIn}</strong>
          <span>In the gym</span>
        </div>
        <div>
          <strong>{counts.booked}</strong>
          <span>Booked</span>
        </div>
        <div className={counts.late ? rosterStyles.pulseAttention : ""}>
          <strong>{counts.late}</strong>
          <span>Late</span>
        </div>
        <div className={counts.noShow ? rosterStyles.pulseAttention : ""}>
          <strong>{counts.noShow}</strong>
          <span>No-show</span>
        </div>
      </section>

      <div className={rosterStyles.rosterToolbar}>
        <label className={rosterStyles.searchField}>
          <span>Find an athlete</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, rank or skill…"
          />
        </label>
        <details className={rosterStyles.finalizeTools}>
          <summary>Attendance tools</summary>
          <label className={styles.field}>
            <span>Void reason</span>
            <input
              className={styles.input}
              value={voidReason}
              onChange={(event) => setVoidReason(event.target.value)}
            />
          </label>
          <Button type="button" disabled={busy || !activeId} onClick={finalize}>
            Finalize no-shows
          </Button>
        </details>
      </div>

      <div aria-live="polite">
        {message ? <p className={rosterStyles.successMessage}>{message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>

      <ul className={rosterStyles.athleteList}>
        {filteredRoster.map((r) => (
          <li
            key={r.userId}
            className={`${rosterStyles.athleteRow} ${
              r.late ? rosterStyles.athleteLate : ""
            } ${r.voided ? rosterStyles.athleteVoided : ""}`}
          >
            <div className={rosterStyles.athleteIdentity}>
              <span className={rosterStyles.athleteAvatar}>
                {r.initials ?? r.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{r.name}</strong>
                <span>{r.email}</span>
              </div>
            </div>
            <div className={rosterStyles.athleteProgress}>
              <span className={rosterStyles.attendanceChip}>
                {r.voided
                  ? "Voided"
                  : r.noShow
                    ? "No-show"
                    : r.checkedIn
                      ? "In gym"
                      : "Booked"}
              </span>
              <strong>{r.rank ?? "Rookie"} · L{r.level ?? 1}</strong>
              <span>
                {r.xp ?? 0} XP
                {r.streak && r.streak >= 3 ? ` · ${r.streak}d streak` : ""}
              </span>
            </div>
            <div className={rosterStyles.coachRead}>
              <span>{r.skillLevel ?? "No skill rating yet"}</span>
              <p>{r.lastNote ? `“${r.lastNote}”` : "Open the card to add a coach note."}</p>
            </div>
            <div className={rosterStyles.athleteActions}>
              {!r.checkedIn && !r.voided && !r.noShow ? (
                <button
                  type="button"
                  className={rosterStyles.presentButton}
                  disabled={busy}
                  onClick={() => void markPresent(r.userId)}
                >
                  Present
                </button>
              ) : null}
              <button
                type="button"
                className={rosterStyles.cardButton}
                disabled={busy}
                onClick={() => void openAthlete(r)}
              >
                Open Boxing Card
              </button>
              {r.attendanceId && r.checkedIn ? (
                <button
                  type="button"
                  className={rosterStyles.voidButton}
                  disabled={busy}
                  onClick={() => void voidCheckIn(r.attendanceId!)}
                >
                  Void
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {filteredRoster.length === 0 ? (
          <li className={rosterStyles.emptyRoster}>
            <span>
              {roster.length === 0
                ? "No bookings for this session."
                : "No athletes match that search."}
            </span>
          </li>
        ) : null}
      </ul>

      {drawerUser ? (
        <section className={rosterStyles.boxingCard}>
          <header className={rosterStyles.cardHeader}>
            <div className={rosterStyles.cardIdentity}>
              <span>{drawerUser.initials ?? drawerUser.name.slice(0, 2)}</span>
              <div>
                <p className={styles.eyebrow}>SULLY&apos;S BOXING CARD</p>
                <h2>{drawerUser.name}</h2>
                <small>
                  Athlete since{" "}
                  {card
                    ? new Date(card.athlete.joinedAt).toLocaleDateString([], {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </small>
              </div>
            </div>
            <button type="button" onClick={() => setDrawerUser(null)}>
              Close ×
            </button>
          </header>

          {card ? (
            <>
              <div className={rosterStyles.rankBanner}>
                <div>
                  <span>Current rank</span>
                  <strong>{card.progression.rank}</strong>
                </div>
                <div>
                  <span>Level</span>
                  <strong>{card.progression.level}</strong>
                </div>
                <div>
                  <span>Total XP</span>
                  <strong>{card.progression.xp}</strong>
                </div>
                <div className={rosterStyles.levelProgress}>
                  <span>Next level</span>
                  <div aria-hidden>
                    <i
                      style={{
                        width: `${card.progression.progressPct ?? 0}%`,
                      }}
                    />
                  </div>
                  <small>
                    {card.progression.xpToNextLevel ?? 0} XP to go
                  </small>
                </div>
                <div className={rosterStyles.developmentRead}>
                  <span>Development read</span>
                  <strong>{averageSkill}<small>/5</small></strong>
                  <small>{ratedSkills} of {SKILL_CATS.length} skills rated</small>
                </div>
              </div>

              <div className={rosterStyles.skillMatrix}>
                {SKILL_CATS.map((skill) => {
                  const assessment = card.assessments.find(
                    (item) => item.category === skill,
                  );
                  const levelIndex = Math.max(
                    0,
                    LEVELS.indexOf(assessment?.level ?? "LEARNING"),
                  );
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={
                        category === skill ? rosterStyles.skillSelected : ""
                      }
                      onClick={() => {
                        setCategory(skill);
                        setLevel(assessment?.level ?? "DEVELOPING");
                        setGoal(assessment?.goal ?? "");
                        setDrill(assessment?.recommendedDrill ?? "");
                        setNextReview(
                          assessment?.nextAt
                            ? assessment.nextAt.slice(0, 10)
                            : "",
                        );
                      }}
                    >
                      <span>{skill}</span>
                      <div aria-hidden>
                        {LEVELS.map((skillLevel, index) => (
                          <i
                            key={skillLevel}
                            className={
                              index <= levelIndex ? rosterStyles.skillActive : ""
                            }
                          />
                        ))}
                      </div>
                      <strong>{assessment?.level ?? "Not rated"}</strong>
                    </button>
                  );
                })}
              </div>

              <section className={rosterStyles.skillFocus}>
                <div>
                  <p className={styles.eyebrow}>ACTIVE DEVELOPMENT FOCUS</p>
                  <h3>{category}</h3>
                  <span>
                    {selectedAssessment?.level
                      ? `${selectedAssessment.level} · last reviewed ${
                          selectedAssessment.at
                            ? new Date(selectedAssessment.at).toLocaleDateString()
                            : "recently"
                        }`
                      : "No formal assessment yet"}
                  </span>
                </div>
                <div>
                  <span>Current goal</span>
                  <strong>
                    {selectedAssessment?.goal ?? "Set the athlete’s next target"}
                  </strong>
                </div>
                <div>
                  <span>Coach prescription</span>
                  <strong>
                    {selectedAssessment?.recommendedDrill ??
                      "Add a recommended drill"}
                  </strong>
                </div>
              </section>

              <div className={rosterStyles.cardColumns}>
                <div className={rosterStyles.assessmentPanel}>
                  <div className={rosterStyles.cardSectionHeading}>
                    <div>
                      <p className={styles.eyebrow}>COACH ASSESSMENT</p>
                      <h3>Capture today&apos;s progress</h3>
                    </div>
                    <span>Saved to athlete history</span>
                  </div>
                  <div className={rosterStyles.assessmentPair}>
                    <label className={styles.field}>
                      <span>Skill</span>
                      <select
                        className={styles.input}
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                      >
                        {SKILL_CATS.map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Level</span>
                      <select
                        className={styles.input}
                        value={level}
                        onChange={(event) => setLevel(event.target.value)}
                      >
                        {LEVELS.map((skillLevel) => (
                          <option key={skillLevel} value={skillLevel}>
                            {skillLevel}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className={styles.field}>
                    <span>Coach note</span>
                    <textarea
                      className={`${styles.input} ${rosterStyles.noteInput}`}
                      rows={3}
                      value={noteBody}
                      onChange={(event) => setNoteBody(event.target.value)}
                      placeholder="What changed today?"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Next goal</span>
                    <input
                      className={styles.input}
                      value={goal}
                      onChange={(event) => setGoal(event.target.value)}
                      placeholder="Example: Keep the rear heel light"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Recommended drill</span>
                    <input
                      className={styles.input}
                      value={drill}
                      onChange={(event) => setDrill(event.target.value)}
                      placeholder="Example: Mirror footwork, 3 × 2 min"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Review again</span>
                    <input
                      className={styles.input}
                      type="date"
                      value={nextReview}
                      onChange={(event) => setNextReview(event.target.value)}
                    />
                  </label>
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveAssessment()}
                  >
                    Save to Boxing Card
                  </Button>
                </div>

                <div className={rosterStyles.recognitionPanel}>
                  <div className={rosterStyles.cardSectionHeading}>
                    <div>
                      <p className={styles.eyebrow}>RECOGNITION</p>
                      <h3>Reward the work</h3>
                    </div>
                  </div>
                  <label className={styles.field}>
                    <span>XP reason</span>
                    <select
                      className={styles.input}
                      value={xpCode}
                      onChange={(event) => setXpCode(event.target.value)}
                    >
                      {XP_CODES.map((code) => (
                        <option key={code} value={code}>
                          {code.replace(".", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="button" disabled={busy} onClick={() => void awardXp()}>
                    Award XP
                  </Button>
                  <label className={styles.field}>
                    <span>Achievement</span>
                    <select
                      className={styles.input}
                      defaultValue=""
                      onChange={(event) => {
                        if (event.target.value) void grantBadge(event.target.value);
                        event.target.value = "";
                      }}
                    >
                      <option value="">Give achievement…</option>
                      {badges.map((badge) => (
                        <option key={badge.code} value={badge.code}>
                          {badge.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className={rosterStyles.achievementShelf}>
                    {card.achievements.slice(0, 4).map((achievement) => (
                      <span key={achievement.code}>{achievement.name}</span>
                    ))}
                    {card.achievements.length === 0 ? (
                      <p>No achievements yet—watch for the next breakthrough.</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={rosterStyles.cardHistory}>
                <section>
                  <h3>Coach notes</h3>
                  <ul>
                    {notes.map((note) => (
                      <li key={note.id}>
                        <span>
                          {note.author} ·{" "}
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <strong>{note.body}</strong>
                      </li>
                    ))}
                    {notes.length === 0 ? <li>No coach notes yet.</li> : null}
                  </ul>
                </section>
                <section>
                  <h3>Recent momentum</h3>
                  <ul>
                    {card.recentXp.slice(0, 4).map((entry, index) => (
                      <li key={`${entry.at}-${index}`}>
                        <span>{new Date(entry.at).toLocaleDateString()}</span>
                        <strong>
                          +{entry.delta} XP · {entry.reason}
                        </strong>
                      </li>
                    ))}
                    {card.recentXp.length === 0 ? <li>No XP history yet.</li> : null}
                  </ul>
                </section>
                <section>
                  <h3>Game performance</h3>
                  <ul>
                    {card.games.slice(0, 4).map((game, index) => (
                      <li key={`${game.at}-${game.name}-${index}`}>
                        <span>
                          {game.classTitle} ·{" "}
                          {new Date(game.at).toLocaleDateString()}
                        </span>
                        <strong>
                          {game.name} · {game.score} pts · +{game.xpAwarded} XP
                        </strong>
                      </li>
                    ))}
                    {card.games.length === 0 ? (
                      <li>No game results yet.</li>
                    ) : null}
                  </ul>
                </section>
              </div>
            </>
          ) : (
            <p className={rosterStyles.cardLoading}>Loading Boxing Card…</p>
          )}
        </section>
      ) : null}
    </main>
  );
}
