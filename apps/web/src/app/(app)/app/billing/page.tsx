"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../ui.module.css";

type Invoice = {
  id: string;
  provider: string;
  type: string;
  status: string;
  amountCents: number;
  currency: string;
  productName: string;
  createdAt: string;
};

export default function BillingPage() {
  const [mode, setMode] = useState<"mock" | "stripe">("mock");
  const [hint, setHint] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    get<{ mode: "mock" | "stripe"; invoices: Invoice[] }>(
      "/api/v1/billing/history",
    )
      .then((res) => {
        setMode(res.mode);
        setInvoices(res.invoices);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      );

    get<{ mode: "mock" | "stripe"; hint?: string }>("/api/v1/billing/mode")
      .then((res) => setHint(res.hint ?? null))
      .catch(() => undefined);
  }, []);

  async function openPortal() {
    setPending(true);
    setError(null);
    setNote(null);
    try {
      const res = await post<{
        mode: string;
        url: string | null;
        message?: string;
      }>("/api/v1/billing/portal-session");
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setNote(res.message ?? "Portal unavailable in mock mode.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Portal failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Billing</p>
        <h1 className={styles.title}>Payments</h1>
        <p className={styles.lead}>
          Membership charges, drop-ins, and checkout history. Mode:{" "}
          <strong>{mode}</strong>
          {mode === "mock"
            ? " — add STRIPE_SECRET_KEY=sk_test_… to apps/api/.env, restart API, then /join uses live Stripe Checkout."
            : " — Customer Portal opens for members with a Stripe customer id."}
        </p>
        {hint ? <p className={styles.muted}>{hint}</p> : null}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.muted}>{note}</p> : null}

      <div className={styles.actionsRow}>
        <Button type="button" disabled={pending} onClick={openPortal}>
          {pending ? "Opening…" : "Stripe customer portal"}
        </Button>
        <Link href="/join">
          <Button type="button" variant="secondary">
            Buy / renew plan
          </Button>
        </Link>
      </div>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>History</h2>
        {invoices.length === 0 ? (
          <p className={styles.muted}>No payment events yet.</p>
        ) : (
          <ul className={styles.list}>
            {invoices.map((inv) => (
              <li key={inv.id} className={styles.row}>
                <div className={styles.rowTop}>
                  <div>
                    <p className={styles.rowTitle}>{inv.productName}</p>
                    <p className={styles.rowMeta}>
                      {new Date(inv.createdAt).toLocaleString()} · {inv.type} ·{" "}
                      {inv.provider}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p className={styles.rowTitle}>
                      ${(inv.amountCents / 100).toFixed(2)}{" "}
                      {inv.currency.toUpperCase()}
                    </p>
                    <span
                      className={
                        inv.status === "completed"
                          ? styles.badgeOk
                          : styles.badgeMuted
                      }
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/app/profile" className={styles.link}>
        ← Back to profile
      </Link>
    </div>
  );
}
