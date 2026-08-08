"use client";

import { useMemo, useState } from "react";
import { ApiError, post } from "@/lib/api";
import { STORE_PRODUCTS, formatPrice } from "@/lib/store-products";
import styles from "./store.module.css";

export function StoreCart() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      STORE_PRODUCTS.map((p) => ({
        product: p,
        qty: qty[p.id] ?? 0,
      })).filter((l) => l.qty > 0),
    [qty],
  );

  const total = lines.reduce(
    (n, l) => n + l.product.priceCents * l.qty,
    0,
  );

  function bump(id: string, delta: number) {
    setQty((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  async function checkout() {
    if (!lines.length) {
      setError("Add at least one item");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ checkoutUrl: string }>(
        "/api/v1/commerce/store/checkout",
        {
          items: lines.map((l) => ({
            productId: l.product.id,
            qty: l.qty,
          })),
          email: email.trim() || undefined,
          name: name.trim() || undefined,
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
    <section className={styles.desk} aria-label="Checkout">
      <h2 className={styles.subhead}>Checkout on Sully&apos;s</h2>
      <p className={styles.copy}>
        Native checkout (Moneris when configured · mock demo otherwise). Desk
        pickup still available.
      </p>
      <ul className={styles.cartList}>
        {STORE_PRODUCTS.map((p) => (
          <li key={p.id} className={styles.cartRow}>
            <span>
              {p.name} · {formatPrice(p.priceCents)}
            </span>
            <span className={styles.cartQty}>
              <button type="button" onClick={() => bump(p.id, -1)}>
                −
              </button>
              <strong>{qty[p.id] ?? 0}</strong>
              <button type="button" onClick={() => bump(p.id, 1)}>
                +
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.copy}>
        <strong>Total {formatPrice(total)}</strong>
      </p>
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
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.copy}>{message}</p> : null}
      <button
        type="button"
        className={styles.checkoutBtn}
        disabled={busy || total <= 0}
        onClick={() => void checkout()}
      >
        {busy ? "Starting…" : "Checkout"}
      </button>
    </section>
  );
}
