"use client";

import Link from "next/link";
import {
  FLOOR_NOTE_MODES,
  FLOOR_POPUP_MODES,
  TV_ICON_FILES,
  TvArtNote,
  TvCssPopup,
} from "../tv-rive-layer";
import styles from "./popups.module.css";

const MODE_COPY: Record<
  string,
  {
    title: string;
    xp?: number;
    bonus?: string;
    name?: string;
    clock?: string;
    round?: string;
    rank?: string;
    score?: string;
  }
> = {
  achievement: {
    title: "Achievement",
    xp: 50,
    bonus: "FIRST BELL",
    name: "Gavin S",
  },
  xp_bonus: { title: "XP bonus", xp: 50, bonus: "STREAK ×2", name: "Gavin S" },
  teams: { title: "Team battle" },
  challenge: { title: "Challenge", round: "3 / 5 ROUNDS" },
  leaderboard: {
    title: "Leaderboard",
    name: "Gavin S",
    rank: "01",
    score: "70 XP  •  LEVEL 1",
  },
  class_complete: { title: "Class complete", xp: 25, bonus: "CLASS BONUS" },
  timer: { title: "Timer / rest", clock: "00:50", round: "REST  •  ROUND 12 / 12" },
  check_in: { title: "Check-in", name: "Gavin S", xp: 10 },
  first_visit: { title: "First visit", name: "Gavin S", xp: 50 },
  level_up: { title: "Level up", name: "Gavin S", xp: 50, bonus: "NEW LEVEL" },
  streak: { title: "Streak", name: "Gavin S", bonus: "STREAK ×7" },
  welcome_back: { title: "Welcome back", name: "Gavin S" },
  class_starting: { title: "Class starting", clock: "00:02:00" },
  last_spots: { title: "Last spots" },
  challenge_winner: { title: "Challenge winner", name: "Gavin S", xp: 25 },
  session_mvp: { title: "Session MVP", name: "Gavin S" },
  kids: { title: "Kids boxing" },
  kids_complete: { title: "Kids complete", xp: 15 },
  heritage: { title: "Heritage" },
  announcement: { title: "Announcement" },
  birthday: { title: "Birthday", name: "Kid 1" },
  pads: { title: "Pads" },
  sparring: { title: "Sparring" },
  combo: { title: "Combo of the round" },
  youth: { title: "Youth boxing signup" },
  legend: { title: "Canadian boxing" },
  sully_xp: { title: "Sully XP" },
};

const CORE = [
  "achievement",
  "xp_bonus",
  "teams",
  "challenge",
  "leaderboard",
  "class_complete",
  "timer",
] as const;

const CAST_STILLS = [
  { file: "coach-1-guard.png", who: "Coach 1", pose: "Guard" },
  { file: "coach-1-jab.png", who: "Coach 1", pose: "Jab" },
  { file: "coach-1-victory.png", who: "Coach 1", pose: "Victory" },
  { file: "coach-1-pads.png", who: "Coach 1", pose: "Pads" },
  { file: "coach-1-rest.png", who: "Coach 1", pose: "Rest" },
  { file: "coach-2-guard.png", who: "Coach 2", pose: "Guard · popup still" },
  { file: "coach-2-jab.png", who: "Coach 2", pose: "Jab" },
  { file: "coach-2-celebrate.png", who: "Coach 2", pose: "Celebrate" },
  { file: "coach-3-guard.png", who: "Coach 3", pose: "Guard" },
  { file: "coach-3-jab.png", who: "Coach 3", pose: "Jab" },
  { file: "coach-3-pads.png", who: "Coach 3", pose: "Pads" },
  { file: "coach-4-guard.png", who: "Coach 4", pose: "Guard" },
  { file: "teen-1-guard.png", who: "Teen 1", pose: "Guard" },
  { file: "teen-2-guard.png", who: "Teen 2", pose: "Guard" },
  { file: "kid-6-guard.png", who: "Kid 6", pose: "Guard" },
  { file: "sully-xp.png", who: "Sully XP", pose: "Badge" },
  { file: "kid-1-jab.png", who: "Kid 1", pose: "Uppercut" },
  { file: "kid-1-guard.png", who: "Kid 1", pose: "Guard · slip" },
  { file: "kid-2-guard.png", who: "Kid 2", pose: "Guard" },
  { file: "kid-2-celebrate.png", who: "Kid 2", pose: "Salute" },
  { file: "kid-3-celebrate.png", who: "Kid 3", pose: "Medal" },
  { file: "kid-4-celebrate.png", who: "Kid 4", pose: "Victory" },
  { file: "kid-4-jab.png", who: "Kid 4", pose: "Hook" },
  { file: "kid-5-jab.png", who: "Kid 5", pose: "Body hook" },
  { file: "kids-sparring-1.png", who: "Kids", pose: "Sparring" },
  { file: "kids-sparring-3.png", who: "Kids", pose: "Sparring · heritage" },
  { file: "kids-sparring-4.png", who: "Kids", pose: "Sparring · drill" },
] as const;

export default function TvPopupsReviewPage() {
  const extra = FLOOR_POPUP_MODES.filter(
    (mode) => !(CORE as readonly string[]).includes(mode),
  );

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <p className={styles.kicker}>Floor TV · image swap board</p>
        <h1>Popups &amp; icons</h1>
        <p className={styles.lead}>
          v2 cast is in: Coach 1–3, Kid 1–5, pads, rest, and kids sparring.
          Live text and the heritage shield stay on Cursor. Coach 2 still owns
          the default round clock — popup stills never replace that rig.
          Lower-thirds use <code>?note=nameplate</code> and do not hide Coach 2.
        </p>
        <p className={styles.links}>
          <Link href="/tv/floor">Floor TV (Coach 2)</Link>
          <Link href="/tv/floor?demo=celebrate">Cycle core popups</Link>
          <Link href="/tv/floor?note=nameplate">Nameplate note</Link>
          <Link href="/tv/demo">Demo kit</Link>
        </p>
      </header>

      <section>
        <h2>Cast</h2>
        <div className={styles.castGrid}>
          {CAST_STILLS.map((still) => (
            <figure key={still.file} className={styles.castCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/tv/cast/${still.file}`} alt="" />
              <figcaption>
                <code>{still.who}</code>
                <span>{still.pose}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2>Icons</h2>
        <div className={styles.iconGrid}>
          {TV_ICON_FILES.map((icon) => (
            <figure key={icon.file} className={styles.iconCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/tv/icons/${icon.file}`} alt="" />
              <figcaption>
                <code>{icon.file}</code>
                <span>{icon.use}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2>Core popups</h2>
        <div className={styles.modeGrid}>{CORE.map((mode) => card(mode))}</div>
      </section>

      <section>
        <h2>New popups</h2>
        <div className={styles.modeGrid}>{extra.map((mode) => card(mode))}</div>
      </section>

      <section>
        <h2>Lower-thirds — Coach 2 stays</h2>
        <div className={styles.modeGrid}>
          {FLOOR_NOTE_MODES.map((mode) => (
            <article key={mode} className={styles.modeCard}>
              <div className={styles.stage}>
                <TvArtNote mode={mode} hold />
              </div>
              <div className={styles.modeMeta}>
                <h3>{mode.replaceAll("_", " ")}</h3>
                <Link href={`/tv/floor?note=${mode}`}>See on Floor TV</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function card(mode: string) {
  const copy = MODE_COPY[mode] ?? { title: mode };
  return (
    <article key={mode} className={styles.modeCard}>
      <div className={styles.stage}>
        <TvCssPopup
          tvMode={mode}
          xpBonus={copy.xp ?? null}
          bonusLabel={copy.bonus ?? null}
          highlightName={copy.name ?? null}
          roundClock={copy.clock ?? null}
          roundLabel={copy.round ?? null}
          rankLabel={copy.rank ?? null}
          scoreLabel={copy.score ?? null}
          teamA={
            mode === "teams" ? { name: "Red Corner", points: 120 } : null
          }
          teamB={
            mode === "teams" ? { name: "Blue Corner", points: 110 } : null
          }
        />
      </div>
      <div className={styles.modeMeta}>
        <h3>{copy.title}</h3>
        <Link href={`/tv/floor?popup=${mode}`}>See on Floor TV</Link>
      </div>
    </article>
  );
}
