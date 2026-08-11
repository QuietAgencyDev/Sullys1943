"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
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

type Analytics = {
  asOf: string;
  memberships: {
    activeTotal: number;
    youthKids: number;
    adult: number;
    dropInActive: number;
    byProduct: {
      code: string;
      name: string;
      count: number;
      memberSeats: number;
    }[];
  };
  revenue: {
    todayCents: number;
    todayByTender: Record<string, number>;
    todayWalkInCents: number;
    monthCents: number;
    monthByTender: Record<string, number>;
    monthWalkInCents: number;
    currency: string;
  };
  waivers: { signedToday: number; pendingUnsigned: number };
  walkIns: {
    salesToday: number;
    checkInsToday: number;
    amountCentsToday: number;
  };
  demographics: {
    membersWithDob: number;
    kidsYouth: number;
    adults: number;
    unknownAge: number;
    note: string;
  };
  billingMode: string;
  quickbooks: { connected: boolean; status: string; note: string };
};

const SEGMENTS = [
  { value: "all_active", label: "All active members" },
  { value: "youth", label: "Kids / youth memberships" },
  { value: "adult", label: "Adult memberships (monthly + trial)" },
  { value: "monthly", label: "Monthly only" },
  { value: "trial", label: "Trial only" },
  { value: "drop_in", label: "Drop-in / walk-in product" },
  { value: "unsigned_waiver", label: "Unsigned waivers" },
] as const;

function money(cents: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function tenderLines(byTender: Record<string, number>, currency: string) {
  const entries = Object.entries(byTender);
  if (entries.length === 0) return "—";
  return entries
    .map(([k, v]) => `${k.toUpperCase()} ${money(v, currency)}`)
    .join(" · ");
}

export default function OwnerBriefPage() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msgSegment, setMsgSegment] = useState<string>("all_active");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgBusy, setMsgBusy] = useState(false);
  const [msgResult, setMsgResult] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      Promise.all([
        get<Brief>("/api/v1/owner/morning-brief"),
        get<Analytics>("/api/v1/owner/analytics"),
      ])
        .then(([b, a]) => {
          setBrief(b);
          setAnalytics(a);
          setError(null);
        })
        .catch((err) =>
          setError(err instanceof ApiError ? err.message : "Failed to load"),
        );
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  async function sendGroupMessage(e: FormEvent) {
    e.preventDefault();
    setMsgBusy(true);
    setMsgResult(null);
    setError(null);
    try {
      const res = await post<{
        recipientCount: number;
        segment: string;
        thread: { id: string };
      }>("/api/v1/owner/messages/broadcast", {
        segment: msgSegment,
        subject: msgSubject.trim() || undefined,
        body: msgBody.trim(),
      });
      setMsgResult(
        `Sent to ${res.recipientCount} member(s) in “${res.segment}”.`,
      );
      setMsgBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Broadcast failed");
    } finally {
      setMsgBusy(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>OWNER</p>
      <h1 className={styles.title}>Owner desk</h1>
      <p className={styles.copy}>
        Membership mix, money to Sully&apos;s, waivers, walk-ins, demographics,
        and group messages. Refreshes every 15s.
      </p>
      <p>
        <Link href="/">← Staff home</Link>
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {!brief || !analytics ? (
        <p className={styles.meta}>Loading owner data…</p>
      ) : (
        <>
          <h2 className={styles.copy}>Money to Sully&apos;s</h2>
          <div className={styles.row}>
            <div className={styles.item}>
              <strong>{money(analytics.revenue.todayCents)}</strong>
              <div className={styles.meta}>
                Today · {tenderLines(analytics.revenue.todayByTender, analytics.revenue.currency)}
              </div>
            </div>
            <div className={styles.item}>
              <strong>{money(analytics.revenue.monthCents)}</strong>
              <div className={styles.meta}>
                This month ·{" "}
                {tenderLines(
                  analytics.revenue.monthByTender,
                  analytics.revenue.currency,
                )}
              </div>
            </div>
            <div className={styles.item}>
              <strong>{money(analytics.revenue.todayWalkInCents)}</strong>
              <div className={styles.meta}>Walk-in $ today</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.billingMode}</strong>
              <div className={styles.meta}>Billing mode</div>
            </div>
          </div>

          <h2 className={styles.copy}>Memberships</h2>
          <div className={styles.row}>
            <div className={styles.item}>
              <strong>{analytics.memberships.youthKids}</strong>
              <div className={styles.meta}>Kids / youth</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.memberships.adult}</strong>
              <div className={styles.meta}>Adult (monthly + trial)</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.memberships.activeTotal}</strong>
              <div className={styles.meta}>Active total</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.pendingPayments}</strong>
              <div className={styles.meta}>Pending payments</div>
            </div>
          </div>
          <ul className={styles.list}>
            {analytics.memberships.byProduct.map((p) => (
              <li key={p.code} className={styles.item}>
                <strong>
                  {p.name} ({p.code})
                </strong>
                <div className={styles.meta}>
                  {p.count} memberships · {p.memberSeats} seats
                </div>
              </li>
            ))}
            {analytics.memberships.byProduct.length === 0 ? (
              <li className={styles.item}>
                <span className={styles.meta}>No active memberships.</span>
              </li>
            ) : null}
          </ul>

          <h2 className={styles.copy}>Waivers & walk-ins</h2>
          <div className={styles.row}>
            <div className={styles.item}>
              <strong>{analytics.waivers.signedToday}</strong>
              <div className={styles.meta}>Waivers signed today</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.waivers.pendingUnsigned}</strong>
              <div className={styles.meta}>Unsigned waivers</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.walkIns.salesToday}</strong>
              <div className={styles.meta}>Walk-in sales today</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.walkIns.checkInsToday}</strong>
              <div className={styles.meta}>Walk-in check-ins</div>
            </div>
          </div>

          <h2 className={styles.copy}>Client demographics</h2>
          <div className={styles.row}>
            <div className={styles.item}>
              <strong>{analytics.demographics.kidsYouth}</strong>
              <div className={styles.meta}>Under 18 (DOB)</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.demographics.adults}</strong>
              <div className={styles.meta}>18+ (DOB)</div>
            </div>
            <div className={styles.item}>
              <strong>{analytics.demographics.unknownAge}</strong>
              <div className={styles.meta}>No DOB on file</div>
            </div>
          </div>
          <p className={styles.meta}>{analytics.demographics.note}</p>

          <h2 className={styles.copy}>Message a group</h2>
          <form className={styles.panel} onSubmit={sendGroupMessage}>
            <label className={styles.field}>
              <span>Segment</span>
              <select
                className={styles.input}
                value={msgSegment}
                onChange={(e) => setMsgSegment(e.target.value)}
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Subject (optional)</span>
              <input
                className={styles.input}
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                placeholder="Gym update"
              />
            </label>
            <label className={styles.field}>
              <span>Message</span>
              <textarea
                className={styles.input}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                rows={4}
                required
                placeholder="Write to this membership group…"
                style={{ minHeight: 96, paddingTop: 10, paddingBottom: 10 }}
              />
            </label>
            <Button type="submit" disabled={msgBusy || !msgBody.trim()}>
              {msgBusy ? "Sending…" : "Send to group"}
            </Button>
            {msgResult ? <p className={styles.copy}>{msgResult}</p> : null}
          </form>

          <h2 className={styles.copy}>QuickBooks</h2>
          <div className={styles.item}>
            <strong>
              {analytics.quickbooks.connected
                ? "Connected"
                : "Not connected (planned)"}
            </strong>
            <div className={styles.meta}>{analytics.quickbooks.note}</div>
          </div>

          <h2 className={styles.copy}>Floor pulse (today)</h2>
          <div className={styles.row}>
            <div className={styles.item}>
              <strong>{brief.kpis.checkInsToday}</strong>
              <div className={styles.meta}>Check-ins</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.kitchenOpenTickets}</strong>
              <div className={styles.meta}>Kitchen open</div>
            </div>
            <div className={styles.item}>
              <strong>{brief.kpis.classesToday}</strong>
              <div className={styles.meta}>Classes</div>
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
