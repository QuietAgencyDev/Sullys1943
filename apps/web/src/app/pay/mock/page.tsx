"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiError, post } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import styles from "../pay.module.css";

function MockPayInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const amountCents = Number(params.get("amount") || 0);
  const orderId = params.get("orderId");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountLabel = useMemo(
    () =>
      new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      }).format(amountCents / 100),
    [amountCents],
  );

  async function complete() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ orderId?: string | null; kind?: string }>(
        "/api/v1/commerce/pay/complete",
        { token, orderId: orderId ?? undefined },
      );
      const kind = res.kind?.includes("donation") ? "donate" : "store";
      const id = res.orderId ?? orderId ?? "";
      router.push(`/${kind}/success?orderId=${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Checkout</p>
      <h1 className={styles.title}>Confirm payment</h1>
      <p className={styles.copy}>
        Demo / mock checkout — Moneris keys not configured. Amount{" "}
        <strong>{amountLabel}</strong>.
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button
        type="button"
        className={styles.primary}
        disabled={busy || !token}
        onClick={() => void complete()}
      >
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </button>
      <p className={styles.meta}>
        <Link href="/donate">Donate</Link> · <Link href="/store">Store</Link>
      </p>
    </main>
  );
}

export default function MockPayPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className={styles.main}>Loading…</main>}>
        <MockPayInner />
      </Suspense>
    </>
  );
}
