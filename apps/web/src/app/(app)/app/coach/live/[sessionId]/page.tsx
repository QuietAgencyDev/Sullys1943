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
  secondsLeft: number;
  phaseEndsAt?: string | null;
  pausedRemainSec?: number | null;
  tvMode?: string;
  workout?: {
    current: { title: string } | null;
    next: { title: string } | null;
    templateName?: string | null;
  };
};

type Payload = {
  session: {
    id: string;
    title: string;
    checkedIn: number;
    booked: number;
    coachName?: string | null;
  };
  live: Live;
  xpAvailable?: { classComplete: number };
};

type RosterRow = {
  userId: string;
  name: string;
  checkedIn: boolean;
  voided: boolean;
  noShow: boolean;
};

type GameState = {
  id: string;
  name: string;
  xpWin: number;
  scores: { userId: string; name: string; score: number }[];
} | null;

type Team = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function AppCoachLivePage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const [data, setData] = useState<Payload | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [game, setGame] = useState<GameState>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    setData(await get<Payload>(`/api/v1/coach/sessions/${sessionId}/live`));
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

  useEffect(() => {
    Promise.all([load(), loadRoster(), loadGame(), loadTeams()]).catch(
      (err) => setError(err instanceof ApiError ? err.message : "Failed"),
    );
    const t = setInterval(() => {
      void load().catch(() => undefined);
      void loadRoster().catch(() => undefined);
      void loadGame().catch(() => undefined);
      void loadTeams().catch(() => undefined);
    }, 2000);
    return () => clearInterval(t);
  }, [load, loadRoster, loadGame, loadTeams]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

  async function run(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ xpAwarded?: number }>(
        `/api/v1/coach/sessions/${sessionId}/live/${action}`,
        body,
      );
      if (action === "finish") {
        setMessage(`Class complete · +${res.xpAwarded ?? 0} XP`);
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
      setError(err instanceof ApiError ? err.message : "Game failed");
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
      setMessage(`Bag Battle done · +${res.xpAwarded ?? 0} XP`);
      await loadGame();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Finish failed");
    } finally {
      setBusy(false);
    }
  }

  async function setupTeams() {
    setBusy(true);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/teams`, {});
      setMessage("Teams set");
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

  return (
    <div className={styles.wrap}>
      <p>
        <Link href="/app/coach">← Coach</Link>
      </p>
      <p className={styles.eyebrow}>LIVE · PHONE</p>
      <h1 className={styles.title}>{data?.session.title ?? "Class"}</h1>
      <p className={styles.meta}>
        {data
          ? `${data.session.checkedIn}/${data.session.booked} in · +${data.xpAvailable?.classComplete ?? 25} XP finish`
          : "Loading…"}
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.meta}>{message}</p> : null}
      {live ? (
        <>
          <p className={styles.phase}>
            {live.phase.toUpperCase()} · R{live.round}/{live.totalRounds}
            {live.status === "paused" ? " · PAUSED" : ""}
          </p>
          <p className={styles.timer}>{formatCountdown(secondsLeft)}</p>
          {live.workout?.current ? (
            <p className={styles.meta}>
              Now: {live.workout.current.title}
              {live.workout.next ? ` · Next: ${live.workout.next.title}` : ""}
            </p>
          ) : null}
          <div className={styles.controls}>
            {(live.status === "idle" || live.status === "finished") && (
              <button type="button" disabled={busy} onClick={() => void run("start")}>
                START
              </button>
            )}
            {live.status === "running" && (
              <button type="button" disabled={busy} onClick={() => void run("pause")}>
                PAUSE
              </button>
            )}
            {live.status === "paused" && (
              <button type="button" disabled={busy} onClick={() => void run("resume")}>
                RESUME
              </button>
            )}
            <button type="button" disabled={busy} onClick={() => void run("next")}>
              NEXT
            </button>
            <button type="button" disabled={busy} onClick={() => void run("back")}>
              BACK
            </button>
            <button type="button" disabled={busy} onClick={() => void run("round")}>
              ROUND
            </button>
            <button type="button" disabled={busy} onClick={() => void run("rest")}>
              REST
            </button>
            <button type="button" disabled={busy} onClick={() => void run("finish")}>
              FINISH
            </button>
            <button type="button" disabled={busy} onClick={() => void setupTeams()}>
              TEAMS
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run("tv", { tvMode: "leaderboard" })}
            >
              BOARD
            </button>
          </div>
        </>
      ) : null}

      <section style={{ marginTop: "1.25rem" }}>
        <p className={styles.phase}>Roster</p>
        <ul className={styles.list}>
          {roster.map((r) => (
            <li key={r.userId}>
              {r.name} · {r.checkedIn ? "In" : "Booked"}
              {!r.checkedIn && !r.voided && !r.noShow ? (
                <>
                  {" · "}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void markPresent(r.userId)}
                  >
                    Present
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "1.25rem" }}>
        <p className={styles.phase}>Bag Battle</p>
        {!game ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void startBagBattle()}
            style={{ width: "100%", minHeight: 48 }}
          >
            START BAG BATTLE
          </button>
        ) : (
          <>
            <p className={styles.meta}>
              {game.name} · winners +{game.xpWin} XP
            </p>
            <ul className={styles.list}>
              {roster
                .filter((r) => r.checkedIn)
                .map((r) => {
                  const score =
                    game.scores.find((s) => s.userId === r.userId)?.score ?? 0;
                  return (
                    <li key={r.userId}>
                      {r.name} · {score}{" "}
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
                    </li>
                  );
                })}
            </ul>
            <button
              type="button"
              disabled={busy}
              onClick={() => void finishGame()}
              style={{ width: "100%", minHeight: 48, marginTop: "0.5rem" }}
            >
              FINISH GAME
            </button>
          </>
        )}
      </section>

      {teams.length ? (
        <section style={{ marginTop: "1.25rem" }}>
          <p className={styles.phase}>Teams</p>
          <ul className={styles.list}>
            {teams.map((t) => (
              <li key={t.id}>
                {t.name} · {t.points} pts · #{t.rank}{" "}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void bumpTeam(t.id, 1)}
                >
                  +1
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
