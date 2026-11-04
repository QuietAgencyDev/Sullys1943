import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "./legal.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Missed</p>
        <h1 className={styles.title}>That page is not on the card.</h1>
        <p className={styles.lead}>
          The address does not match a page at Sully&apos;s. Head back to the
          floor, or come see us.
        </p>
        <p className={styles.actions}>
          <Link href="/">Home</Link>
          <Link href="/classes">Classes</Link>
          <Link href="/contact">Visit</Link>
          <Link href="/app/login">Member sign in</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
