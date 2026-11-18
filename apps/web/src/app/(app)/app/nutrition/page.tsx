"use client";

import styles from "../ui.module.css";

export default function NutritionPage() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Coming soon</p>
      <h1 className={styles.title}>No food service</h1>
      <section className={styles.card}>
        <p>
          Sully&apos;s is not serving meals. There is nothing to order from
          the gym.
        </p>
        <p className={styles.muted}>
          Nothing can be ordered from the boxing card today.
        </p>
      </section>
    </div>
  );
}
