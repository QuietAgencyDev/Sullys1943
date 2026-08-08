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
};

type Payload = {
  session: { id: string; title: string; checkedIn: number; booked: number };
  live: Live;
};

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function AppCoachLivePage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    setData(await get<Payload>(`/api/v1/coach/sessions/${sessionId}/live`));
  }, [sessionId]);

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Failed"),
    );
    const t = setInterval(() => void load().catch(() => undefined), 2000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

  async function run(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      await post(`/api/v1/coach/sessions/${sessionId}/live/${action}`, body);
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
    <div className={styles.wrap}>
      <p>
        <Link href="/app/coach">← Coach</Link>
      </p>
      <p className={styles.eyebrow}>LIVE · PHONE</p>
      <h1 className={styles.title}>{data?.session.title ?? "Class"}</h1>
      {error ? <p className={styles.error}>{error}</p> : null}
      {live ? (
        <>
          <p className={styles.phase}>
            {live.phase.toUpperCase()} · R{live.round}/{live.totalRounds}
            {live.status === "paused" ? " · PAUSED" : ""}
          </p>
          <p className={styles.timer}>{formatCountdown(secondsLeft)}</p>
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
            <button type="button" disabled={busy} onClick={() => void run("rest")}>
              REST
            </button>
            <button type="button" disabled={busy} onClick={() => void run("finish")}>
              FINISH
            </button>
          </div>
          <p className={styles.phase} style={{ marginTop: "1rem" }}>
            TV · {live.tvMode ?? "timer"}
          </p>
          <div className={styles.controls}>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run("tv", { tvMode: "timer" })}
            >
              TIMER
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run("tv", { tvMode: "leaderboard" })}
            >
              BOARD
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run("tv", {
                  tvMode: "announcement",
                  tvMessage: "Eyes up — listen in",
                })
              }
            >
              ANNOUNCE
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
