"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import { getMe } from "@/lib/auth-client";
import {
  createShadowTracker,
  cueFor,
  loadPoseLandmarker,
  READ_SECONDS,
} from "@/lib/shadow-pose";
import { judgeShadowRound, type ShadowCounts, type ShadowRead, type ShadowStance } from "@/lib/shadow-round";
import styles from "../ui.module.css";

type Eligibility = {
  allowed: boolean;
  needsAdultConfirm: boolean;
  reason: string | null;
};

type SavedRound = ShadowRead & {
  id?: string;
  stance: string;
  punches: number;
  jabs: number;
  crosses: number;
  hooks: number;
  uppercuts: number;
  coachStatus?: string;
  coachNote?: string | null;
  createdAt?: string;
  xpAwarded?: number;
  saved: boolean;
};

export default function ShadowRoundPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const landmarkerRef = useRef<Awaited<ReturnType<typeof loadPoseLandmarker>> | null>(null);
  const [modelTry, setModelTry] = useState(0);
  const [modelState, setModelState] = useState<"loading" | "ready" | "failed">("loading");
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [adult, setAdult] = useState(false);
  const [stance, setStance] = useState<ShadowStance>("orthodox");
  const [phase, setPhase] = useState<"setup" | "frame" | "live" | "result" | "practice">("setup");
  const [secondsLeft, setSecondsLeft] = useState(READ_SECONDS);
  const [cue, setCue] = useState(CUES_START);
  const [call, setCall] = useState("Waiting");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SavedRound | null>(null);
  const [history, setHistory] = useState<SavedRound[]>([]);
  const [practiceLeft, setPracticeLeft] = useState(180);
  const [liveCounts, setLiveCounts] = useState({ punches: 0, jabs: 0, crosses: 0, hooks: 0, uppercuts: 0 });
  const [flash, setFlash] = useState<string | null>(null);
  const seenCounts = useRef(liveCounts);
  const practiceBelled = useRef(false);

  useEffect(() => () => stopRef.current?.(), []);

  useEffect(() => {
    let cancelled = false;
    loadPoseLandmarker()
      .then((landmarker) => {
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setModelState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setModelState("failed");
        setError(err instanceof Error ? err.message : "The pose model did not load.");
      });
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [modelTry]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getMe().catch(() => null);
      if (cancelled) return;
      if (user?.role === "child") {
        setEligibility({
          allowed: false,
          needsAdultConfirm: false,
          reason: "Youth training stays with the coach on the floor.",
        });
        return;
      }
      const gate = await get<Eligibility>("/api/v1/shadow/eligibility").catch(
        (): Eligibility => ({
          allowed: true,
          needsAdultConfirm: true,
          reason: null,
        }),
      );
      if (cancelled) return;
      setEligibility(gate);
      await flushShadowRounds((body) =>
        post("/api/v1/shadow/rounds", body).then(() => undefined),
      );
      if (cancelled) return;
      const rows = await get<SavedRound[]>("/api/v1/shadow/rounds").catch(
        () => [] as SavedRound[],
      );
      if (!cancelled) setHistory(rows.map((row) => ({ ...row, saved: true })));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "practice") {
      practiceBelled.current = false;
      return;
    }
    if (practiceLeft === 0) {
      if (!practiceBelled.current) {
        practiceBelled.current = true;
        gymBell("end");
      }
      return;
    }
    const id = window.setInterval(() => {
      setPracticeLeft((left) => (left <= 1 ? 0 : left - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, practiceLeft]);

  async function start() {
    setError(null);
    if (eligibility && !eligibility.allowed) return;
    if (eligibility?.needsAdultConfirm && !adult) {
      setError("Confirm you are 18 or older. Youth rounds stay with the coach.");
      return;
    }
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker) {
      setError("The pose model is still loading. Wait until it says ready.");
      return;
    }
    setPhase("frame");
    setSecondsLeft(READ_SECONDS);
    setFlash(null);
    seenCounts.current = { punches: 0, jabs: 0, crosses: 0, hooks: 0, uppercuts: 0 };
    setLiveCounts(seenCounts.current);
    const tracker = createShadowTracker(stance);
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    let lastVideoTs = 0;
    let roundStart = 0;
    let lastUi = 0;
    let shownLeft = READ_SECONDS;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
      if (stopRef.current === stop) stopRef.current = null;
    };
    stopRef.current = stop;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      const tick = () => {
        if (stopped) return;
        if (video.readyState >= 2) {
          const ts = performance.now();
          if (ts > lastVideoTs) {
            lastVideoTs = ts;
            const pose = landmarker.detectForVideo(video, ts);
            tracker.sample(pose.landmarks?.[0], ts);
          }
        }
        if (!roundStart) {
          if (tracker.readyStreak() >= 12) {
            roundStart = performance.now();
            gymBell("start");
            gymTap(18);
            setPhase("live");
          } else if (performance.now() - lastUi > 250) {
            lastUi = performance.now();
            setCue(tracker.liveCue());
          }
          raf = requestAnimationFrame(tick);
          return;
        }
        const elapsed = (performance.now() - roundStart) / 1000;
        const left = Math.max(0, Math.ceil(READ_SECONDS - elapsed));
        const counts = tracker.counts();
        if (left !== shownLeft || performance.now() - lastUi > 250) {
          shownLeft = left;
          lastUi = performance.now();
          setSecondsLeft(left);
          setCue(cueFor(elapsed));
          setCall(tracker.lastPunch());
          const next = {
            punches: counts.punches,
            jabs: counts.jabs,
            crosses: counts.crosses,
            hooks: counts.hooks,
            uppercuts: counts.uppercuts,
          };
          const prev = seenCounts.current;
          const hit =
            next.jabs > prev.jabs
              ? "jab"
              : next.crosses > prev.crosses
                ? "cross"
                : next.hooks > prev.hooks
                  ? "hook"
                  : next.uppercuts > prev.uppercuts
                    ? "upper"
                    : null;
          seenCounts.current = next;
          setLiveCounts(next);
          if (hit) setFlash(`${hit}-${next.punches}`);
        }
        if (elapsed >= READ_SECONDS) {
          stop();
          if (counts.visibleFrames < 12) counts.engine = "timer-v1";
          void finish(counts);
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      stop();
      setPhase("setup");
      setError("The camera did not open. Allow the camera for this site, then try again.");
    }
  }

  async function finish(counts: ShadowCounts) {
    gymBell("end");
    gymTap([24, 40, 24]);
    const local = judgeShadowRound(counts);
    const draft: SavedRound = {
      ...local,
      stance: counts.stance,
      punches: counts.punches,
      jabs: counts.jabs,
      crosses: counts.crosses,
      hooks: counts.hooks,
      uppercuts: counts.uppercuts,
      saved: false,
    };
    try {
      const saved = await post<{ round: SavedRound; xpAwarded: number }>(
        "/api/v1/shadow/rounds",
        {
          ...counts,
          modelId: MODEL_ID,
          signals: signalContract(counts),
          adultConfirmed: adult || eligibility?.needsAdultConfirm === false,
        },
      );
      const round = { ...saved.round, saved: true, xpAwarded: saved.xpAwarded };
      setResult(round);
      setHistory((prev) => [round, ...prev].slice(0, 8));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError(err.message);
        setPhase("setup");
        return;
      }
      rememberShadowRound({
        ...counts,
        modelId: MODEL_ID,
        signals: signalContract(counts),
        adultConfirmed: adult || eligibility?.needsAdultConfirm === false,
      });
      setResult(draft);
      setError("Saved on this phone. It reaches your coach when the gym system is on.");
    }
    setPhase("result");
  }

  if (eligibility && !eligibility.allowed) {
    return (
      <div className={styles.page}>
        <div className={styles.headerBlock}>
          <p className={styles.eyebrow}>Shadow round</p>
          <h1 className={styles.title}>This one stays with the coach.</h1>
          <p className={styles.lead}>{eligibility.reason}</p>
        </div>
        <Link href="/app">Back to your corner</Link>
      </div>
    );
  }

  const onCamera = phase === "frame" || phase === "live";
  const clock = `${Math.floor(practiceLeft / 60)}:${String(practiceLeft % 60).padStart(2, "0")}`;

  return (
    <div className={`${styles.page} ${styles.shadowPage}`}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Shadow round</p>
        <h1 className={styles.title}>
          {phase === "live" ? "Throw it." : phase === "frame" ? "Step in." : "One round. One fix."}
        </h1>
        {phase === "setup" ? (
          <p className={styles.lead}>
            Sideways to the phone. Chest height. Head, gloves, and shoes in the
            picture. The film stays here. Your coach gets the note.
          </p>
        ) : null}
      </div>

      {error ? <p className={styles.shadowWarn}>{error}</p> : null}

      <section
        className={phase === "setup" ? `${styles.shadowRing} ${styles.shadowRingStill}` : styles.shadowRing}
        aria-label="Round camera"
      >
        <video
          ref={videoRef}
          className={onCamera ? styles.shadowStage : styles.shadowHidden}
          playsInline
          muted
        />
        {phase === "setup" ? (
          <div className={styles.shadowPlate}>
            <img
              className={styles.shadowLesson}
              src="/shadow/side-on.jpg"
              alt="Coach sets the phone at chest height. The member stands side on, gloves at the cheeks."
            />
            <span className={styles.shadowStatus}>
              {modelState === "ready"
                ? "Model ready"
                : modelState === "failed"
                  ? "Model did not load"
                  : "Loading model"}
            </span>
          </div>
        ) : null}
        {phase === "frame" ? (
          <>
            <div className={styles.shadowGuide} aria-hidden="true" />
            <div className={styles.shadowOverlay}>
              <strong>Hold still in frame</strong>
              <span>{cue}</span>
            </div>
          </>
        ) : null}
        {phase === "live" ? (
          <div className={styles.shadowHud}>
            <p className={styles.shadowClock}>{secondsLeft}</p>
            <p className={styles.shadowCall}>{cue}</p>
            <p className={styles.shadowSeen}>{call}</p>
          </div>
        ) : null}
      </section>

      {phase === "live" ? (
        <ul className={styles.shadowTally}>
          <li className={flash?.startsWith("jab-") ? styles.shadowPop : ""} key={flash?.startsWith("jab-") ? flash : "jab"}><span>Jab</span><strong>{liveCounts.jabs}</strong></li>
          <li className={flash?.startsWith("cross-") ? styles.shadowPop : ""} key={flash?.startsWith("cross-") ? flash : "cross"}><span>Cross</span><strong>{liveCounts.crosses}</strong></li>
          <li className={flash?.startsWith("hook-") ? styles.shadowPop : ""} key={flash?.startsWith("hook-") ? flash : "hook"}><span>Hook</span><strong>{liveCounts.hooks}</strong></li>
          <li className={flash?.startsWith("upper-") ? styles.shadowPop : ""} key={flash?.startsWith("upper-") ? flash : "upper"}><span>Upper</span><strong>{liveCounts.uppercuts}</strong></li>
        </ul>
      ) : null}

      {phase === "setup" ? (
        <section className={styles.shadowSetup}>
          <div className={styles.shadowStance}>
            <button
              type="button"
              className={stance === "orthodox" ? styles.shadowStanceOn : ""}
              onClick={() => setStance("orthodox")}
            >
              <span>Lead left</span>
              Orthodox
            </button>
            <button
              type="button"
              className={stance === "southpaw" ? styles.shadowStanceOn : ""}
              onClick={() => setStance("southpaw")}
            >
              <span>Lead right</span>
              Southpaw
            </button>
          </div>
          {modelState === "failed" ? (
            <Button type="button" variant="secondary" onClick={() => {
              setError(null);
              setModelState("loading");
              setModelTry((n) => n + 1);
            }}>
              Try the model again
            </Button>
          ) : null}
          {eligibility?.needsAdultConfirm !== false ? (
            <label className={styles.shadowAdult}>
              <input
                type="checkbox"
                checked={adult}
                onChange={(event) => setAdult(event.target.checked)}
              />
              <span>I am 18 or older. Youth rounds stay with the coach.</span>
            </label>
          ) : null}
          <Button type="button" onClick={() => void start()} disabled={modelState !== "ready"}>
            Start the read
          </Button>
        </section>
      ) : null}

      {onCamera ? (
        <div className={styles.shadowSetup}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              stopRef.current?.();
              setPhase("setup");
              setCue(CUES_START);
            }}
          >
            Stop
          </Button>
        </div>
      ) : null}

      {phase === "result" && result ? (
        <section className={styles.shadowResult}>
          <img
            className={styles.shadowCard}
            src={lessonImage(result.signal).src}
            alt={lessonImage(result.signal).alt}
          />
          <p className={styles.eyebrow}>The one fix</p>
          <h2>{shownRead(result).title}</h2>
          <p>{shownRead(result).body}</p>
          {result.coachStatus === "replaced" ? null : (
            <ol>
              {result.drillSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <ul className={styles.shadowTally}>
            <li><span>Jab</span><strong>{result.jabs}</strong></li>
            <li><span>Cross</span><strong>{result.crosses}</strong></li>
            <li><span>Hook</span><strong>{result.hooks}</strong></li>
            <li><span>Upper</span><strong>{result.uppercuts}</strong></li>
          </ul>
          <p className={styles.shadowNote}>{shownRead(result).aside}</p>
          <div className={styles.actionsRow}>
            <Button
              type="button"
              onClick={() => {
                practiceBelled.current = false;
                setPracticeLeft(180);
                setPhase("practice");
                gymBell("start");
              }}
            >
              Practice · 3:00
            </Button>
            <Button type="button" variant="secondary" onClick={() => setPhase("setup")}>
              Read again
            </Button>
          </div>
        </section>
      ) : null}

      {phase === "practice" && result ? (
        <section className={styles.shadowResult}>
          <img
            className={styles.shadowCard}
            src={lessonImage(result.signal).src}
            alt={lessonImage(result.signal).alt}
          />
          <p className={styles.eyebrow}>{practiceLeft === 0 ? "Time" : shownRead(result).title}</p>
          <p className={styles.shadowClock} aria-live="polite">{clock}</p>
          <p>{practiceLeft === 0 ? "That's the round. Take it to class." : shownRead(result).body}</p>
          {result.coachStatus === "replaced" ? null : (
            <ol>
              {result.drillSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <Button type="button" variant="secondary" onClick={() => setPhase("result")}>
            {practiceLeft === 0 ? "Back to the note" : "Done"}
          </Button>
        </section>
      ) : null}

      <p className={styles.shadowSrOnly} aria-live="polite">
        {phase === "live" ? `${secondsLeft} seconds. ${cue} ${call}.` : ""}
      </p>

      {history.length && phase === "setup" ? (
        <section className={styles.shadowHistory}>
          <h2>Recent reads</h2>
          <ul>
            {history.map((row, index) => {
              const read = shownRead(row);
              const art = lessonImage(row.signal);
              return (
                <li key={row.id ?? `${row.createdAt ?? "local"}-${index}`}>
                  <img src={art.src} alt="" />
                  <div>
                    <strong>{read.title}</strong>
                    <em>{roundStamp(row)}</em>
                    <span>{read.body}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

const CUES_START = "Turn sideways. Chest height. Head to shoes.";

function lessonImage(signal: string) {
  if (signal === "unreadable" || signal === "quiet") {
    return {
      src: "/shadow/side-on.jpg",
      alt: "Set the phone at chest height and stand side on, head to shoes.",
    };
  }
  if (signal === "return" || signal === "chin") {
    return {
      src: "/shadow/one-fix.jpg",
      alt: "The coach shows the phone card: one fix, cheek-touch.",
    };
  }
  if (signal === "guard") {
    return {
      src: "/shadow/bring-it-home.jpg",
      alt: "The coach parks both gloves on the cheeks. Bring it home.",
    };
  }
  if (signal === "feet") {
    return {
      src: "/shadow/side-on.jpg",
      alt: "Side on, with the shoes set and the phone at chest height.",
    };
  }
  return {
    src: "/shadow/throw-it.jpg",
    alt: "Throw the jab. The rear glove stays at the cheek.",
  };
}
function gymBell(kind: "start" | "end") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!bellCtx) bellCtx = new Ctx();
  void bellCtx.resume();
  const now = bellCtx.currentTime;
  const notes = kind === "start" ? [523.25, 659.25] : [392, 311.13];
  notes.forEach((freq, index) => {
    const osc = bellCtx!.createOscillator();
    const gain = bellCtx!.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const at = now + index * 0.16;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.07, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
    osc.connect(gain);
    gain.connect(bellCtx!.destination);
    osc.start(at);
    osc.stop(at + 0.46);
  });
}

function gymTap(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate(pattern);
}

let bellCtx: AudioContext | null = null;

const MODEL_ID = "mediapipe-pose-lite-v1";
const OUTBOX_KEY = "sullys.shadow.outbox";

function signalContract(counts: ShadowCounts) {
  return {
    contract: "shadow-v1",
    pose: "blazepose-33",
    view: "side",
    visible: counts.visibleFrames,
    guardLow: counts.guardLowFrames,
    feetNarrow: counts.feetNarrowFrames,
    chinUp: counts.chinUpFrames,
  };
}

function roundStamp(row: SavedRound) {
  if (row.coachStatus === "replaced") return "Coach's note";
  if (row.coachStatus === "confirmed") return "Coach confirmed";
  if (!row.saved) return "On this phone";
  return "Waiting on coach";
}

function shownRead(row: SavedRound) {
  if (row.coachStatus === "replaced" && row.coachNote) {
    return {
      title: "Coach's note",
      body: row.coachNote,
      aside: "Your coach replaced the phone's read. Follow this note.",
    };
  }
  const aside = row.coachNote
    ? `Coach: ${row.coachNote}`
    : row.coachStatus === "confirmed"
      ? "Your coach confirmed this note."
      : row.xpAwarded
        ? `+${row.xpAwarded} XP today. Your coach can confirm this note.`
        : "Your coach can confirm or change this note.";
  return { title: row.drillTitle, body: row.correction, aside };
}

function rememberShadowRound(payload: Record<string, unknown>) {
  try {
    const current = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
    const rows = Array.isArray(current) ? current : [];
    rows.push(payload);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(rows.slice(-5)));
  } catch {
    /* private browsing */
  }
}

async function flushShadowRounds(send: (body: Record<string, unknown>) => Promise<void>) {
  let rows: Record<string, unknown>[] = [];
  try {
    const current = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
    rows = Array.isArray(current) ? current : [];
  } catch {
    return;
  }
  if (!rows.length) return;
  const left: Record<string, unknown>[] = [];
  for (const row of rows) {
    try {
      await send(row);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      if (status === 400 || status === 403) continue;
      left.push(row);
    }
  }
  try {
    if (left.length) localStorage.setItem(OUTBOX_KEY, JSON.stringify(left));
    else localStorage.removeItem(OUTBOX_KEY);
  } catch {
    /* ignore */
  }
}
