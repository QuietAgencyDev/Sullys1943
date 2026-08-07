"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { get, post } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "../join.module.css";

function SuccessInner() {
  const params = useSearchParams();
  const membershipId = params.get("membershipId");
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<string>("checking");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!membershipId) {
        setStatus("unknown");
        return;
      }

      try {
        if (sessionId) {
          const confirmed = await post<{
            confirmed: boolean;
            membership: { status: string };
            paymentStatus?: string;
          }>("/api/v1/billing/confirm-checkout", {
            sessionId,
            membershipId,
          });
          if (cancelled) return;
          if (confirmed.confirmed) {
            setStatus(confirmed.membership.status);
            setNote("Stripe payment confirmed.");
            return;
          }
          setNote(
            `Stripe session ${confirmed.paymentStatus ?? "pending"} — waiting for settlement.`,
          );
        }

        const res = await get<{ membership: { status: string } }>(
          `/api/v1/billing/status?membershipId=${encodeURIComponent(membershipId)}`,
        );
        if (!cancelled) setStatus(res.membership.status);
      } catch {
        if (!cancelled) setStatus("unknown");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [membershipId, sessionId]);

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Welcome</p>
      <h1 className={styles.title}>You&apos;re in</h1>
      <p className={styles.copy}>
        {status === "active"
          ? "Membership is active. Lace up and book your first class."
          : status === "pending_payment"
            ? "Payment is still processing — refresh in a moment."
            : status === "checking"
              ? "Confirming your checkout…"
              : "Thanks for joining Sully's."}
      </p>
      {note ? <p className={styles.copy}>{note}</p> : null}
      <div className={styles.actions}>
        <Link href="/app/calendar">
          <Button type="button">Open member portal</Button>
        </Link>
        <Link href="/app/billing">
          <Button type="button" variant="secondary">
            Billing history
          </Button>
        </Link>
      </div>
    </main>
  );
}

export default function JoinSuccessPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className={styles.main}>Confirming…</main>}>
        <SuccessInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
