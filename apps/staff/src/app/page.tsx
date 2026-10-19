"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Badge, Button } from "@sullys/ui";
import { login, me } from "@/lib/auth";
import { GYM } from "@/lib/gym-info";
import styles from "./staff.module.css";

type Role = "coach" | "front_desk" | "admin" | "owner";
type User = { email: string; role: string; firstName?: string; lastName?: string };

const ACTIONS: {
  href: string;
  title: string;
  description: string;
  group: "Today" | "Floor" | "Operations";
  roles: readonly Role[];
  priority?: boolean;
}[] = [
  {
    href: "/coach",
    title: "Coach command",
    description: "Today’s classes, roster and Live Class Mode",
    group: "Today",
    roles: ["coach", "front_desk", "admin", "owner"],
    priority: true,
  },
  {
    href: "/desk",
    title: "Desk check-in",
    description: "Scan member cards, review blockers and record overrides",
    group: "Today",
    roles: ["front_desk", "admin", "owner"],
    priority: true,
  },
  {
    href: "/coach/roster",
    title: "Coach roster",
    description: "Attendance, boxing cards, XP and assessments",
    group: "Floor",
    roles: ["coach", "admin", "owner"],
  },
  {
    href: "/coach/builder",
    title: "Class builder",
    description: "Prepare reusable workouts for Live Mode",
    group: "Floor",
    roles: ["coach", "admin", "owner"],
  },
  {
    href: "/coach/messages",
    title: "Messages",
    description: "Member threads and class broadcasts",
    group: "Today",
    roles: ["coach", "admin", "owner"],
  },
  {
    href: "/desk/kiosk",
    title: "Door kiosk",
    description: "Launch the fullscreen member check-in station",
    group: "Floor",
    roles: ["front_desk", "admin", "owner"],
  },
  {
    href: "/desk/dry-run",
    title: "Opening check",
    description: "Test scanner, API and floor readiness",
    group: "Operations",
    roles: ["front_desk", "admin", "owner"],
  },
  {
    href: "/coach/analytics",
    title: "Coach analytics",
    description: "Classes taught, attendance and challenge results",
    group: "Operations",
    roles: ["coach", "admin", "owner"],
  },
  {
    href: "/kitchen",
    title: "Kitchen display",
    description: "Allergen-aware orders and ticket status",
    group: "Operations",
    roles: ["admin", "owner"],
  },
  {
    href: "/owner",
    title: "Owner brief",
    description: "Membership, revenue, waivers and broadcasts",
    group: "Operations",
    roles: ["admin", "owner"],
    priority: true,
  },
  {
    href: "/admin/users",
    title: "People and access",
    description: "Invite staff, change roles and disable access",
    group: "Operations",
    roles: ["admin", "owner"],
  },
];

const ROLE_LABEL: Record<Role, string> = {
  coach: "Coach",
  front_desk: "Front desk",
  admin: "Administrator",
  owner: "Owner",
};

const ROLE_TITLE: Record<Role, string> = {
  coach: "Coach Corner",
  front_desk: "Front Desk",
  admin: "Gym Operations",
  owner: "Owner Command",
};

const WEB_ORIGIN =
  process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "https://www.sullys1943.com";

export default function StaffHome() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const role =
    user && user.role in ROLE_LABEL ? (user.role as Role) : null;
  const visibleActions = role
    ? ACTIONS.filter((action) => action.roles.includes(role))
    : [];

  return (
    <main className={`${styles.main} ${styles.woodFrameScreen}`}>
      <div className={styles.headingRow}>
        <div className={styles.staffBrandHero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${WEB_ORIGIN}/brand/sullys-logo-primary.png`}
            alt="Sully's Boxing Gym"
            className={styles.staffLogo}
          />
          <div>
            <p className={styles.eyebrow}>STAFF / COMMAND CENTER</p>
            <h1 className={styles.title}>
              {role ? ROLE_TITLE[role] : "Gym Operations"}
            </h1>
          </div>
        </div>
        {role ? <Badge tone="accent">{ROLE_LABEL[role]}</Badge> : null}
      </div>
      <p className={styles.copy}>
        Everything needed to open the gym, run the floor and recover quickly.
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
              placeholder="you@sullys1943.com"
              autoComplete="email"
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className={styles.hint}>Use your assigned Sully&apos;s staff account.</p>
        </form>
      ) : (
        <>
          <div className={styles.sessionBar}>
            <span className={styles.sessionDot} aria-hidden />
            <span>
              Signed in as{" "}
              <strong>
                {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.email}
              </strong>
            </span>
          </div>

          {role ? (
            <nav className={styles.commandSections} aria-label="Staff tools">
              {(["Today", "Floor", "Operations"] as const).map((group) => {
                const actions = visibleActions.filter(
                  (action) => action.group === group,
                );
                if (actions.length === 0) return null;
                return (
                  <section key={group} className={styles.commandSection}>
                    <div className={styles.sectionHeading}>
                      <h2>{group}</h2>
                      <span>{actions.length} tools</span>
                    </div>
                    <div className={styles.nav}>
                      {actions.map((action) => (
                        <Link
                          key={action.href}
                          className={`${styles.navCard} ${
                            action.priority ? styles.navCardPriority : ""
                          }`}
                          href={action.href}
                        >
                          <span className={styles.navCardCopy}>
                            <strong>{action.title}</strong>
                            <span>{action.description}</span>
                          </span>
                          <span className={styles.navArrow} aria-hidden>
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}

              <section className={styles.commandSection}>
                <div className={styles.sectionHeading}>
                  <h2>Screens &amp; help</h2>
                  <span>New window</span>
                </div>
                <div className={styles.nav}>
                  <a
                    className={styles.navCard}
                    href={
                      (process.env.NEXT_PUBLIC_WEB_ORIGIN ??
                        "http://localhost:3000") + "/tv/floor"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className={styles.navCardCopy}>
                      <strong>Floor TV</strong>
                      <span>Timer, leaderboard and live class moments</span>
                    </span>
                    <span className={styles.navArrow} aria-hidden>
                      ↗
                    </span>
                  </a>
                  {role !== "coach" ? (
                    <a
                      className={styles.navCard}
                      href={
                        (process.env.NEXT_PUBLIC_WEB_ORIGIN ??
                          "http://localhost:3000") + "/tv/reception"
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className={styles.navCardCopy}>
                        <strong>Reception TV</strong>
                        <span>Schedule, announcements and welcome ticker</span>
                      </span>
                      <span className={styles.navArrow} aria-hidden>
                        ↗
                      </span>
                    </a>
                  ) : null}
                  <a
                    className={styles.navCard}
                    href={
                      (process.env.NEXT_PUBLIC_WEB_ORIGIN ??
                        "http://localhost:3000") + "/manuals"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className={styles.navCardCopy}>
                      <strong>Guides and recovery</strong>
                      <span>Task guides for staff, coaches and screens</span>
                    </span>
                    <span className={styles.navArrow} aria-hidden>
                      ↗
                    </span>
                  </a>
                </div>
              </section>
            </nav>
          ) : (
            <p className={styles.error}>
              This account does not have a supported staff role.
            </p>
          )}
        </>
      )}
    </main>
  );
}
