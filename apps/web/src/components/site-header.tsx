import Image from "next/image";
import Link from "next/link";
import { getBrand } from "@/lib/brand";
import styles from "./site-header.module.css";

export function SiteHeader() {
  const brand = getBrand();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <Image
          src={brand.assets.logoPrimary}
          alt={brand.assets.logoAlt}
          width={56}
          height={72}
          priority
          sizes="(max-width: 767px) 52px, 56px"
          className={styles.logo}
        />
        <span className={styles.brandText}>
          <span className={styles.brandName}>{brand.copy.brandName}</span>
          <span className={styles.brandSub}>{brand.copy.brandSub}</span>
        </span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        {brand.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
