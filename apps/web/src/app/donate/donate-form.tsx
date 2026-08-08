"use client";

import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import styles from "./donate.module.css";

const PRESETS = [2500, 5000, 10000, 25000];

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function DonateForm() {
  const [amountCents, setAmountCents] = useState(5000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cents = custom
      ? Math.round(parseFloat(custom) * 100)
      : amountCents;
    if (!Number.isFinite(cents) || cents < 500) {
      setError("Minimum gift is $5");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ checkoutUrl: string }>(
        "/api/v1/commerce/donate/checkout",
        {
          amountCents: cents,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          message: message.trim() || undefined,
        },
      );
      window.location.href = res.checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.way} onSubmit={(e) => void submit(e)}>
      <h3 className={styles.wayLabel}>Give online</h3>
      <p className={styles.copy}>
        Secure checkout (Moneris when configured · mock demo otherwise).
      </p>
      <div className={styles.actions}>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={styles.preset}
            data-active={!custom && amountCents === p ? "true" : "false"}
            onClick={() => {
              setAmountCents(p);
              setCustom("");
            }}
          >
            {formatCad(p)}
          </button>
        ))}
      </div>
      <label className={styles.field}>
        Custom amount (CAD)
        <input
          className={styles.input}
          inputMode="decimal"
          placeholder="e.g. 75"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Name
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Email
        <input
          className={styles.input}
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Note (optional)
        <input
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.submit} disabled={busy}>
        {busy ? "Starting…" : "Continue to checkout"}
      </button>
    </form>
  );
}
