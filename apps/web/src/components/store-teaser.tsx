import Image from "next/image";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { STORE_PRODUCTS, formatPrice } from "@/lib/store-products";
import styles from "./store-teaser.module.css";

const FEATURED_IDS = [
  "adult-hand-wraps",
  "sullys-boxing-gloves-black",
  "sullys-baseball-hat",
  "sullys-boxing-gym-t-shirts",
] as const;

const FEATURED = FEATURED_IDS.map(
  (id) => STORE_PRODUCTS.find((p) => p.id === id)!,
).filter(Boolean);

export function StoreTeaser() {
  return (
    <section id="store" className={styles.section} aria-labelledby="store-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Store</p>
        <h2 id="store-title" className={styles.title}>
          Take the gym with you
        </h2>
        <p className={styles.copy}>
          Wraps, gloves, hats, and tees from the club shop — photos sharpened for
          this site. Proceeds support the non-profit mission.
        </p>
        <ul className={styles.grid}>
          {FEATURED.map((p) => (
            <li key={p.id} className={styles.card}>
              <Image
                src={p.image}
                alt={p.name}
                width={280}
                height={280}
                className={styles.img}
              />
              <span className={styles.name}>{p.name}</span>
              <span className={styles.price}>{formatPrice(p.priceCents)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Link href="/store">
            <Button type="button">Open the store</Button>
          </Link>
          <Link href="/donate">
            <Button type="button" variant="secondary">
              Donate
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
