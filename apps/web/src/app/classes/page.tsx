"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApiError, get } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import {
  FLOOR_SLOTS,
  SCHEDULE_DAYS,
  formatSlotTime,
} from "@/lib/floor-schedule";
import styles from "./classes.module.css";

type LiveClass = {
  id: string;
  startsAt: string;
  name: string;
  spotsLeft: number;
  capacity: number;
  status: "open" | "full";
};

const LEVELS = [
  { tone: "beginner", label: "Beginner" },
  { tone: "plus", label: "Beginner + Intermediate" },
  { tone: "intermediate", label: "Intermediate" },
  { tone: "advanced", label: "Advanced" },
  { tone: "fight", label: "Fight Team" },
  { tone: "sparring", label: "Sparring" },
] as const;

export default function ClassesPage() {
  const brand = getBrand();
  const today = new Date().getDay();
  const [classes, setClasses] = useState<LiveClass[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await get<{ classes: LiveClass[] }>("/api/v1/classes/live");
        if (!active) return;
        setClasses(data.classes ?? []);
      } catch (err) {
        if (!active) return;
        if (!(err instanceof ApiError)) return;
        setClasses([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Weekly schedule</p>
        <h1 className={styles.title}>Classes</h1>
        <p className={styles.copy}>
          {`The week on the floor at ${brand.gym.name}, ${brand.gym.addressLine1}. Sunday the gym is closed.`}
        </p>
        <p className={styles.copy}>
          <Link href="/app/login?next=/app/book">Sign in to book a class</Link>
        </p>

        <ul className={styles.legend}>
          {LEVELS.map((level) => (
            <li key={level.tone}>
              <span className={`${styles.swatch} ${styles[level.tone]}`} />
              {level.label}
            </li>
          ))}
        </ul>

        <div className={styles.board}>
          {SCHEDULE_DAYS.map((column) => {
            const slots = FLOOR_SLOTS.filter((slot) => slot.day === column.day);
            return (
              <section
                key={column.day}
                className={column.day === today ? `${styles.day} ${styles.today}` : styles.day}
              >
                <h2 className={styles.dayName}>{column.label}</h2>
                <ul className={styles.slots}>
                  {slots.map((slot) => (
                    <li
                      key={`${slot.hour}-${slot.minute}-${slot.title}`}
                      className={`${styles.slot} ${styles[slot.tone]}`}
                    >
                      {slot.poster ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img className={styles.poster} src={slot.poster} alt="" />
                      ) : null}
                      <p className={styles.time}>
                        {formatSlotTime(slot.hour, slot.minute)}
                      </p>
                      <p className={styles.name}>{slot.title}</p>
                      <p className={styles.meta}>
                        {slot.level}
                        {slot.coach ? (
                          <>
                            {" · "}
                            <span className={styles.coach}>{slot.coach}</span>
                          </>
                        ) : null}
                        {slot.note ? ` · ${slot.note}` : ""}
                      </p>
                      {slot.blurb ? <p className={styles.blurb}>{slot.blurb}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className={styles.pt} aria-label="Kids private training">
          <div className={styles.ptIntro}>
            <p className={styles.eyebrow}>Kids 7 and under</p>
            <h2 className={styles.ptTitle}>Private training</h2>
            <p className={styles.copy}>
              One-to-one time with a coach, booked at the desk. Ages 7 and
              under. The website does not charge this.
            </p>
          </div>
          <div className={styles.ptRates}>
            <article className={styles.ptCard}>
              <p className={styles.ptKicker}>Private</p>
              <p className={styles.ptPrice}>$65</p>
              <p className={styles.ptUnit}>an hour · one child</p>
            </article>
            <article className={`${styles.ptCard} ${styles.ptSpecial}`}>
              <p className={styles.ptKicker}>Two together</p>
              <p className={styles.ptPrice}>$55</p>
              <p className={styles.ptUnit}>an hour · the pair rate</p>
            </article>
          </div>
          <ul className={styles.ptCoaches}>
            <li>Reni</li>
            <li>Levi</li>
            <li>Anthony</li>
            <li>Tommy</li>
          </ul>
        </section>

        <ul className={styles.notes}>
          <li>The posted week is Monday to Friday. Sunday the gym is closed.</li>
          <li>Youth Boxing is free Monday, Wednesday, and Friday, 4:30–5:20, ages 13–17. Junior Boxing is free Tuesday and Thursday, 4:30–5:20, ages 8–12. A parent books the child before they arrive. No walk-ins.</li>
          <li>Fight Team and Sparring are invite only. Coach approval, an active Boxing Ontario membership, a valid medical, a mouthguard, and headgear.</li>
          <li>Kids 7 and under, private training: $65 an hour with one child, $55 an hour when two train together. Coaches Reni, Levi, Anthony, and Tommy. Book at the desk.</li>
          <li>November 2026 rates, before HST: Adult Unlimited $150 a month, 8 classes $120, weights and bags $75, drop-in $32. Gift certificates are $50, $100, and $150 at the desk. Glofox still sends the bill.</li>
        </ul>

        {classes.length > 0 ? (
          <section className={styles.live}>
            <h2 className={styles.liveTitle}>Coming up</h2>
            <ul className={styles.liveList}>
              {classes.map((item) => (
                <li key={item.id} className={styles.liveRow}>
                  <p className={styles.liveName}>{item.name}</p>
                  <p className={styles.liveMeta}>
                    {item.startsAt}
                    {" · "}
                    {item.status === "full"
                      ? "Full"
                      : `${item.spotsLeft} spots open`}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
