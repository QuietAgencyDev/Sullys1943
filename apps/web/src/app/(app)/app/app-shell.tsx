"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./shell.module.css";

const NAV = [
  { href: "/app", label: "Home", icon: "home" },
  { href: "/app/book", label: "Book", icon: "book" },
  { href: "/app/card", label: "Card", icon: "card" },
  { href: "/app/calendar", label: "Today", icon: "calendar" },
  { href: "/app/profile", label: "More", icon: "profile" },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="m3 11 9-8 9 8v9H6v-7" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M5 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" />
        <path d="M8 9h7M8 13h5" />
      </svg>
    );
  }
  if (name === "card") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 15h4M15 9h2" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/app/login") ||
    pathname.startsWith("/app/register") ||
    pathname.startsWith("/app/forgot-password") ||
    pathname.startsWith("/app/reset-password");

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#member-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link href="/app" className={styles.brand}>
          <Image
            src="/brand/sullys-logo-primary.png"
            alt="Sully's Boxing Gym"
            width={40}
            height={52}
            priority
            className={styles.logo}
          />
          <span>
            <span className={styles.brandName}>Sully&apos;s</span>
            <span className={styles.brandSub}>Member Portal</span>
          </span>
        </Link>
        {!isAuthPage ? (
          <Link className={styles.headerAction} href="/app/messages">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M4 5h16v11H8l-4 4Z" />
              <path d="M8 9h8M8 12h5" />
            </svg>
            <span>Messages</span>
          </Link>
        ) : null}
      </header>

      <main
        id="member-content"
        className={isAuthPage ? styles.mainAuth : styles.main}
      >
        {children}
      </main>

      {!isAuthPage ? (
        <nav className={styles.bottomNav} aria-label="Member">
          {NAV.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.navIcon}>
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
