"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./proof-counters.module.css";

/** EST 1943 — show decade floor with + (e.g. 2026 → 80+) so the mark stays current. */
const YEARS_STANDING = Math.max(80, new Date().getFullYear() - 1943);
const YEARS_BADGE = Math.floor(YEARS_STANDING / 10) * 10;

const STATS = [
  { value: YEARS_BADGE, suffix: "+", label: "Years" },
  { value: 700, suffix: "+", label: "Youth since 2019" },
  { value: 1, suffix: "", label: "Person at a time", display: "One" },
  { value: 1943, suffix: "", label: "Established", display: "1943" },
] as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function AnimatedNumber({
  value,
  suffix,
  display,
  active,
  reduced,
}: {
  value: number;
  suffix: string;
  display?: string;
  active: boolean;
  reduced: boolean;
}) {
  const [n, setN] = useState(reduced || !active ? value : 0);

  useEffect(() => {
    if (display || reduced || !active) {
      setN(value);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, display, reduced, value]);

  if (display) return <>{display}</>;
  return (
    <>
      {n.toLocaleString()}
      {suffix}
    </>
  );
}

export function ProofCounters() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={styles.section} aria-label="Sully's by the numbers">
      <div className={styles.inner}>
        {STATS.map((stat) => (
          <article key={stat.label} className={styles.stat}>
            <p className={styles.value}>
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                display={"display" in stat ? stat.display : undefined}
                active={active}
                reduced={reduced}
              />
            </p>
            <p className={styles.label}>{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
