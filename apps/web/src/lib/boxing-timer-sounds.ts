/**
 * Boxing gym timer cues — synthesized wooden-block claps + short bell.
 * No asset files required (works offline / on demo TVs after one tap).
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function isBoxingTimerSoundUnlocked() {
  return unlocked;
}

/** Call from a user gesture (tap / fullscreen) so Chrome lets the TV play. */
export async function unlockBoxingTimerSounds(): Promise<boolean> {
  const audio = getCtx();
  if (!audio) return false;
  try {
    if (audio.state === "suspended") await audio.resume();
    // Silent tick proves the graph is live
    const g = audio.createGain();
    g.gain.value = 0.0001;
    const o = audio.createOscillator();
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.02);
    unlocked = audio.state === "running";
    return unlocked;
  } catch {
    return false;
  }
}

function noiseBuffer(audio: AudioContext, seconds: number) {
  const len = Math.floor(audio.sampleRate * seconds);
  const buffer = audio.createBuffer(1, len, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Single wooden-block / clapper hit */
function playWoodenHit(audio: AudioContext, when: number, gain = 0.55) {
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio, 0.09);

  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1850;
  bp.Q.value = 1.1;

  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 700;

  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.085);

  src.connect(bp);
  bp.connect(hp);
  hp.connect(g);
  g.connect(audio.destination);
  src.start(when);
  src.stop(when + 0.1);
}

/** Two claps — classic gym “ten seconds” warning */
export function playTenSecondWarning() {
  const audio = getCtx();
  if (!audio || !unlocked) return;
  void audio.resume();
  const t = audio.currentTime + 0.02;
  playWoodenHit(audio, t, 0.62);
  playWoodenHit(audio, t + 0.17, 0.58);
}

/** Soft round-end / start cue */
export function playRoundBell() {
  const audio = getCtx();
  if (!audio || !unlocked) return;
  void audio.resume();
  const t = audio.currentTime + 0.02;
  for (let i = 0; i < 2; i++) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = "triangle";
    o.frequency.value = i === 0 ? 880 : 660;
    const start = t + i * 0.12;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.28, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    o.connect(g);
    g.connect(audio.destination);
    o.start(start);
    o.stop(start + 0.4);
  }
}
