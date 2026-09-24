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
    yesterdayCents: number;
    monthCents: number;
    monthByTender: Record<string, number>;
    monthWalkInCents: number;
    currency: string;
  };
  comparison: {
    checkInsToday: number;
    checkInsYesterday: number;
    revenueDeltaCents: number;
    checkInDelta: number;
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

  const attentionCount =
    (brief?.kpis.pendingPayments ? 1 : 0) +
    (brief?.kpis.pendingWaivers ? 1 : 0) +
    (brief?.kpis.kitchenOpenTickets ? 1 : 0) +
    (brief?.overrides.length ? 1 : 0);

  return (
    <main className={`${styles.main} ${styles.ownerMain}`}>
      <header className={styles.ownerHeader}>
        <div>
          <p className={styles.eyebrow}>OWNER COMMAND</p>
          <h1 className={styles.title}>The gym, at a glance</h1>
          <p className={styles.copy}>
            Money, members and today&apos;s floor—organized around what needs
            your attention.
          </p>
        </div>
        <div className={styles.ownerHeaderActions}>
          <span className={styles.liveStatus}>
            <i aria-hidden />
            Live · 15s refresh
          </span>
          <Link className={styles.backLink} href="/">
            Staff command →
          </Link>
        </div>
      </header>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {!brief || !analytics ? (
        <div className={styles.ownerLoading}>
          <span aria-hidden />
          <p>Building today&apos;s owner brief…</p>
        </div>
      ) : (
        <>
          <section className={styles.ownerHero} aria-labelledby="today-heading">
            <div className={styles.revenueLead}>
              <p className={styles.metricLabel} id="today-heading">
                Revenue today
              </p>
              <strong>{money(analytics.revenue.todayCents)}</strong>
              <span>
                {tenderLines(
                  analytics.revenue.todayByTender,
                  analytics.revenue.currency,
                )}
              </span>
              <small>
                {analytics.comparison.revenueDeltaCents >= 0 ? "+" : ""}
                {money(analytics.comparison.revenueDeltaCents)} vs yesterday
              </small>
            </div>
            <div className={styles.ownerPulse}>
              <div>
                <strong>{brief.kpis.checkInsToday}</strong>
                <span>Check-ins</span>
                <small>
                  {analytics.comparison.checkInDelta >= 0 ? "+" : ""}
                  {analytics.comparison.checkInDelta} vs yesterday
                </small>
              </div>
              <div>
                <strong>{brief.kpis.classesToday}</strong>
                <span>Classes</span>
              </div>
              <div>
                <strong>{analytics.memberships.activeTotal}</strong>
                <span>Active members</span>
              </div>
              <div>
                <strong>{money(analytics.revenue.monthCents)}</strong>
                <span>Month revenue</span>
              </div>
            </div>
          </section>

          <section
            className={`${styles.attentionPanel} ${
              attentionCount === 0 ? styles.attentionClear : ""
            }`}
          >
            <div className={styles.attentionHeading}>
              <div>
                <p className={styles.metricLabel}>Owner attention</p>
                <h2>
                  {attentionCount === 0
                    ? "Gym operations are clear"
                    : `${attentionCount} areas need a look`}
                </h2>
              </div>
              <span>{attentionCount === 0 ? "All clear" : "Today"}</span>
            </div>
            <div className={styles.attentionGrid}>
              <div>
                <strong>{brief.kpis.pendingPayments}</strong>
                <span>Pending payments</span>
              </div>
              <div>
                <strong>{brief.kpis.pendingWaivers}</strong>
                <span>Unsigned waivers</span>
              </div>
              <div>
                <strong>{brief.kpis.kitchenOpenTickets}</strong>
                <span>Kitchen tickets</span>
              </div>
              <div>
                <strong>{brief.overrides.length}</strong>
                <span>Staff overrides</span>
              </div>
            </div>
          </section>

          <div className={styles.ownerGrid}>
            <section className={styles.ownerSection}>
              <div className={styles.ownerSectionHeading}>
                <div>
                  <p className={styles.metricLabel}>Floor pulse</p>
                  <h2>Classes today</h2>
                </div>
                <Link href="/coach">Coach command →</Link>
              </div>
              <ul className={styles.classBriefList}>
                {brief.classes.map((c) => (
                  <li key={c.id}>
                    <div className={styles.classBriefTime}>
                      <strong>
                        {new Date(c.startsAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </strong>
                      <span>{c.program}</span>
                    </div>
                    <div className={styles.classBriefBody}>
                      <strong>{c.title}</strong>
                      <span>
                        {c.checkedIn}/{c.booked} checked in · {c.booked}/
                        {c.capacity} booked
                      </span>
                      <div aria-hidden>
                        <i style={{ width: `${Math.min(100, c.fillPct)}%` }} />
                      </div>
                    </div>
                    <strong className={styles.classFill}>{c.fillPct}%</strong>
                  </li>
                ))}
                {brief.classes.length === 0 ? (
                  <li className={styles.emptyState}>No classes scheduled today.</li>
                ) : null}
              </ul>
            </section>

            <section className={styles.ownerSection}>
              <div className={styles.ownerSectionHeading}>
                <div>
                  <p className={styles.metricLabel}>Business health</p>
                  <h2>Memberships</h2>
                </div>
                <strong>{analytics.memberships.activeTotal} active</strong>
              </div>
              <div className={styles.memberSplit}>
                <div>
                  <strong>{analytics.memberships.youthKids}</strong>
                  <span>Kids / youth</span>
                </div>
                <div>
                  <strong>{analytics.memberships.adult}</strong>
                  <span>Adults</span>
                </div>
                <div>
                  <strong>{analytics.memberships.dropInActive}</strong>
                  <span>Drop-in active</span>
                </div>
              </div>
              <ul className={styles.productList}>
                {analytics.memberships.byProduct.map((product) => (
                  <li key={product.code}>
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.code}</small>
                    </span>
                    <span>
                      {product.count} plans · {product.memberSeats} seats
                    </span>
                  </li>
                ))}
                {analytics.memberships.byProduct.length === 0 ? (
                  <li className={styles.emptyState}>No active memberships.</li>
                ) : null}
              </ul>
            </section>
          </div>

          <div className={styles.ownerGrid}>
            <section className={styles.ownerSection}>
              <div className={styles.ownerSectionHeading}>
                <div>
                  <p className={styles.metricLabel}>Revenue detail</p>
                  <h2>Money to Sully&apos;s</h2>
                </div>
                <span className={styles.systemChip}>{analytics.billingMode}</span>
              </div>
              <div className={styles.financeGrid}>
                <div>
                  <span>This month</span>
                  <strong>{money(analytics.revenue.monthCents)}</strong>
                  <small>
                    {tenderLines(
                      analytics.revenue.monthByTender,
                      analytics.revenue.currency,
                    )}
                  </small>
                </div>
                <div>
                  <span>Walk-ins today</span>
                  <strong>{money(analytics.revenue.todayWalkInCents)}</strong>
                  <small>{analytics.walkIns.salesToday} sales</small>
                </div>
              </div>
            </section>

            <section className={styles.ownerSection}>
              <div className={styles.ownerSectionHeading}>
                <div>
                  <p className={styles.metricLabel}>Member records</p>
                  <h2>Waivers &amp; demographics</h2>
                </div>
              </div>
              <div className={styles.recordGrid}>
                <div>
                  <strong>{analytics.waivers.signedToday}</strong>
                  <span>Waivers today</span>
                </div>
                <div>
                  <strong>{analytics.demographics.kidsYouth}</strong>
                  <span>Under 18</span>
                </div>
                <div>
                  <strong>{analytics.demographics.adults}</strong>
                  <span>Adults</span>
                </div>
                <div>
                  <strong>{analytics.demographics.unknownAge}</strong>
                  <span>DOB missing</span>
                </div>
              </div>
              <p className={styles.sectionNote}>{analytics.demographics.note}</p>
            </section>
          </div>

          <div className={styles.ownerGrid}>
            <section className={styles.ownerSection}>
              <div className={styles.ownerSectionHeading}>
                <div>
                  <p className={styles.metricLabel}>Communications</p>
                  <h2>Message a group</h2>
                </div>
              </div>
              <form className={styles.broadcastForm} onSubmit={sendGroupMessage}>
                <label className={styles.field}>
                  <span>Audience</span>
                  <select
                    className={styles.input}
                    value={msgSegment}
                    onChange={(e) => setMsgSegment(e.target.value)}
                  >
                    {SEGMENTS.map((segment) => (
                      <option key={segment.value} value={segment.value}>
                        {segment.label}
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
                    className={`${styles.input} ${styles.messageInput}`}
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    rows={4}
                    required
                    placeholder="Write to this membership group…"
                  />
                </label>
                <div className={styles.broadcastAction}>
                  <Button type="submit" disabled={msgBusy || !msgBody.trim()}>
                    {msgBusy ? "Sending…" : "Send broadcast"}
                  </Button>
                  <span>Sent through the existing member message pipeline.</span>
                </div>
                {msgResult ? (
                  <p className={styles.broadcastResult} role="status">
                    {msgResult}
                  </p>
                ) : null}
              </form>
            </section>

            <section className={styles.ownerSection}>
              <div className={styles.ownerSectionHeading}>
                <div>
                  <p className={styles.metricLabel}>Controls &amp; audit</p>
                  <h2>Operations</h2>
                </div>
              </div>
              <div className={styles.systemStatus}>
                <span>
                  <i
                    className={
                      analytics.quickbooks.connected
                        ? styles.statusGood
                        : styles.statusPlanned
                    }
                    aria-hidden
                  />
                  QuickBooks
                </span>
                <strong>
                  {analytics.quickbooks.connected ? "Connected" : "Planned"}
                </strong>
                <p>{analytics.quickbooks.note}</p>
              </div>
              <h3 className={styles.auditTitle}>Staff overrides today</h3>
              <ul className={styles.auditList}>
                {brief.overrides.map((override) => (
                  <li key={override.id}>
                    <strong>{override.member}</strong>
                    <span>
                      {new Date(override.at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {override.flags || "override"}
                      {override.reason ? ` · ${override.reason}` : ""}
                    </span>
                  </li>
                ))}
                {brief.overrides.length === 0 ? (
                  <li className={styles.emptyState}>No overrides today.</li>
                ) : null}
              </ul>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
