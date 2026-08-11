import Image from "next/image";
import Link from "next/link";
import styles from "./site-header.module.css";

const NAV = [
  { href: "/legacy", label: "Legacy" },
  { href: "/coaches", label: "Coaches" },
  { href: "/classes", label: "Classes" },
  { href: "/programs", label: "Programs" },
  { href: "/donate", label: "Donate" },
  { href: "/store", label: "Store" },
  { href: "/contact", label: "Visit" },
  { href: "/join", label: "Join" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <Image
          src="/brand/sullys-logo-primary.png"
          alt="Sully's Boxing Gym"
          width={56}
          height={72}
          priority
          sizes="(max-width: 767px) 52px, 56px"
          className={styles.logo}
        />
        <span className={styles.brandText}>
          <span className={styles.brandName}>Sully&apos;s</span>
          <span className={styles.brandSub}>Boxing Gym · EST 1943</span>
        </span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
