import Link from "next/link";
import { Button } from "@sullys/ui";
import styles from "./legacy-teaser.module.css";

export function LegacyTeaser() {
  return (
    <section id="legacy" className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Character is the legacy</p>
        <h2 className={styles.title}>From Sully to stewardship</h2>
        <p className={styles.copy}>
          Earl “Sully” Sullivan built a centre where underprivileged youth found
          discipline and respect. Joe Manteiga kept the doors open for twenty
          years. Today Danielle Monteiga and Phil Pereira carry the same
          non-profit mission — boxing as the engine, people as the purpose.
        </p>
        <div className={styles.actions}>
          <Link href="/legacy">
            <Button variant="primary">Enter the Legacy Wall</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
