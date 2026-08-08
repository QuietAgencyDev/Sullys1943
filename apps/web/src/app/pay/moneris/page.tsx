"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "../pay.module.css";

function MonerisInner() {
  const params = useSearchParams();
  const ticket = params.get("ticket");
  const token = params.get("token");

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Moneris Checkout</p>
      <h1 className={styles.title}>Secure payment</h1>
      {ticket ? (
        <>
          <p className={styles.copy}>
            Ticket ready. Load Moneris Checkout.js with this ticket when the
            store is live in production.
          </p>
          <p className={styles.meta}>Ticket: {ticket.slice(0, 12)}…</p>
          <p className={styles.copy}>
            Until Checkout.js is wired, complete via mock settle:
          </p>
          <Link
            className={styles.primary}
            href={`/pay/mock?token=${encodeURIComponent(token ?? "")}`}
          >
            Continue (dev settle)
          </Link>
        </>
      ) : (
        <p className={styles.error}>Missing Moneris ticket.</p>
      )}
    </main>
  );
}

export default function MonerisPayPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className={styles.main}>Loading…</main>}>
        <MonerisInner />
      </Suspense>
    </>
  );
}
