import Image from "next/image";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { getBrand } from "@/lib/brand";
import styles from "./hero.module.css";

export function Hero() {
  const brand = getBrand();

  return (
    <section className={styles.hero} aria-label={brand.gym.name}>
      <div className={styles.media} aria-hidden>
        <Image
          src={brand.assets.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.photo}
        />
        <div className={styles.mediaWash} />
        <div className={styles.mediaGrain} />
      </div>

      <div className={styles.content}>
        <Image
          src={brand.assets.logoPrimary}
          alt={brand.assets.logoAlt}
          width={220}
          height={280}
          priority
          className={styles.badge}
        />

        <p className={styles.eyebrow}>{brand.gym.tagline}</p>

        <h1 className={styles.manifesto}>
          {brand.copy.manifesto.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <p className={styles.lead}>{brand.copy.lead}</p>

        <div className={styles.actions}>
          <Link href={brand.copy.ctaPrimaryHref}>
            <Button variant="primary">{brand.copy.ctaPrimary}</Button>
          </Link>
          <Link href={brand.copy.ctaSecondaryHref}>
            <Button variant="secondary">{brand.copy.ctaSecondary}</Button>
          </Link>
          <Link href={brand.copy.ctaTertiaryHref}>
            <Button variant="ghost">{brand.copy.ctaTertiary}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
