"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { get } from "@/lib/api";
import styles from "../store.module.css";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [label, setLabel] = useState("Order confirmed");

  useEffect(() => {
    if (!orderId) return;
    get<{ amountCents: number; status: string }>(
      `/api/v1/commerce/orders/${orderId}`,
    )
      .then((o) => {
        const amt = new Intl.NumberFormat("en-CA", {
          style: "currency",
          currency: "CAD",
        }).format(o.amountCents / 100);
        setLabel(`${amt} · ${o.status}`);
      })
      .catch(() => undefined);
  }, [orderId]);

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Store</p>
      <h1 className={styles.title}>
        <span>You&apos;re set</span>
      </h1>
      <p className={styles.lead}>{label}</p>
      <p className={styles.copy}>
        We&apos;ll follow up by email for pickup or shipping. Desk can also
        confirm sizes.
      </p>
      <p className={styles.copy}>
        <Link href="/store">Back to store</Link>
        {" · "}
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}

export default function StoreSuccessPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className={styles.main}>Loading…</main>}>
        <SuccessInner />
      </Suspense>
    </>
  );
}
