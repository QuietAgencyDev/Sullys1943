"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { get } from "@/lib/api";
import styles from "../donate.module.css";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    get<{ amountCents: number; status: string }>(
      `/api/v1/commerce/orders/${orderId}`,
    )
      .then((o) => {
        setAmount(
          new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
          }).format(o.amountCents / 100),
        );
      })
      .catch(() => undefined);
  }, [orderId]);

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Thank you</p>
      <h1 className={styles.title}>Gift received</h1>
      <p className={styles.lead}>
        {amount
          ? `${amount} is on its way into youth programming.`
          : "Your support keeps the doors open."}
      </p>
      <p className={styles.copy}>
        <Link href="/" className={styles.link}>
          Back home
        </Link>
        {" · "}
        <Link href="/store" className={styles.link}>
          Store
        </Link>
      </p>
    </main>
  );
}

export default function DonateSuccessPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className={styles.main}>Loading…</main>}>
        <SuccessInner />
      </Suspense>
    </>
  );
}
