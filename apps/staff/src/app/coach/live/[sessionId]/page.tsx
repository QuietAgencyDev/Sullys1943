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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    const res = await get<Payload>(`/api/v1/coach/sessions/${sessionId}/live`);
    setData(res);
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    load()
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
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

  async function run(action: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ live: Live; xpAwarded?: number }>(
        `/api/v1/coach/sessions/${sessionId}/live/${action}`,
        {},
      );
      setData((prev) =>
        prev ? { ...prev, live: res.live } : prev,
      );
      if (action === "finish" && res.xpAwarded) {
        setMessage(`Class finished · ${res.xpAwarded} XP awarded`);
      } else if (action === "start") {
        setMessage("Timer started — floor TV follows coach control");
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
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
            {" · "}
            {Math.floor(live.workSec / 60)}:
            {String(live.workSec % 60).padStart(2, "0")} work /{" "}
            {Math.floor(live.restSec / 60)}:
            {String(live.restSec % 60).padStart(2, "0")} rest
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
        </section>
      ) : null}

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
        on the gym screen — it shows “coach controlled” while you run the timer.
      </p>
    </main>
  );
}
