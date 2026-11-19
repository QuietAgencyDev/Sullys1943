"use client";

import styles from "../ui.module.css";

export default function NutritionPage() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Closed</p>
      <h1 className={styles.title}>This page is closed</h1>
      <section className={styles.card}>
        <p className={styles.muted}>Use the member home for classes and check-in.</p>
      </section>
    </div>
  );
}
