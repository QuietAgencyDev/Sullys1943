"use client";

import styles from "../ui.module.css";

export default function NutritionPage() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Coming soon</p>
      <h1 className={styles.title}>Kitchen menu</h1>
      <section className={styles.card}>
        <p>
          The kitchen is not open yet. Meals and pre-orders will show up on
          this card when Sully&apos;s starts serving food.
        </p>
        <p className={styles.muted}>
          Nothing can be ordered from the boxing card today.
        </p>
      </section>
    </div>
  );
}
