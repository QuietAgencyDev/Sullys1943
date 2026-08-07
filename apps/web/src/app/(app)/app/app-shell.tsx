"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./shell.module.css";

const NAV = [
  { href: "/app", label: "Home", icon: "⌂" },
  { href: "/app/book", label: "Book", icon: "＋" },
  { href: "/app/card", label: "Card", icon: "▣" },
  { href: "/app/calendar", label: "Today", icon: "▦" },
  { href: "/app/profile", label: "More", icon: "◎" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/app/login") ||
    pathname.startsWith("/app/register") ||
    pathname.startsWith("/app/forgot-password") ||
    pathname.startsWith("/app/reset-password");

  return (
    <div className={styles.shell}>
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
      </header>

      <main className={isAuthPage ? styles.mainAuth : styles.main}>
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
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
