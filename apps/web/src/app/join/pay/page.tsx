"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, post } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "../join.module.css";

function PayInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function confirmPay() {
    setPending(true);
    setError(null);
    try {
      await post("/api/v1/billing/mock-pay", { token });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Checkout</p>
      <h1 className={styles.title}>Mock payment</h1>
      <p className={styles.copy}>
        Stripe keys are not configured. Confirm below to activate membership in
        test mode (same path Stripe webhooks will use in production).
      </p>
      <section className={styles.panel}>
        {done ? (
          <>
            <p className={styles.copy}>Payment recorded. Membership is active.</p>
            <div className={styles.actions}>
              <Link href="/app/calendar">
                <Button type="button">Open portal</Button>
              </Link>
              <Link href="/app/passport">
                <Button type="button" variant="secondary">
                  View Boxing Passport
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {!token ? (
              <p className={styles.error}>Missing checkout token.</p>
            ) : null}
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.actions}>
              <Button
                type="button"
                disabled={!token || pending}
                onClick={confirmPay}
              >
                {pending ? "Processing…" : "Pay & activate"}
              </Button>
              <Link href="/join">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function JoinPayPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className={styles.main}>Loading checkout…</main>}>
        <PayInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
