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
          v2 first drop is in: Coach 1 guard, heritage shield, every new mode
          wired for live text. Kid 1–5 sprites are not in this zip yet — those
          cards use the empty well until the next download. Coach 2 stays on the
          default round clock. Lower-thirds use{" "}
          <code>?note=nameplate</code> and do not hide Coach 2.
        </p>
        <p className={styles.links}>
          <Link href="/tv/floor">Floor TV (Coach 2)</Link>
          <Link href="/tv/floor?demo=celebrate">Cycle core popups</Link>
          <Link href="/tv/floor?note=nameplate">Nameplate note</Link>
          <Link href="/tv/demo">Demo kit</Link>
        </p>
      </header>

      <section>
        <h2>Cast — Coach 1</h2>
        <div className={styles.iconGrid}>
          <figure className={styles.iconCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tv/cast/coach-1-guard.png" alt="Coach 1 guard" />
            <figcaption>
              <code>Coach 1</code>
              <span>Guard</span>
            </figcaption>
          </figure>
          <figure className={styles.iconCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tv/cast/coach-1-jab.png" alt="Coach 1 jab" />
            <figcaption>
              <code>Coach 1</code>
              <span>Jab · shorts fixed</span>
            </figcaption>
          </figure>
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
