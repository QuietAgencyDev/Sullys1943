"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError, get, post } from "@/lib/api";
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

  const load = useCallback(async () => {
    const res = await get<Payload>(`/api/v1/coach/sessions/${sessionId}/live`);
    setData(res);
    setWorkSec(res.live.workSec);
    setRestSec(res.live.restSec);
    setRounds(res.live.totalRounds);
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
    const t = setInterval(() => {
      load().catch(() => undefined);
      loadRoster().catch(() => undefined);
      loadGame().catch(() => undefined);
      loadTeams().catch(() => undefined);
      loadChallenges().catch(() => undefined);
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [load, loadRoster, loadGame, loadTeams, loadChallenges]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

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

  return (
    <main className={styles.shell}>
      <nav className={styles.topNav} aria-label="Coach">
        <Link href="/coach">Home</Link>
        <Link href="/coach/roster">Roster</Link>
        <Link href="/coach/builder">Builder</Link>
        <Link href="/coach/messages">Messages</Link>
        <Link href="/">Staff hub</Link>
      </nav>

      <p className={styles.eyebrow}>LIVE CLASS MODE</p>
      <h1 className={styles.title}>{data?.session.title ?? "Class"}</h1>
      <p className={styles.meta}>
        {data
          ? `${data.session.coachName ?? "Coach"} · ${data.session.checkedIn}/${data.session.booked} in · +${data.xpAvailable?.classComplete ?? 25} XP on finish`
          : "Loading…"}
        {data?.session.kidsMode || live?.kidsMode ? " · KIDS MODE" : ""}
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={`${styles.ok} ${styles.toast}`}>{message}</p> : null}

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
          <p className={`${styles.phase} ${styles.roundFlash}`}>
            {live.status === "paused" ? "Paused · " : ""}
            {phaseLabel} · Round {live.round}/{live.totalRounds}
          </p>
          <p className={`${styles.timerHuge} ${styles.timerPulse}`}>
            {formatCountdown(secondsLeft)}
          </p>
          {live.workout?.current ? (
            <p className={styles.exerciseNow}>
              Now: {live.workout.current.title}
              {live.workout.next
                ? ` · Next: ${live.workout.next.title}`
                : ""}
            </p>
          ) : null}
          <p className={styles.hint}>
            {live.workSec}s work / {live.restSec}s rest · TV: {live.tvMode}
            {live.workout?.templateName
              ? ` · ${live.workout.templateName}`
              : ""}
          </p>

          <div className={styles.controlsLg}>
            {live.status === "idle" || live.status === "finished" ? (
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() =>
                  void run("start", { workSec, restSec, totalRounds: rounds })
                }
              >
                START
              </button>
            ) : null}
            {live.status === "running" ? (
              <button type="button" disabled={busy} onClick={() => void run("pause")}>
                PAUSE
              </button>
            ) : null}
            {live.status === "paused" ? (
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() => void run("resume")}
              >
                RESUME
              </button>
            ) : null}
            <button type="button" disabled={busy || live.status === "idle"} onClick={() => void run("next")}>
              NEXT
            </button>
            <button type="button" disabled={busy || live.status === "idle"} onClick={() => void run("back")}>
              BACK
            </button>
            <button type="button" disabled={busy} onClick={() => void run("round")}>
              ROUND
            </button>
            <button type="button" disabled={busy} onClick={() => void run("rest")}>
              REST
            </button>
            <button
              type="button"
              className={styles.danger}
              disabled={busy || live.status === "finished"}
              onClick={() => void run("finish")}
            >
              FINISH
            </button>
            <button type="button" disabled={busy} onClick={() => void startChallenge("challenge")}>
              CHALLENGE
            </button>
            <button type="button" disabled={busy} onClick={() => void run("tv", { tvMode: "leaderboard" })}>
              LEADERBOARD
            </button>
            <button type="button" disabled={busy} onClick={() => void setupTeams()}>
              TEAMS
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run("tv", { tvMode: "achievement", tvMessage: "Achievement unlocked" })
              }
            >
              ACHIEVEMENT
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run("tv", { tvMode: "announcement", tvMessage: announce })
              }
            >
              ANNOUNCEMENT
            </button>
          </div>

          <div className={styles.timingRow}>
            <label>
              Work (s)
              <input
                type="number"
                min={30}
                value={workSec}
                onChange={(e) => setWorkSec(Number(e.target.value) || 180)}
              />
            </label>
            <label>
              Rest (s)
              <input
                type="number"
                min={15}
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

          <p className={styles.phase} style={{ marginTop: "1rem" }}>
            Floor TV
          </p>
          <div className={styles.controls}>
            {(
              [
                "timer",
                "leaderboard",
                "teams",
                "challenge",
                "announcement",
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
                    tvMessage: mode === "announcement" ? announce : undefined,
                  })
                }
              >
                {mode.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <label className={styles.hint}>
            Announcement
            <input
              value={announce}
              onChange={(e) => setAnnounce(e.target.value)}
              className={styles.input}
            />
          </label>

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

      <section className={styles.card} style={{ marginTop: "1rem" }}>
        <h2>Roster</h2>
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
