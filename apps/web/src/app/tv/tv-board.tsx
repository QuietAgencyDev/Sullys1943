"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./tv.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type SessionCard = {
  id: string;
  title: string;
  program: string | null;
  coach: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  spotsLeft: number;
  phase: "upcoming" | "live" | "done";
  secondsToStart: number;
  secondsRemaining: number;
};

type CoachTimer = {
  sessionId: string;
  title: string;
  coach: string | null;
  status: string;
  phase: "work" | "rest" | string;
  round: number;
  totalRounds: number;
  workSec: number;
  restSec: number;
  secondsLeft: number;
  phaseEndsAt?: string | null;
  pausedRemainSec?: number | null;
  tvMode: string;
  tvMessage?: string | null;
  syncedToCoach: boolean;
};

type Board = {
  profile: "floor" | "reception";
  asOf: string;
  gym: { name: string; tagline: string; established: number };
  kpis: { checkInsToday: number; classesToday: number; spotsOpen: number };
  live: SessionCard | null;
  next: SessionCard | null;
  schedule: SessionCard[];
  leaderboard: {
    rank: number;
    displayName: string;
    xp: number;
    level: number;
    score?: number;
  }[];
  ticker: { name: string; at: string }[];
  manifesto: string[];
  refreshSeconds: number;
  coachTimer?: CoachTimer | null;
};

type RoundPhase = "work" | "rest";

type RoundState = {
  phase: RoundPhase;
  round: number;
  totalRounds: number | null;
  secondsLeft: number;
  secondsInPhase: number;
  progress: number;
  syncedToClass: boolean;
};

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function readTimerConfig() {
  if (typeof window === "undefined") {
    return { workSec: 180, restSec: 60, rounds: 12 };
  }
  const params = new URLSearchParams(window.location.search);
  const workSec = Math.max(30, Number(params.get("work")) || 180);
  const restSec = Math.max(15, Number(params.get("rest")) || 60);
  const rounds = Math.max(1, Number(params.get("rounds")) || 12);
  return { workSec, restSec, rounds };
}

/** Boxing-style interval timer — syncs to live class start, else wall-clock cycle. */
function computeRoundState(
  now: Date,
  live: SessionCard | null,
  workSec: number,
  restSec: number,
  configuredRounds: number,
): RoundState {
  const cycle = workSec + restSec;

  if (live?.phase === "live") {
    const start = new Date(live.startsAt).getTime();
    const end = new Date(live.endsAt).getTime();
    const elapsedMs = Math.max(0, now.getTime() - start);
    const classDurationSec = Math.max(1, Math.floor((end - start) / 1000));
    const totalRounds = Math.max(
      1,
      Math.min(configuredRounds, Math.ceil(classDurationSec / cycle)),
    );
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const cycleIndex = Math.floor(elapsedSec / cycle);
    const round = Math.min(totalRounds, cycleIndex + 1);
    const intoCycle = elapsedSec % cycle;
    const inWork = intoCycle < workSec;
    const secondsInPhase = inWork ? workSec : restSec;
    const secondsLeft = inWork
      ? workSec - intoCycle
      : restSec - (intoCycle - workSec);

    return {
      phase: inWork ? "work" : "rest",
      round,
      totalRounds,
      secondsLeft: Math.max(0, secondsLeft),
      secondsInPhase,
      progress: 1 - Math.max(0, secondsLeft) / secondsInPhase,
      syncedToClass: true,
    };
  }

  // Open-gym / between classes: shared wall-clock sync (all screens match)
  const epochSec = Math.floor(now.getTime() / 1000);
  const intoCycle = epochSec % cycle;
  const inWork = intoCycle < workSec;
  const secondsInPhase = inWork ? workSec : restSec;
  const secondsLeft = inWork
    ? workSec - intoCycle
    : restSec - (intoCycle - workSec);
  const round = Math.floor(epochSec / cycle) % configuredRounds || configuredRounds;

  return {
    phase: inWork ? "work" : "rest",
    round,
    totalRounds: configuredRounds,
    secondsLeft: Math.max(0, secondsLeft),
    secondsInPhase,
    progress: 1 - Math.max(0, secondsLeft) / secondsInPhase,
    syncedToClass: false,
  };
}

const CACHE_PREFIX = "sullys.tv.board.";

function cacheKey(profile: string) {
  return `${CACHE_PREFIX}${profile}`;
}

function readCachedBoard(profile: string): Board | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(profile));
    if (!raw) return null;
    return JSON.parse(raw) as Board;
  } catch {
    return null;
  }
}

function writeCachedBoard(profile: string, data: Board) {
  try {
    localStorage.setItem(cacheKey(profile), JSON.stringify(data));
  } catch {
    // quota / private mode — ignore
  }
}

export function TvBoard({ profile }: { profile: "floor" | "reception" }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [manifestoIndex, setManifestoIndex] = useState(0);
  const [offline, setOffline] = useState(false);
  const [timerCfg, setTimerCfg] = useState({
    workSec: 180,
    restSec: 60,
    rounds: 12,
  });

  useEffect(() => {
    setTimerCfg(readTimerConfig());
    const cached = readCachedBoard(profile);
    if (cached) setBoard(cached);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/tv/board?profile=${profile}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Board ${res.status}`);
        const data = (await res.json()) as Board;
        if (!cancelled) {
          setBoard(data);
          writeCachedBoard(profile, data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) {
          const cached = readCachedBoard(profile);
          if (cached) {
            setBoard(cached);
            setOffline(true);
          } else {
            setOffline(true);
          }
        }
      }
    }
    void load();
    // Faster poll so coach timer controls reach the floor TV quickly
    const poll = setInterval(load, profile === "floor" ? 3_000 : 15_000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [profile]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!board?.manifesto?.length) return;
    const swap = setInterval(() => {
      setManifestoIndex((i) => (i + 1) % board.manifesto.length);
    }, 5000);
    return () => clearInterval(swap);
  }, [board?.manifesto]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen();
        } else {
          void document.exitFullscreen();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focus = board?.live ?? board?.next ?? null;

  const classCountdown = useMemo(() => {
    if (!focus) return null;
    const target =
      focus.phase === "live"
        ? new Date(focus.endsAt).getTime()
        : new Date(focus.startsAt).getTime();
    return Math.max(0, Math.floor((target - now.getTime()) / 1000));
  }, [focus, now]);

  const round = useMemo(() => {
    const ct = board?.coachTimer;
    if (ct?.syncedToCoach) {
      const secondsInPhase = ct.phase === "work" ? ct.workSec : ct.restSec;
      let secondsLeft = ct.secondsLeft;
      if (ct.status === "paused") {
        secondsLeft = ct.pausedRemainSec ?? ct.secondsLeft;
      } else if (ct.status === "running" && ct.phaseEndsAt) {
        secondsLeft = Math.max(
          0,
          Math.ceil((new Date(ct.phaseEndsAt).getTime() - now.getTime()) / 1000),
        );
      }
      return {
        phase: (ct.phase === "rest" ? "rest" : "work") as RoundPhase,
        round: ct.round,
        totalRounds: ct.totalRounds,
        secondsLeft,
        secondsInPhase,
        progress: 1 - secondsLeft / Math.max(1, secondsInPhase),
        syncedToClass: true,
        coachControlled: true,
        paused: ct.status === "paused",
      };
    }
    return {
      ...computeRoundState(
        now,
        board?.live ?? null,
        timerCfg.workSec,
        timerCfg.restSec,
        timerCfg.rounds,
      ),
      coachControlled: false,
      paused: false,
    };
  }, [now, board?.live, board?.coachTimer, timerCfg]);

  const tickerItems = board?.ticker?.length
    ? [...board.ticker, ...board.ticker]
    : [];

  const tvMode = board?.coachTimer?.tvMode ?? "timer";
  const showAnnouncement =
    profile === "floor" && tvMode === "announcement" && board?.coachTimer;
  const showLeaderboardHero =
    profile === "floor" && tvMode === "leaderboard" && board?.coachTimer;
  const showRoundHero =
    !showAnnouncement &&
    !showLeaderboardHero &&
    (profile === "floor" || board?.live?.phase === "live");

  return (
    <div
      className={`${styles.shell} ${
        round.phase === "work" ? styles.phaseWork : styles.phaseRest
      }`}
      data-profile={profile}
    >
      {offline ? (
        <div className={styles.offlineBanner} role="status">
          Offline — showing last good board. Round timer keeps running.
        </div>
      ) : null}
      <header className={styles.top}>
        <div className={styles.brand}>
          <Image
            src="/brand/sullys-logo-primary.png"
            alt="Sully's"
            width={84}
            height={108}
            className={styles.logo}
            priority
          />
          <div className={styles.brandText}>
            <p className={styles.brandName}>SULLY&apos;S</p>
            <p className={styles.brandSub}>
              Boxing Gym · EST {board?.gym.established ?? 1943}
            </p>
            <p className={styles.profile}>
              {profile === "floor" ? "Training floor" : "Reception"}
            </p>
          </div>
        </div>
        <div className={styles.clockBlock}>
          <p className={styles.clock}>{formatClock(now)}</p>
          <p className={styles.date}>
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <div className={styles.main}>
        <section className={styles.hero} aria-live="polite">
          {showAnnouncement ? (
            <>
              <p className={styles.phase}>Coach announcement</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.tvMessage || "Eyes up — listen in"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.title}
                {board?.coachTimer?.coach
                  ? ` · Coach ${board.coachTimer.coach}`
                  : ""}
              </p>
            </>
          ) : null}
          {showLeaderboardHero ? (
            <>
              <p className={styles.phase}>Floor leaderboard</p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ?? "Claim the board"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.coach
                  ? `Coach ${board.coachTimer.coach}`
                  : "Sully's floor"}
                {" · coach controlled"}
              </p>
              <ul className={styles.boardList} style={{ marginTop: "1.25rem" }}>
                {(board?.leaderboard ?? []).slice(0, 6).map((row) => (
                  <li key={row.rank} className={styles.boardRow}>
                    <span>
                      <span className={styles.rank}>
                        {String(row.rank).padStart(2, "0")}
                      </span>
                      <strong>{row.displayName}</strong>
                    </span>
                    <span>
                      {row.score != null
                        ? `${row.score} pts`
                        : `${row.xp} XP · L${row.level}`}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {showRoundHero ? (
            <>
              <p className={styles.phase}>
                {round.phase === "work" ? "Work" : "Rest"}
                {" · "}
                Round {String(round.round).padStart(2, "0")}
                {round.totalRounds
                  ? ` / ${String(round.totalRounds).padStart(2, "0")}`
                  : ""}
              </p>
              <h1 className={styles.classTitle}>
                {board?.coachTimer?.title ?? focus?.title ?? "Open gym rounds"}
              </h1>
              <p className={styles.meta}>
                {board?.coachTimer?.coach
                  ? `Coach ${board.coachTimer.coach}`
                  : focus?.coach
                    ? `Coach ${focus.coach}`
                    : "Sully's floor"}
                {focus && !board?.coachTimer
                  ? ` · ${focus.booked}/${focus.capacity} · ${focus.spotsLeft} spots`
                  : ""}
                {round.paused ? " · PAUSED" : ""}
                {classCountdown !== null && focus?.phase === "live" && !board?.coachTimer
                  ? ` · class ${formatCountdown(classCountdown)}`
                  : focus?.phase === "upcoming" && classCountdown !== null
                    ? ` · starts ${formatCountdown(classCountdown)}`
                    : ""}
              </p>
              <p className={styles.timerLabel}>
                {round.phase === "work" ? "Round clock" : "Rest clock"}
                {round.coachControlled
                  ? " · coach controlled"
                  : round.syncedToClass
                    ? " · synced to class"
                    : " · open gym sync"}
              </p>
              <p className={styles.timer}>
                {formatCountdown(round.secondsLeft)}
              </p>
              <div
                className={styles.roundBar}
                role="progressbar"
                aria-valuenow={Math.round(round.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={styles.roundBarFill}
                  style={{ width: `${Math.min(100, round.progress * 100)}%` }}
                />
              </div>
              <p className={styles.roundMeta}>
                {Math.floor(timerCfg.workSec / 60)}:
                {String(timerCfg.workSec % 60).padStart(2, "0")} work
                {" · "}
                {Math.floor(timerCfg.restSec / 60)}:
                {String(timerCfg.restSec % 60).padStart(2, "0")} rest
              </p>
            </>
          ) : (
            <>
              <p className={styles.phase}>
                {focus?.phase === "live"
                  ? "Live now"
                  : focus
                    ? "Up next"
                    : "Open gym"}
              </p>
              <h1 className={styles.classTitle}>
                {focus?.title ?? "Train with purpose"}
              </h1>
              <p className={styles.meta}>
                {focus?.coach ? `Coach ${focus.coach}` : "Sully's floor"}
                {focus
                  ? ` · ${focus.booked}/${focus.capacity} · ${focus.spotsLeft} spots`
                  : ""}
              </p>
              {classCountdown !== null ? (
                <>
                  <p className={styles.timerLabel}>
                    {focus?.phase === "live"
                      ? "Class time remaining"
                      : "Starts in"}
                  </p>
                  <p className={styles.timer}>
                    {formatCountdown(classCountdown)}
                  </p>
                </>
              ) : (
                <p className={styles.meta}>Character before the bell.</p>
              )}
            </>
          )}
        </section>

        <aside className={styles.side}>
          {profile === "floor" ? (
            <div className={`${styles.panel} ${styles.roundPanel}`}>
              <p className={styles.panelTitle}>Round status</p>
              <p className={styles.roundStatusBig}>
                {round.phase === "work" ? "WORK" : "REST"}
              </p>
              <p className={styles.meta}>
                Round {round.round}
                {round.totalRounds ? ` of ${round.totalRounds}` : ""}
                {" · "}
                {formatCountdown(round.secondsLeft)} left
              </p>
            </div>
          ) : null}

          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.checkInsToday ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Check-ins</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.classesToday ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Classes</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiValue}>
                {board?.kpis.spotsOpen ?? "—"}
              </p>
              <p className={styles.kpiLabel}>Spots open</p>
            </div>
          </div>

          {profile === "floor" ? (
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Floor leaderboard</p>
              <ul className={styles.boardList}>
                {(board?.leaderboard ?? []).slice(0, 5).map((row) => (
                  <li key={row.rank} className={styles.boardRow}>
                    <span>
                      <span className={styles.rank}>
                        {String(row.rank).padStart(2, "0")}
                      </span>
                      <strong>{row.displayName}</strong>
                    </span>
                    <span>
                      {row.score != null
                        ? `${row.score} pts`
                        : `${row.xp} XP · L${row.level}`}
                    </span>
                  </li>
                ))}
                {!board?.leaderboard?.length ? (
                  <li className={styles.boardRow}>
                    <span>Train today — claim the board</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : (
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Today&apos;s schedule</p>
              <ul className={styles.boardList}>
                {(board?.schedule ?? []).slice(0, 6).map((s) => (
                  <li key={s.id} className={styles.boardRow}>
                    <span>
                      <strong>{s.title}</strong>
                    </span>
                    <span>
                      {new Date(s.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {s.spotsLeft} left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.panel}>
            <p className={styles.panelTitle}>Just checked in</p>
            <div className={styles.ticker}>
              <div className={styles.tickerTrack}>
                {tickerItems.length
                  ? tickerItems.map((t, i) => (
                      <span key={`${t.name}-${i}`}>
                        WELCOME {t.name.toUpperCase()}
                      </span>
                    ))
                  : [
                      <span key="empty">
                        LACE UP · SHOW RESPECT · BUILD CHARACTER
                      </span>,
                    ]}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className={styles.bottom}>
        <p className={styles.manifesto} key={manifestoIndex}>
          {board?.manifesto?.[manifestoIndex] ??
            "Boxing is the engine. People are the purpose. Character is the legacy."}
        </p>
        <p className={styles.hint}>Press F for fullscreen · Auto-refreshes</p>
      </footer>
    </div>
  );
}
