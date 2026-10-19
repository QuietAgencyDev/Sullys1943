"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, get, post } from "@/lib/api";
import {
  playRoundBell,
  playTenSecondWarning,
  testBoxingTimerSound,
} from "@/lib/boxing-timer-sounds";
import styles from "../../coach.module.css";

type Live = {
  status: string;
  phase: string;
  round: number;
  totalRounds: number;
  workSec: number;
  restSec: number;
  secondsLeft: number;
  phaseEndsAt?: string | null;
  pausedRemainSec?: number | null;
  syncedToCoach: boolean;
  tvMode: string;
  tvMessage?: string | null;
  updatedAt?: string;
  kidsMode?: boolean;
  workout?: {
    current: { title: string; phase: string; notes: string } | null;
    next: { title: string; phase: string; notes: string } | null;
    templateName: string | null;
  };
};

type Payload = {
  session: {
    id: string;
    title: string;
    program: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    booked: number;
    checkedIn: number;
    coachName: string | null;
    kidsMode?: boolean;
  };
  live: Live;
  xpAvailable?: { classComplete: number };
};

type RosterRow = {
  userId: string;
  name: string;
  initials?: string;
  checkedIn: boolean;
  voided: boolean;
  noShow: boolean;
  xp?: number;
  level?: number;
  chips?: { new?: boolean; late?: boolean; streak?: number };
};

type GameState = {
  id: string;
  name: string;
  slug: string;
  xpWin: number;
  scores: { userId: string; name: string; score: number }[];
} | null;

type Team = {
  id: string;
  name: string;
  color: string;
  points: number;
  rank: number;
  members: { userId: string; name: string }[];
};

type Challenge = {
  id: string;
  name: string;
  type: string;
  status: string;
  winnerLabel?: string | null;
};

type Completion = {
  attendance: number;
  xpAwarded: number;
  challenges: { name: string; winnerLabel: string | null }[];
  teams: { name: string; color: string; points: number }[];
};

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function floorTvHref() {
  if (typeof window === "undefined") return "https://www.sullys1943.com/tv/floor";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3000/tv/floor";
  }
  return "https://www.sullys1943.com/tv/floor";
}

export default function LiveClassPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const [data, setData] = useState<Payload | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [game, setGame] = useState<GameState>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [templates, setTemplates] = useState<
    { id: string; name: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [announce, setAnnounce] = useState("Stay sharp — eyes up.");
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [workSec, setWorkSec] = useState(180);
  const [restSec, setRestSec] = useState(60);
  const [rounds, setRounds] = useState(12);
  const [soundReady, setSoundReady] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [syncFailures, setSyncFailures] = useState(0);
  const [online, setOnline] = useState(true);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const warnedPhaseRef = useRef<string | null>(null);
  const bellPhaseRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await get<Payload>(
        `/api/v1/coach/sessions/${sessionId}/live`,
      );
      setData(res);
      setWorkSec(res.live.workSec);
      setRestSec(res.live.restSec);
      setRounds(res.live.totalRounds);
      setLastSyncAt(new Date());
      setSyncFailures(0);
    } catch (err) {
      setSyncFailures((count) => count + 1);
      throw err;
    }
  }, [sessionId]);

  const loadRoster = useCallback(async () => {
    const res = await get<{ roster: RosterRow[] }>(
      `/api/v1/coach/sessions/${sessionId}/roster`,
    );
    setRoster(res.roster);
  }, [sessionId]);

  const loadGame = useCallback(async () => {
    const res = await get<{ game: GameState }>(
      `/api/v1/coach/sessions/${sessionId}/games/active`,
    );
    setGame(res.game);
  }, [sessionId]);

  const loadTeams = useCallback(async () => {
    const res = await get<{ teams: Team[] }>(
      `/api/v1/coach/sessions/${sessionId}/teams`,
    );
    setTeams(res.teams);
  }, [sessionId]);

  const loadChallenges = useCallback(async () => {
    const res = await get<{ challenges: Challenge[] }>(
      `/api/v1/coach/sessions/${sessionId}/challenges`,
    );
    setChallenges(res.challenges);
  }, [sessionId]);

  useEffect(() => {
    get<{ templates: { id: string; name: string }[] }>(
      "/api/v1/coach/workouts/templates",
    )
      .then((r) => setTemplates(r.templates))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      load(),
      loadRoster(),
      loadGame(),
      loadTeams(),
      loadChallenges(),
    ])
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Load failed");
        }
      });
    const livePoll = setInterval(() => {
      load().catch(() => undefined);
    }, 750);
    const contextPoll = setInterval(() => {
      loadRoster().catch(() => undefined);
      loadGame().catch(() => undefined);
      loadTeams().catch(() => undefined);
      loadChallenges().catch(() => undefined);
    }, 3000);
    const recover = () => {
      setOnline(navigator.onLine);
      if (document.visibilityState === "visible" && navigator.onLine) {
        load().catch(() => undefined);
      }
    };
    setOnline(navigator.onLine);
    window.addEventListener("online", recover);
    window.addEventListener("offline", recover);
    document.addEventListener("visibilitychange", recover);
    return () => {
      cancelled = true;
      clearInterval(livePoll);
      clearInterval(contextPoll);
      window.removeEventListener("online", recover);
      window.removeEventListener("offline", recover);
      document.removeEventListener("visibilitychange", recover);
    };
  }, [load, loadRoster, loadGame, loadTeams, loadChallenges]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

  // Mirror floor TV cues on coach device (after sound unlock)
  useEffect(() => {
    if (!soundReady || !data?.live) return;
    const liveState = data.live;
    if (liveState.status !== "running") return;
    let left = liveState.secondsLeft;
    if (liveState.phaseEndsAt) {
      left = Math.max(
        0,
        Math.ceil(
          (new Date(liveState.phaseEndsAt).getTime() - now.getTime()) / 1000,
        ),
      );
    }
    const phaseKey = `${sessionId}:${liveState.phase}:${liveState.round}:${liveState.phaseEndsAt ?? ""}`;
    if (left <= 10 && left > 0 && warnedPhaseRef.current !== phaseKey) {
      warnedPhaseRef.current = phaseKey;
      playTenSecondWarning();
    }
    if (left <= 0 && bellPhaseRef.current !== phaseKey) {
      bellPhaseRef.current = phaseKey;
      playRoundBell();
    }
  }, [soundReady, data?.live, now, sessionId]);

  async function run(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{
        live: Live;
        xpAwarded?: number;
        completion?: Completion | null;
      }>(`/api/v1/coach/sessions/${sessionId}/live/${action}`, body);
      setData((prev) => (prev ? { ...prev, live: res.live } : prev));
      if (action === "finish") {
        setCompletion(res.completion ?? null);
        setMessage(
          `Class complete · ${res.xpAwarded ?? 0} XP awarded`,
        );
      } else if (action === "start") {
        setMessage("Timer started — floor TV follows coach");
        setCompletion(null);
      } else if (action === "reset") {
        setMessage("Timer reset — Round 1 · full work · paused");
      } else if (action === "stop") {
        setMessage("Timer stopped");
      } else if (action === "config") {
        setMessage(
          `Timing saved · ${Number(body.workSec ?? workSec)}s / ${Number(body.restSec ?? restSec)}s · ${Number(body.totalRounds ?? rounds)} rounds`,
        );
      } else if (action === "tv") {
        setMessage(`TV → ${String(body.tvMode ?? "timer")}`);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function enableCoachSound() {
    const ok = await testBoxingTimerSound();
    setSoundReady(ok);
    if (ok) setMessage("Coach sound on — clap at 10s on this device too");
  }

  async function applyDemoPreset() {
    setWorkSec(45);
    setRestSec(15);
    setRounds(3);
    await run("config", { workSec: 45, restSec: 15, totalRounds: 3 });
  }

  async function markPresent(userId: string) {
    setBusy(true);
    try {
      await post(
        `/api/v1/coach/sessions/${sessionId}/roster/${userId}/present`,
      );
      await loadRoster();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Present failed");
    } finally {
      setBusy(false);
    }
  }

  async function startBagBattle() {
    setBusy(true);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/games/start`, {
        slug: "bag-battle",
      });
      setMessage("Bag Battle started");
      await loadGame();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Game start failed");
    } finally {
      setBusy(false);
    }
  }

  async function bumpScore(userId: string, delta: number) {
    if (!game) return;
    const current =
      game.scores.find((s) => s.userId === userId)?.score ?? 0;
    setBusy(true);
    try {
      await post(
        `/api/v1/coach/sessions/${sessionId}/games/${game.id}/score`,
        { userId, score: Math.max(0, current + delta) },
      );
      await loadGame();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Score failed");
    } finally {
      setBusy(false);
    }
  }

  async function finishGame() {
    if (!game) return;
    setBusy(true);
    try {
      const res = await post<{ xpAwarded?: number }>(
        `/api/v1/coach/sessions/${sessionId}/games/${game.id}/finish`,
      );
      setMessage(`Bag Battle finished · ${res.xpAwarded ?? 0} XP`);
      await loadGame();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Finish game failed");
    } finally {
      setBusy(false);
    }
  }

  async function setupTeams() {
    setBusy(true);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/teams`, {});
      setMessage("Teams set — TV on teams");
      await loadTeams();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Teams failed");
    } finally {
      setBusy(false);
    }
  }

  async function bumpTeam(teamId: string, delta: number) {
    setBusy(true);
    try {
      await post(
        `/api/v1/coach/sessions/${sessionId}/teams/${teamId}/points`,
        { delta },
      );
      await loadTeams();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Points failed");
    } finally {
      setBusy(false);
    }
  }

  async function startChallenge(type: string) {
    setBusy(true);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/challenges`, {
        type,
        name: type.replace(/_/g, " ").toUpperCase(),
      });
      setMessage("Challenge live on TV");
      await loadChallenges();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Challenge failed");
    } finally {
      setBusy(false);
    }
  }

  async function attachTemplate(templateId: string) {
    setBusy(true);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/workout`, {
        templateId,
      });
      setMessage("Workout attached");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Workout failed");
    } finally {
      setBusy(false);
    }
  }

  const live = data?.live;
  let secondsLeft = live?.secondsLeft ?? 0;
  if (live?.status === "paused") {
    secondsLeft = live.pausedRemainSec ?? live.secondsLeft;
  } else if (live?.status === "running" && live.phaseEndsAt) {
    secondsLeft = Math.max(
      0,
      Math.ceil((new Date(live.phaseEndsAt).getTime() - now.getTime()) / 1000),
    );
  }

  const phaseLabel =
    live?.phase === "rest"
      ? "Rest"
      : live?.phase === "warmup"
        ? "Warmup"
        : live?.phase === "cooldown"
          ? "Cooldown"
          : "Work";
  const phaseDuration = live?.phase === "rest" ? live.restSec : live?.workSec;
  const phaseProgress = phaseDuration
    ? Math.max(0, Math.min(100, (1 - secondsLeft / phaseDuration) * 100))
    : 0;
  const syncStale =
    !online ||
    syncFailures > 1 ||
    !lastSyncAt ||
    now.getTime() - lastSyncAt.getTime() > 5_000;

  return (
    <main className={styles.shell}>
      <nav className={styles.topNav} aria-label="Coach">
        <Link href="/coach">Home</Link>
        <Link href="/coach/roster">Roster</Link>
        <Link href="/coach/builder">Builder</Link>
        <Link href="/coach/messages">Messages</Link>
        <Link href="/">Staff hub</Link>
      </nav>

      <header className={styles.liveHeader}>
        <div>
          <p className={styles.eyebrow}>LIVE CLASS MODE</p>
          <h1 className={styles.title}>{data?.session.title ?? "Class"}</h1>
          <p className={styles.meta}>
            {data
              ? `${data.session.coachName ?? "Coach"} · ${
                  data.session.checkedIn
                }/${data.session.booked} checked in · +${
                  data.xpAvailable?.classComplete ?? 25
                } XP on finish`
              : "Loading class…"}
            {data?.session.kidsMode || live?.kidsMode ? " · KIDS MODE" : ""}
          </p>
        </div>
        <div
          className={`${styles.syncPill} ${
            syncStale ? styles.syncStale : styles.syncHealthy
          }`}
          role="status"
        >
          <span aria-hidden />
          <div>
            <strong>{syncStale ? "TV sync recovering" : "Floor TV synced"}</strong>
            <small>
              {!online
                ? "Device offline"
                : lastSyncAt
                  ? `Updated ${Math.max(
                      0,
                      Math.floor(
                        (now.getTime() - lastSyncAt.getTime()) / 1000,
                      ),
                    )}s ago`
                  : "Connecting…"}
            </small>
          </div>
        </div>
      </header>

      <div aria-live="polite">
        {error ? <p className={styles.error}>{error}</p> : null}
        {message ? (
          <p className={`${styles.ok} ${styles.toast}`}>{message}</p>
        ) : null}
      </div>

      {completion ? (
        <section className={`${styles.card} ${styles.celebrate}`}>
          <p className={styles.phase}>Class complete</p>
          <h2>
            {completion.attendance} athletes · {completion.xpAwarded} XP
          </h2>
          {completion.teams.length ? (
            <p className={styles.rowMeta}>
              Teams:{" "}
              {completion.teams
                .map((t) => `${t.name} ${t.points}`)
                .join(" · ")}
            </p>
          ) : null}
          {completion.challenges.length ? (
            <p className={styles.rowMeta}>
              Challenges:{" "}
              {completion.challenges.map((c) => c.name).join(", ")}
            </p>
          ) : null}
        </section>
      ) : null}

      {live ? (
        <section className={`${styles.card} ${styles.liveCard}`}>
          <div className={styles.liveStage}>
            <div
              className={`${styles.clockPanel} ${
                live.phase === "rest" ? styles.clockRest : styles.clockWork
              }`}
            >
              <p className={`${styles.phase} ${styles.roundFlash}`}>
                {live.status === "paused" ? "Paused · " : ""}
                {phaseLabel}
              </p>
              <p className={`${styles.timerHuge} ${styles.timerPulse}`}>
                {formatCountdown(secondsLeft)}
              </p>
              <div className={styles.phaseProgress} aria-hidden>
                <span style={{ width: `${phaseProgress}%` }} />
              </div>
              <div className={styles.roundMeta}>
                <strong>
                  Round {live.round} of {live.totalRounds}
                </strong>
                <span>
                  {live.workSec}s work · {live.restSec}s rest
                </span>
              </div>
            </div>

            <div className={styles.drillPanel}>
              <p className={styles.drillLabel}>Current drill</p>
              <h2>
                {live.workout?.current?.title ??
                  (live.status === "idle"
                    ? "Ready when you are"
                    : `${phaseLabel} round`)}
              </h2>
              <p className={styles.drillNotes}>
                {live.workout?.current?.notes ||
                  live.workout?.templateName ||
                  "Coach controls the room. Floor TV follows every change."}
              </p>
              <div className={styles.nextDrill}>
                <span>Next</span>
                <strong>{live.workout?.next?.title ?? "Next round"}</strong>
              </div>
              <div className={styles.classPulse}>
                <div>
                  <strong>{data?.session.checkedIn ?? 0}</strong>
                  <span>In gym</span>
                </div>
                <div>
                  <strong>{data?.session.booked ?? 0}</strong>
                  <span>Booked</span>
                </div>
                <div>
                  <strong>{(live.tvMode || "timer").replace(/_/g, " ")}</strong>
                  <span>On TV</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.demoBar}>
            <button
              type="button"
              disabled={busy}
              onClick={() => void applyDemoPreset()}
            >
              Demo preset · 45 / 15 / 3
            </button>
            <button type="button" onClick={() => void enableCoachSound()}>
              {soundReady ? "Sound on · test clap" : "Enable coach sound"}
            </button>
          </div>

          <div className={styles.commandDeck}>
            <div className={styles.timerPrimary}>
            {live.status === "idle" || live.status === "finished" ? (
              <button
                type="button"
                className={`${styles.primary} ${styles.heroControl}`}
                disabled={busy}
                onClick={() =>
                  void run("start", { workSec, restSec, totalRounds: rounds })
                }
              >
                <span>Start class</span>
                <small>Ring the opening bell</small>
              </button>
            ) : null}
            {live.status === "running" ? (
              <button
                type="button"
                className={`${styles.primary} ${styles.heroControl}`}
                disabled={busy}
                onClick={() => void run("pause")}
              >
                <span>Pause clock</span>
                <small>Hold the room</small>
              </button>
            ) : null}
            {live.status === "paused" ? (
              <button
                type="button"
                className={`${styles.primary} ${styles.heroControl}`}
                disabled={busy}
                onClick={() => void run("resume")}
              >
                <span>Resume class</span>
                <small>Continue this round</small>
              </button>
            ) : null}
            </div>

            <div className={styles.controlsLg}>
              <button
                type="button"
                disabled={busy || live.status === "idle"}
                onClick={() => void run("back")}
              >
                <span>←</span> Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run("round")}
              >
                Round
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run("rest")}
              >
                Rest
              </button>
              <button
                type="button"
                className={styles.nextControl}
                disabled={busy || live.status === "idle"}
                onClick={() => void run("next")}
              >
                Next <span>→</span>
              </button>
            </div>
          </div>

          <div className={styles.sessionActions}>
            <button
              type="button"
              disabled={
                busy || live.status === "idle" || live.status === "finished"
              }
              onClick={() => void run("reset")}
            >
              Reset timer
            </button>
            <button type="button" disabled={busy} onClick={() => void startChallenge("challenge")}>
              Launch challenge
            </button>
            <button type="button" disabled={busy} onClick={() => void setupTeams()}>
              Set up teams
            </button>
            {confirmFinish ? (
              <div className={styles.finishConfirm}>
                <span>Finish class and award XP?</span>
                <button
                  type="button"
                  className={styles.danger}
                  disabled={busy}
                  onClick={() => {
                    setConfirmFinish(false);
                    void run("finish");
                  }}
                >
                  Yes, finish
                </button>
                <button type="button" onClick={() => setConfirmFinish(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.finishButton}
                disabled={busy || live.status === "finished"}
                onClick={() => setConfirmFinish(true)}
              >
                Finish class
              </button>
            )}
          </div>

          <div className={styles.tvStrip}>
            <div className={styles.tvPreview}>
              <p className={styles.tvPreviewLabel}>What&apos;s on TV</p>
              <p className={styles.tvModeNow}>
                {(live.tvMode || "timer").replace(/_/g, " ").toUpperCase()}
              </p>
              <p className={styles.hint}>
                {live.tvMessage?.trim() ||
                  (live.tvMode === "timer" || !live.tvMode
                    ? "Round clock on floor"
                    : "Live to /tv/floor")}
              </p>
              <a
                className={styles.tvFloorLink}
                href={floorTvHref()}
                target="_blank"
                rel="noreferrer"
              >
                Open floor TV →
              </a>
            </div>
            <p className={styles.phase}>TV mode</p>
            <div className={styles.controls}>
              {(
                [
                  "timer",
                  "leaderboard",
                  "teams",
                  "challenge",
                  "announcement",
                  "achievement",
                  "class_complete",
                ] as const
              ).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={live.tvMode === mode ? styles.primary : undefined}
                  disabled={busy}
                  onClick={() =>
                    void run("tv", {
                      tvMode: mode,
                      tvMessage:
                        mode === "announcement"
                          ? announce
                          : mode === "achievement"
                            ? "Achievement unlocked"
                            : mode === "class_complete"
                              ? "XP awarded · see you next bell"
                              : undefined,
                    })
                  }
                >
                  {mode.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
            <p className={styles.phase}>Celebrations</p>
            <div className={styles.celebrateRow}>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() =>
                  void run("tv", {
                    tvMode: "achievement",
                    tvMessage: "Achievement unlocked",
                  })
                }
              >
                Show achievement
              </button>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() =>
                  void run("tv", {
                    tvMode: "xp_bonus",
                    tvMessage: "+50 XP BONUS",
                  })
                }
              >
                XP bonus
              </button>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() =>
                  void run("tv", {
                    tvMode: "class_complete",
                    tvMessage: "XP awarded · see you next bell",
                  })
                }
              >
                Class complete
              </button>
            </div>
            <label className={styles.hint}>
              Announcement
              <input
                value={announce}
                onChange={(e) => setAnnounce(e.target.value)}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.timingRow}>
            <label>
              Work (s)
              <input
                type="number"
                min={20}
                value={workSec}
                onChange={(e) => setWorkSec(Number(e.target.value) || 180)}
              />
            </label>
            <label>
              Rest (s)
              <input
                type="number"
                min={10}
                value={restSec}
                onChange={(e) => setRestSec(Number(e.target.value) || 60)}
              />
            </label>
            <label>
              Rounds
              <input
                type="number"
                min={1}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value) || 12)}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run("config", { workSec, restSec, totalRounds: rounds })
              }
            >
              Save timing
            </button>
          </div>

          {templates.length ? (
            <label className={styles.hint}>
              Class template
              <select
                className={styles.input}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) void attachTemplate(e.target.value);
                }}
              >
                <option value="">Attach workout…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </section>
      ) : null}

      <section className={`${styles.card} ${styles.rosterCard}`}>
        <div className={styles.rosterHeader}>
          <div>
            <p className={styles.eyebrow}>CLASS FLOOR</p>
            <h2>Roster</h2>
          </div>
          <p>
            <strong>{roster.filter((member) => member.checkedIn).length}</strong>
            <span>of {roster.length} present</span>
          </p>
        </div>
        <ul className={styles.list}>
          {roster.map((r) => (
            <li key={r.userId} className={styles.row}>
              <span className={styles.rowTitle}>
                <span className={styles.avatar}>{r.initials ?? "?"}</span>{" "}
                {r.name}
                {r.chips?.new ? " · NEW" : ""}
                {r.chips?.late ? " · LATE" : ""}
                {r.chips?.streak ? ` · ${r.chips.streak}d` : ""}
                {r.level != null ? ` · L${r.level}` : ""}
              </span>
              <span className={styles.rowMeta}>
                {r.checkedIn ? "In" : "Booked"}
                {!r.checkedIn && !r.voided && !r.noShow ? (
                  <>
                    {" · "}
                    <button
                      type="button"
                      disabled={busy}
                      className={styles.textBtn}
                      onClick={() => void markPresent(r.userId)}
                    >
                      Present
                    </button>
                  </>
                ) : null}
                {" · "}
                <Link href={`/coach/roster?athlete=${r.userId}`}>Card</Link>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className={`${styles.grid} ${styles.grid2}`} style={{ marginTop: "1rem" }}>
        <section className={styles.card}>
          <h2>Bag Battle</h2>
          {!game ? (
            <button
              type="button"
              className={styles.primary}
              disabled={busy}
              onClick={() => void startBagBattle()}
              style={{ width: "100%" }}
            >
              START BAG BATTLE
            </button>
          ) : (
            <>
              <p className={styles.hint}>
                {game.name} · winners +{game.xpWin} XP
              </p>
              <ul className={styles.list}>
                {roster
                  .filter((r) => r.checkedIn)
                  .map((r) => {
                    const score =
                      game.scores.find((s) => s.userId === r.userId)?.score ??
                      0;
                    return (
                      <li key={r.userId} className={styles.row}>
                        <span className={styles.rowTitle}>
                          {r.name} · {score}
                        </span>
                        <span className={styles.rowMeta}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void bumpScore(r.userId, 1)}
                          >
                            +1
                          </button>{" "}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void bumpScore(r.userId, 5)}
                          >
                            +5
                          </button>
                        </span>
                      </li>
                    );
                  })}
              </ul>
              <button
                type="button"
                className={styles.danger}
                disabled={busy}
                onClick={() => void finishGame()}
                style={{ width: "100%", marginTop: "0.75rem", minHeight: 48 }}
              >
                FINISH GAME
              </button>
            </>
          )}
        </section>

        <section className={styles.card}>
          <h2>Teams & challenges</h2>
          <div className={styles.controls}>
            <button type="button" disabled={busy} onClick={() => void setupTeams()}>
              Split teams
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startChallenge("team_battle")}
            >
              Team battle
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startChallenge("combo")}
            >
              Combo
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startChallenge("coachs_choice")}
            >
              Coach&apos;s choice
            </button>
          </div>
          <ul className={styles.list} style={{ marginTop: "0.75rem" }}>
            {teams.map((t) => (
              <li key={t.id} className={`${styles.row} ${styles.teamBump}`}>
                <span className={styles.rowTitle}>
                  {t.name} · {t.points} pts · #{t.rank}
                </span>
                <span className={styles.rowMeta}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void bumpTeam(t.id, 1)}
                  >
                    +1
                  </button>{" "}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void bumpTeam(t.id, 5)}
                  >
                    +5
                  </button>
                </span>
              </li>
            ))}
          </ul>
          {challenges.length ? (
            <ul className={styles.plainList}>
              {challenges.map((c) => (
                <li key={c.id}>
                  {c.name} · {c.status}
                  {c.winnerLabel ? ` · ${c.winnerLabel}` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <p className={styles.hint} style={{ marginTop: "1rem" }}>
        Open{" "}
        <a
          href={
            (process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "http://localhost:3000") +
            "/tv/floor"
          }
          target="_blank"
          rel="noreferrer"
        >
          /tv/floor
        </a>{" "}
        on the gym screen.
      </p>
    </main>
  );
}
