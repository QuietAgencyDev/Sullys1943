import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "../join/placeholder.module.css";

export default function TrialPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Coming in Phase 2–3</p>
        <h1 className={styles.title}>Book a Trial</h1>
        <p className={styles.copy}>
          Trial booking will connect to live class capacity, digital waivers, and
          your membership card — same database as the gym floor.
        </p>
        <Link href="/">
          <Button variant="secondary">Back home</Button>
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
