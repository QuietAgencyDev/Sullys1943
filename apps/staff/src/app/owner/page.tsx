"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, get } from "@/lib/api";
import styles from "../staff.module.css";

type Brief = {
  asOf: string;
  stripeMode: string;
  kpis: {
    checkInsToday: number;
    activeMemberships: number;
    pendingPayments: number;
    pendingWaivers: number;
    kitchenOpenTickets: number;
    classesToday: number;
  };
  classes: {
    id: string;
    title: string;
    program: string;
    startsAt: string;
    capacity: number;
    booked: number;
    checkedIn: number;
    fillPct: number;
  }[];
  overrides: {
    id: string;
    at: string;
    member: string;
    reason: string | null;
    flags: string;
  }[];
};

export default function OwnerBriefPage() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      get<Brief>("/api/v1/owner/morning-brief")
        .then(setBrief)
        .catch((err) =>
          setError(err instanceof ApiError ? err.message : "Failed to load"),
        );
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>OWNER</p>
      <h1 className={styles.title}>Morning brief</h1>
      <p className={styles.copy}>
        Today&apos;s floor pulse — check-ins, class fill, kitchen, waivers,
        overrides. Refreshes every 15s.
      </p>
      <p>
        <Link href="/">← Staff home</Link>
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {!brief ? (
        <p className={styles.meta}>Loading brief…</p>
      ) : (
        <>
          <div className={styles.row}>
            <div className={styles.item}>
              <strong>{brief.kpis.checkInsToday}</strong>
              <div className={styles.meta}>Check-ins today</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.activeMemberships}</strong>
              <div className={styles.meta}>Active memberships</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.pendingPayments}</strong>
              <div className={styles.meta}>Pending payments</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.pendingWaivers}</strong>
              <div className={styles.meta}>Unsigned waivers</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.kitchenOpenTickets}</strong>
              <div className={styles.meta}>Kitchen open</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.stripeMode}</strong>
              <div className={styles.meta}>Billing mode</div>
            </div>
          </div>

          <h2 className={styles.copy}>Classes today</h2>
          <ul className={styles.list}>
            {brief.classes.map((c) => (
              <li key={c.id} className={styles.item}>
                <strong>
                  {new Date(c.startsAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {c.title}
                </strong>
                <div className={styles.meta}>
                  {c.program} · {c.checkedIn}/{c.booked} checked in ·{" "}
                  {c.fillPct}% filled ({c.booked}/{c.capacity})
                </div>
              </li>
            ))}
            {brief.classes.length === 0 ? (
              <li className={styles.item}>
                <span className={styles.meta}>No classes scheduled today.</span>
              </li>
            ) : null}
          </ul>

          <h2 className={styles.copy}>Staff overrides today</h2>
          <ul className={styles.list}>
            {brief.overrides.map((o) => (
              <li key={o.id} className={`${styles.item} ${styles.warn}`}>
                <strong>{o.member}</strong>
                <div className={styles.meta}>
                  {new Date(o.at).toLocaleTimeString()} · {o.flags || "override"}
                  {o.reason ? ` · ${o.reason}` : ""}
                </div>
              </li>
            ))}
            {brief.overrides.length === 0 ? (
              <li className={styles.item}>
                <span className={styles.meta}>No overrides yet today.</span>
              </li>
            ) : null}
          </ul>
        </>
      )}
    </main>
  );
}
