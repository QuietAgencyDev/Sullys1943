"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { login, me } from "@/lib/auth";
import { GYM } from "@/lib/gym-info";
import styles from "./staff.module.css";

type User = { email: string; role: string; firstName?: string; lastName?: string };

export default function StaffHome() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("desk@sullys.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    me().then((data) => {
      if (!data) return;
      if (data.user) setUser(data.user);
      else if (data.email) setUser(data as User);
    });
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const data = await login(email, password);
      setUser(data.user ?? data);
    } catch {
      setError("Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>STAFF / COMMAND CENTER</p>
      <h1 className={styles.title}>Front Desk</h1>
      <p className={styles.copy}>
        Desk scanner, coach roster, and kitchen KDS for the live floor.
      </p>
      <div className={styles.softLaunch}>
        <p className={styles.softLaunchTitle}>{GYM.name}</p>
        <p className={styles.softLaunchMeta}>
          <a href={GYM.mapUrl} target="_blank" rel="noreferrer">
            {GYM.addressLine1}, {GYM.addressLine2}
          </a>
        </p>
        <p className={styles.softLaunchMeta}>
          <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a>
          {" · "}
          {GYM.hoursSummary}
        </p>
      </div>

      {!user ? (
        <form className={styles.panel} onSubmit={onLogin}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className={styles.hint}>
            Try desk@ / coach@ / admin@ / owner@sullys.local · password123
          </p>
        </form>
      ) : (
        <>
          <p className={styles.copy}>
            Signed in as {user.email} ({user.role})
          </p>
          <nav className={styles.nav}>
            {(user.role === "coach" ||
              user.role === "admin" ||
              user.role === "owner" ||
              user.role === "front_desk") && (
              <Link className={styles.navCard} href="/coach">
                <strong>Coach Command Center</strong>
                <span>
                  Today&apos;s classes · Live Class Mode · coach timer control
                </span>
              </Link>
            )}
            {(user.role === "coach" ||
              user.role === "admin" ||
              user.role === "owner") && (
              <>
                <Link className={styles.navCard} href="/coach/roster">
                  <strong>Coach roster</strong>
                  <span>Boxing Card · XP · assessments · present</span>
                </Link>
                <Link className={styles.navCard} href="/coach/builder">
                  <strong>Class builder</strong>
                  <span>Workout templates for Live Mode</span>
                </Link>
                <Link className={styles.navCard} href="/coach/analytics">
                  <strong>Coach analytics</strong>
                  <span>Classes taught · attendance · challenges</span>
                </Link>
                <Link className={styles.navCard} href="/coach/messages">
                  <strong>Coach messages</strong>
                  <span>Direct threads + class broadcast</span>
                </Link>
              </>
            )}
            {(user.role === "front_desk" ||
              user.role === "admin" ||
              user.role === "owner") && (
              <>
                <Link className={styles.navCard} href="/desk">
                  <strong>Desk scanner</strong>
                  <span>QR / USB wedge + session + staff override</span>
                </Link>
                <Link className={styles.navCard} href="/desk/kiosk">
                  <strong>Door kiosk mode</strong>
                  <span>Fullscreen auto-scan · member QR → check-in</span>
                </Link>
                <Link className={styles.navCard} href="/desk/dry-run">
                  <strong>Scanner dry-run</strong>
                  <span>API checks + floor checklist before USB arrives</span>
                </Link>
              </>
            )}
            <a
              className={styles.navCard}
              href={
                (process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "http://localhost:3000") +
                "/tv/floor"
              }
              target="_blank"
              rel="noreferrer"
            >
              <strong>Floor TV</strong>
              <span>Coach-synced timer · leaderboard · announcements</span>
            </a>
            {(user.role === "admin" ||
              user.role === "owner" ||
              user.role === "front_desk") && (
              <a
                className={styles.navCard}
                href={
                  (process.env.NEXT_PUBLIC_WEB_ORIGIN ??
                    "http://localhost:3000") + "/tv/reception"
                }
                target="_blank"
                rel="noreferrer"
              >
                <strong>Reception TV</strong>
                <span>Welcome ticker + today&apos;s schedule</span>
              </a>
            )}
            {(user.role === "admin" || user.role === "owner") && (
              <>
                <Link className={styles.navCard} href="/kitchen">
                  <strong>Kitchen KDS</strong>
                  <span>Allergen-aware tickets and status board</span>
                </Link>
                <Link className={styles.navCard} href="/owner">
                  <strong>Owner desk</strong>
                  <span>
                    Memberships, revenue, waivers, walk-ins, demographics,
                    group messages
                  </span>
                </Link>
                <Link className={styles.navCard} href="/admin/users">
                  <strong>Staff user admin</strong>
                  <span>Invite, role change, disable desk/coach accounts</span>
                </Link>
              </>
            )}
            <a
              className={styles.navCard}
              href={
                (process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "http://localhost:3000") +
                "/manuals"
              }
              target="_blank"
              rel="noreferrer"
            >
              <strong>PDF manuals</strong>
              <span>Owner/staff ops + member/family user guides</span>
            </a>
          </nav>
        </>
      )}
    </main>
  );
}
