import type { ShadowCounts, ShadowStance } from "./shadow-round";

export const READ_SECONDS = 40;

export const CUES = [
  "Jab. Bring it home.",
  "Cross. Bring it home.",
  "Lead hook. Bring it home.",
  "Rear hook. Bring it home.",
  "Lead uppercut. Bring it home.",
  "Rear uppercut. Bring it home.",
] as const;

export function cueFor(elapsedSec: number) {
  const step = Math.floor(elapsedSec / (READ_SECONDS / CUES.length));
  return CUES[Math.min(CUES.length - 1, Math.max(0, step))] ?? CUES[0];
}

type Pt = { x: number; y: number; v: number };

export type PosePoint = { x: number; y: number; visibility?: number };

const NOSE = 0;
const L_SHOULDER = 11;
const R_SHOULDER = 12;
const L_ELBOW = 13;
const R_ELBOW = 14;
const L_WRIST = 15;
const R_WRIST = 16;
const L_ANKLE = 27;
const R_ANKLE = 28;

function pt(landmarks: PosePoint[], index: number): Pt | null {
  const p = landmarks[index];
  if (!p) return null;
  const v = p.visibility ?? 1;
  if (v < 0.45) return null;
  return { x: p.x, y: p.y, v };
}

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function elbowAngle(shoulder: Pt, elbow: Pt, wrist: Pt) {
  const ax = shoulder.x - elbow.x;
  const ay = shoulder.y - elbow.y;
  const bx = wrist.x - elbow.x;
  const by = wrist.y - elbow.y;
  const dot = ax * bx + ay * by;
  const mag = Math.hypot(ax, ay) * Math.hypot(bx, by);
  if (mag < 1e-4) return 180;
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

type Hand = "lead" | "rear";

type Burst = {
  hand: Hand;
  start: Pt;
  shoulder: Pt;
  elbow: Pt;
  peak: Pt;
  peakDist: number;
  path: Pt[];
  startedAt: number;
};

function emptyCounts(stance: ShadowStance, engine: string): ShadowCounts {
  return {
    engine,
    stance,
    durationSec: READ_SECONDS,
    frames: 0,
    visibleFrames: 0,
    guardLowFrames: 0,
    feetNarrowFrames: 0,
    chinUpFrames: 0,
    punches: 0,
    jabs: 0,
    crosses: 0,
    hooks: 0,
    uppercuts: 0,
    shortStraights: 0,
    missedReturns: 0,
  };
}

export function createShadowTracker(stance: ShadowStance) {
  const counts = emptyCounts(stance, "mediapipe-pose-v1");
  let lastAt = 0;
  let lastPunch = "Waiting for a punch";
  let liveCue = "Turn sideways. Head, gloves, and shoes in frame.";
  let readyStreak = 0;
  const bursts: Partial<Record<"left" | "right", Burst>> = {};

  function finish(side: "left" | "right", wrist: Pt, scale: number) {
    const burst = bursts[side];
    delete bursts[side];
    if (!burst || !burst.startedAt) return;
    const travel = dist(burst.start, burst.peak);
    if (travel < scale * 0.16) return;
    const dx = Math.abs(burst.peak.x - burst.start.x);
    const dy = burst.start.y - burst.peak.y;
    let arc = 0;
    const line = dist(burst.start, burst.peak) || 1;
    for (const p of burst.path) {
      const t =
        ((p.x - burst.start.x) * (burst.peak.x - burst.start.x) +
          (p.y - burst.start.y) * (burst.peak.y - burst.start.y)) /
        (line * line);
      const clamped = Math.max(0, Math.min(1, t));
      const px = burst.start.x + (burst.peak.x - burst.start.x) * clamped;
      const py = burst.start.y + (burst.peak.y - burst.start.y) * clamped;
      arc = Math.max(arc, Math.hypot(p.x - px, p.y - py));
    }
    counts.punches += 1;
    const straight = arc / line < 0.22 && dy <= dx * 0.85;
    let name = "hook";
    if (dy > scale * 0.1 && dy > dx) {
      counts.uppercuts += 1;
      name = "uppercut";
    } else if (!straight) {
      counts.hooks += 1;
      name = "hook";
    } else if (burst.hand === "lead") {
      counts.jabs += 1;
      name = "jab";
    } else {
      counts.crosses += 1;
      name = "cross";
    }
    if (straight) {
      const angle = elbowAngle(burst.shoulder, burst.elbow, burst.peak);
      if (angle < 155) counts.shortStraights += 1;
    }
    const home = dist(wrist, burst.start);
    if (home > travel * 0.55) counts.missedReturns += 1;
    lastPunch = name;
  }

  return {
    counts: () => counts,
    liveCue: () => liveCue,
    lastPunch: () => lastPunch,
    readyStreak: () => readyStreak,
    sample(landmarks: PosePoint[] | undefined, now: number) {
      counts.frames += 1;
      const dt = lastAt ? Math.max(0.016, (now - lastAt) / 1000) : 0.033;
      lastAt = now;
      if (!landmarks || landmarks.length < 29) {
        readyStreak = 0;
        liveCue = "Step back so the whole body is in frame.";
        return;
      }
      const nose = pt(landmarks, NOSE);
      const ls = pt(landmarks, L_SHOULDER);
      const rs = pt(landmarks, R_SHOULDER);
      const le = pt(landmarks, L_ELBOW);
      const re = pt(landmarks, R_ELBOW);
      const lw = pt(landmarks, L_WRIST);
      const rw = pt(landmarks, R_WRIST);
      const la = pt(landmarks, L_ANKLE);
      const ra = pt(landmarks, R_ANKLE);
      if (!nose || !ls || !rs || !lw || !rw || !la || !ra || !le || !re) {
        readyStreak = 0;
        liveCue = "Keep head, gloves, and shoes in the picture.";
        return;
      }
      readyStreak += 1;
      counts.visibleFrames += 1;
      // Side-on, the shoulders stack, so shoulder width collapses. Scale off
      // shoulder-to-ankle length, which stays readable from the side.
      const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, v: 1 };
      const ankleMid = { x: (la.x + ra.x) / 2, y: (la.y + ra.y) / 2, v: 1 };
      const scale = Math.max(0.2, dist(shoulderMid, ankleMid));
      const shoulderY = shoulderMid.y;
      const punching = Boolean(bursts.left?.startedAt || bursts.right?.startedAt);
      const glovesUp = lw.y < shoulderY + scale * 0.08 && rw.y < shoulderY + scale * 0.08;
      if (!punching && !glovesUp) counts.guardLowFrames += 1;
      if (dist(la, ra) < scale * 0.16) counts.feetNarrowFrames += 1;
      if ((shoulderY - nose.y) / scale > 0.42) counts.chinUpFrames += 1;

      const leadSide = stance === "orthodox" ? "left" : "right";
      const hands = [
        { side: "left" as const, wrist: lw, shoulder: ls, elbow: le },
        { side: "right" as const, wrist: rw, shoulder: rs, elbow: re },
      ];
      for (const hand of hands) {
        const burst = bursts[hand.side];
        if (!burst) {
          bursts[hand.side] = {
            hand: hand.side === leadSide ? "lead" : "rear",
            start: hand.wrist,
            shoulder: hand.shoulder,
            elbow: hand.elbow,
            peak: hand.wrist,
            peakDist: 0,
            path: [hand.wrist],
            startedAt: 0,
          };
          continue;
        }
        const speed =
          dist(hand.wrist, burst.path[burst.path.length - 1] ?? hand.wrist) / dt;
        burst.path.push(hand.wrist);
        if (burst.path.length > 18) burst.path.shift();
        const fromShoulder = dist(hand.wrist, hand.shoulder);
        const speedNorm = speed / scale;
        if (!burst.startedAt) {
          if (speedNorm > 0.85) {
            burst.startedAt = now;
            burst.start = burst.path[Math.max(0, burst.path.length - 3)] ?? hand.wrist;
            burst.shoulder = hand.shoulder;
            burst.peak = hand.wrist;
            burst.peakDist = fromShoulder;
            burst.elbow = hand.elbow;
            burst.path = [burst.start, hand.wrist];
          } else {
            burst.start = hand.wrist;
          }
          continue;
        }
        if (fromShoulder >= burst.peakDist) {
          burst.peakDist = fromShoulder;
          burst.peak = hand.wrist;
          burst.elbow = hand.elbow;
          burst.shoulder = hand.shoulder;
        }
        const elapsed = now - burst.startedAt;
        const backHome = dist(hand.wrist, burst.start) < scale * 0.12;
        if ((elapsed > 160 && speedNorm < 0.4 && backHome) || elapsed > 900) {
          finish(hand.side, hand.wrist, scale);
        }
      }
      if (!glovesUp) liveCue = "Gloves back to the cheeks.";
      else if (dist(la, ra) < scale * 0.16) liveCue = "Widen the base.";
      else liveCue = "Good. Throw it and bring it home.";
    },
  };
}

type VisionModule = {
  FilesetResolver: {
    forVisionTasks: (url: string) => Promise<unknown>;
  };
  PoseLandmarker: {
    createFromOptions: (
      fileset: unknown,
      options: unknown,
    ) => Promise<{
      detectForVideo: (
        video: HTMLVideoElement,
        timestamp: number,
      ) => { landmarks?: PosePoint[][] };
      close: () => void;
    }>;
  };
};

export async function loadPoseLandmarker() {
  const load = new Function(
    "return import('/vendor/mediapipe/vision_bundle.mjs')",
  ) as () => Promise<VisionModule>;
  const vision = await load();
  const fileset = await vision.FilesetResolver.forVisionTasks("/vendor/mediapipe");
  const modelAssetPath = "/models/pose_landmarker_lite.task";
  try {
    return await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath, delegate: "GPU" },
      runningMode: "VIDEO",
      numPoses: 1,
    });
  } catch {
    return vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath, delegate: "CPU" },
      runningMode: "VIDEO",
      numPoses: 1,
    });
  }
}
