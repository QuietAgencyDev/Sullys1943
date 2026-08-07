"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError, get, patch } from "@/lib/api";
import styles from "../staff.module.css";

type Ticket = {
  id: string;
  status: string;
  memberName: string;
  allergenWarning: string | null;
  notes: string | null;
  createdAt: string;
  items: { name: string; quantity: number; allergens: string }[];
};

const NEXT: Record<string, string> = {
  placed: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "completed",
};

export default function KitchenKdsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await get<{ tickets: Ticket[] }>("/api/v1/kitchen/kds/feed");
      setTickets(res.tickets);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "KDS feed failed");
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  async function advance(id: string, status: string) {
    const next = NEXT[status];
    if (!next) return;
    await patch(`/api/v1/kitchen/orders/${id}/status`, { status: next });
    await load();
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>KITCHEN</p>
      <h1 className={styles.title}>KDS</h1>
      <p className={styles.copy}>
        Live tickets — allergen warnings highlighted. Auto-refreshes every 5s.
      </p>
      <p>
        <Link href="/">← Staff home</Link>
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}

      <ul className={styles.list}>
        {tickets.map((t) => (
          <li
            key={t.id}
            className={`${styles.item} ${t.allergenWarning ? styles.warn : ""}`}
          >
            <strong>
              {t.memberName} · {t.status}
            </strong>
            <div className={styles.meta}>
              {t.items
                .map((i) => `${i.quantity}× ${i.name}`)
                .join(", ")}
            </div>
            {t.allergenWarning ? (
              <div className={styles.error}>⚠ {t.allergenWarning}</div>
            ) : null}
            <div className={styles.actions}>
              {NEXT[t.status] ? (
                <button
                  type="button"
                  className={styles.buttonish}
                  onClick={() => advance(t.id, t.status)}
                >
                  Mark {NEXT[t.status]}
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {tickets.length === 0 ? (
          <li className={styles.item}>
            <span className={styles.meta}>No open kitchen tickets.</span>
          </li>
        ) : null}
      </ul>
    </main>
  );
}
