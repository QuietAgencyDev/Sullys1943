import Image from "next/image";
import Link from "next/link";
import styles from "./site-header.module.css";

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
          className={styles.logo}
        />
        <span className={styles.brandText}>
          <span className={styles.brandName}>Sully&apos;s</span>
          <span className={styles.brandSub}>Boxing Gym · EST 1943</span>
        </span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/programs">Programs</Link>
        <Link href="/coaches">Coaches</Link>
        <Link href="/legacy">Legacy</Link>
        <Link href="/store">Store</Link>
        <Link href="/donate">Donate</Link>
        <Link href="/contact">Visit</Link>
        <Link href="/join">Join</Link>
      </nav>
    </header>
  );
}
