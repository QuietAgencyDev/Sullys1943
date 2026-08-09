"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GYM } from "@/lib/gym-info";
import { HOME_CAROUSEL_SHOTS } from "@/lib/home-carousel";
import styles from "./gym-atmosphere.module.css";

const AUTO_MS = 4200;

export function GymAtmosphere() {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shots = HOME_CAROUSEL_SHOTS;
  // Duplicate for seamless loop feel on scroll
  const loop = [...shots, ...shots];

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || shots.length <= 1) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || paused) return;

    function scrollToIndex(i: number) {
      const el = rail;
      if (!el) return;
      const frames = el.querySelectorAll<HTMLElement>(`.${styles.frame}`);
      const target = frames[i % shots.length];
      if (!target) return;
      el.scrollTo({
        left: target.offsetLeft - el.offsetLeft,
        behavior: "smooth",
      });
    }

    const tick = window.setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % shots.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_MS);

    return () => window.clearInterval(tick);
  }, [paused, shots.length]);

  return (
    <section className={styles.section} aria-label="Inside the gym">
      <div
        className={styles.rail}
        ref={railRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={() => setPaused(true)}
      >
        {loop.map((shot, i) => (
          <figure key={`${shot.src}-${i}`} className={styles.frame}>
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(max-width: 900px) 85vw, 40vw"
              className={styles.img}
              priority={i < 2}
            />
          </figure>
        ))}
      </div>

      <div className={styles.dots} role="tablist" aria-label="Carousel slides">
        {shots.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show photo ${i + 1}`}
            className={i === index ? styles.dotActive : styles.dot}
            onClick={() => {
              setIndex(i);
              const rail = railRef.current;
              if (!rail) return;
              const frames = rail.querySelectorAll<HTMLElement>(
                `.${styles.frame}`,
              );
              const target = frames[i];
              if (target) {
                rail.scrollTo({
                  left: target.offsetLeft - rail.offsetLeft,
                  behavior: "smooth",
                });
              }
            }}
          />
        ))}
      </div>

      <div className={styles.caption}>
        <p className={styles.line}>{GYM.hoursSummary}</p>
        <p className={styles.line}>
          <Link href="/contact">{GYM.addressLine1}</Link>
          {" · "}
          <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a>
        </p>
      </div>
    </section>
  );
}
