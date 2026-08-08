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
  };
  live: Live;
};

type RosterRow = {
  userId: string;
  name: string;
  checkedIn: boolean;
  voided: boolean;
  noShow: boolean;
  chips?: { new?: boolean; late?: boolean; streak?: number };
};

type GameState = {
  id: string;
  name: string;
  slug: string;
  xpWin: number;
  scores: { userId: string; name: string; score: number }[];
} | null;

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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [announce, setAnnounce] = useState("Stay sharp — eyes up.");

  const load = useCallback(async () => {
    const res = await get<Payload>(`/api/v1/coach/sessions/${sessionId}/live`);
    setData(res);
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

  useEffect(() => {
    let cancelled = false;
    Promise.all([load(), loadRoster(), loadGame()])
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
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [load, loadRoster, loadGame]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

  async function run(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ live: Live; xpAwarded?: number }>(
        `/api/v1/coach/sessions/${sessionId}/live/${action}`,
        body,
      );
      setData((prev) => (prev ? { ...prev, live: res.live } : prev));
      if (action === "finish" && res.xpAwarded) {
        setMessage(`Class finished · ${res.xpAwarded} XP awarded`);
      } else if (action === "start") {
        setMessage("Timer started — floor TV follows coach control");
      } else if (action === "tv") {
        setMessage(`TV mode → ${String(body.tvMode ?? "timer")}`);
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
    setError(null);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/games/start`, {
        slug: "bag-battle",
      });
      setMessage("Bag Battle started — TV on leaderboard");
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
    <main className={styles.shell}>
      <nav className={styles.topNav} aria-label="Coach">
        <Link href="/coach">Home</Link>
        <Link href={`/coach/roster`}>Roster</Link>
        <Link href="/coach/messages">Messages</Link>
        <Link href="/">Staff hub</Link>
      </nav>

      <p className={styles.eyebrow}>LIVE CLASS MODE</p>
      <h1 className={styles.title}>{data?.session.title ?? "Class"}</h1>
      <p className={styles.meta}>
        {data
          ? `${data.session.checkedIn}/${data.session.booked} checked in · ${data.session.program}`
          : "Loading…"}
        {" · "}
        Coach controls the round clock on the floor TV
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.ok}>{message}</p> : null}

      {live ? (
        <section className={styles.card}>
          <p className={styles.phase}>
            {live.status === "paused" ? "Paused · " : ""}
            {live.phase === "work" ? "Work" : "Rest"} · Round {live.round}/
            {live.totalRounds}
          </p>
          <p className={styles.timerHuge}>{formatCountdown(secondsLeft)}</p>
          <p className={styles.hint}>
            Status: {live.status}
            {live.syncedToCoach ? " · synced to TV" : ""}
            {" · TV: "}
            {live.tvMode}
          </p>

          <div className={styles.controls}>
            {live.status === "idle" || live.status === "finished" ? (
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() => void run("start")}
              >
                START
              </button>
            ) : null}
            {live.status === "running" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run("pause")}
              >
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
            <button
              type="button"
              disabled={busy || live.status === "idle"}
              onClick={() => void run("next")}
            >
              NEXT
            </button>
            <button
              type="button"
              disabled={busy || live.status === "idle"}
              onClick={() => void run("back")}
            >
              BACK
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run("round")}
            >
              ROUND
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run("rest")}
            >
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
          </div>

          <p className={styles.phase} style={{ marginTop: "1rem" }}>
            Floor TV mode
          </p>
          <div className={styles.controls}>
            <button
              type="button"
              className={live.tvMode === "timer" ? styles.primary : undefined}
              disabled={busy}
              onClick={() => void run("tv", { tvMode: "timer" })}
            >
              TIMER
            </button>
            <button
              type="button"
              className={
                live.tvMode === "leaderboard" ? styles.primary : undefined
              }
              disabled={busy}
              onClick={() => void run("tv", { tvMode: "leaderboard" })}
            >
              LEADERBOARD
            </button>
            <button
              type="button"
              className={
                live.tvMode === "announcement" ? styles.primary : undefined
              }
              disabled={busy}
              onClick={() =>
                void run("tv", {
                  tvMode: "announcement",
                  tvMessage: announce,
                })
              }
            >
              ANNOUNCE
            </button>
          </div>
          <label className={styles.hint}>
            Announcement text
            <input
              value={announce}
              onChange={(e) => setAnnounce(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: "0.35rem",
                padding: "0.55rem",
                background: "rgba(0,0,0,0.35)",
                border: "1px solid var(--border)",
                color: "inherit",
              }}
            />
          </label>
        </section>
      ) : null}

      <section className={styles.card} style={{ marginTop: "1rem" }}>
        <h2>Roster strip</h2>
        <p className={styles.hint}>One-tap present without leaving Live Mode</p>
        <ul className={styles.list}>
          {roster.map((r) => (
            <li key={r.userId} className={styles.row}>
              <span className={styles.rowTitle}>
                {r.name}
                {r.chips?.new ? " · NEW" : ""}
                {r.chips?.late ? " · LATE" : ""}
                {r.chips?.streak ? ` · ${r.chips.streak}d` : ""}
              </span>
              <span className={styles.rowMeta}>
                {r.checkedIn ? "In" : "Booked"}
                {!r.checkedIn && !r.voided && !r.noShow ? (
                  <>
                    {" · "}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void markPresent(r.userId)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--brand-red)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Present
                    </button>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.hint}>
          Full notes on <Link href="/coach/roster">Roster</Link>
        </p>
      </section>

      <section className={styles.card} style={{ marginTop: "1rem" }}>
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
              {game.name} active · winners get {game.xpWin} XP
            </p>
            <ul className={styles.list}>
              {roster
                .filter((r) => r.checkedIn)
                .map((r) => {
                  const score =
                    game.scores.find((s) => s.userId === r.userId)?.score ?? 0;
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
              FINISH GAME · AWARD XP
            </button>
          </>
        )}
      </section>

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
