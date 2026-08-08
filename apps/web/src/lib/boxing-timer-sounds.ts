/**
 * Boxing gym timer cues — wooden-block double clap + round bell.
 * Uses HTMLAudioElement + WAV data URIs (reliable on TV browsers).
 */

let unlocked = false;
let warnAudio: HTMLAudioElement | null = null;
let bellAudio: HTMLAudioElement | null = null;

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function encodeWav(samples: Float32Array, sampleRate: number): string {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x2000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/** Sharp wooden-block / clapper transient */
function woodenHitSamples(sampleRate: number, gain = 0.95): Float32Array {
  const n = Math.floor(sampleRate * 0.1);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 55) * (1 - t / 0.1);
    // Mix band-limited noise + wood-ish partials
    const noise = (Math.random() * 2 - 1) * 0.7;
    const tone =
      Math.sin(2 * Math.PI * 2100 * t) * 0.35 +
      Math.sin(2 * Math.PI * 3200 * t) * 0.2 +
      Math.sin(2 * Math.PI * 900 * t) * 0.15;
    out[i] = (noise + tone) * env * gain;
  }
  return out;
}

function doubleClapWav(): string {
  const sr = 44100;
  const hit = woodenHitSamples(sr, 1);
  const gap = Math.floor(sr * 0.16);
  const out = new Float32Array(hit.length * 2 + gap);
  out.set(hit, 0);
  out.set(hit, hit.length + gap);
  return encodeWav(out, sr);
}

function bellWav(): string {
  const sr = 44100;
  const n = Math.floor(sr * 0.55);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 4.5);
    const ding =
      Math.sin(2 * Math.PI * 880 * t) * 0.55 +
      Math.sin(2 * Math.PI * 1320 * t) * 0.25 +
      Math.sin(2 * Math.PI * 660 * t) * 0.2;
    // Second strike
    const t2 = t - 0.14;
    const env2 = t2 > 0 ? Math.exp(-t2 * 4.5) : 0;
    const ding2 =
      t2 > 0
        ? Math.sin(2 * Math.PI * 740 * t2) * 0.45 +
          Math.sin(2 * Math.PI * 1100 * t2) * 0.2
        : 0;
    out[i] = ding * env + ding2 * env2;
  }
  return encodeWav(out, sr);
}

function ensurePlayers() {
  if (typeof window === "undefined") return;
  if (!warnAudio) {
    warnAudio = new Audio(doubleClapWav());
    warnAudio.preload = "auto";
    warnAudio.volume = 1;
  }
  if (!bellAudio) {
    bellAudio = new Audio(bellWav());
    bellAudio.preload = "auto";
    bellAudio.volume = 0.9;
  }
}

async function playEl(el: HTMLAudioElement | null) {
  if (!el) return;
  try {
    el.currentTime = 0;
    await el.play();
  } catch {
    // Autoplay blocked — caller should unlock via gesture first
  }
}

export function isBoxingTimerSoundUnlocked() {
  return unlocked;
}

/** Call from a user gesture. Plays an audible test clap so you know speakers work. */
export async function unlockBoxingTimerSounds(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  ensurePlayers();
  try {
    // Unlock policy: play real sound in the gesture stack
    if (warnAudio) {
      warnAudio.currentTime = 0;
      await warnAudio.play();
    }
    unlocked = true;
    return true;
  } catch {
    unlocked = false;
    return false;
  }
}

/** Two wooden claps — classic gym “ten seconds” warning */
export function playTenSecondWarning() {
  if (!unlocked) return;
  ensurePlayers();
  void playEl(warnAudio);
}

/** Round start / end bell */
export function playRoundBell() {
  if (!unlocked) return;
  ensurePlayers();
  void playEl(bellAudio);
}

/** Explicit test from UI (also unlocks) */
export async function testBoxingTimerSound(): Promise<boolean> {
  const ok = await unlockBoxingTimerSounds();
  return ok;
}
