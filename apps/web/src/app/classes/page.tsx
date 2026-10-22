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
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <ul className={styles.notes}>
          <li>Free youth classes are Little Champs (ages 6–12) and Jab Lab (ages 13–18).</li>
          <li>Tony&apos;s House of Pain at 8:00 PM runs Monday through Thursday.</li>
          <li>
            Fight Team and Sparring need an active Boxing Ontario membership and a
            valid medical.
          </li>
          <li>
            Sweet Science is listed with Anthony. The poster does not say Anthony P.
            or Anthony Sky.
          </li>
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
