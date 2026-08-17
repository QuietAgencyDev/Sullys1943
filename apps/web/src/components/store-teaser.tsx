import Image from "next/image";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { getBrand } from "@/lib/brand";
import {
  formatPrice,
  getStoreProducts,
} from "@/lib/store-products";
import styles from "./store-teaser.module.css";

const SULLYS_FEATURED_IDS = [
  "adult-hand-wraps",
  "sullys-boxing-gloves-black",
  "sullys-baseball-hat",
  "sullys-boxing-gym-t-shirts",
] as const;

const RED_OWL_FEATURED_IDS = [
  "red-owl-boxing-gloves",
  "red-owl-boxing-hoodie",
  "red-owl-boxing-t-shirt",
  "red-owl-boxing-snapback-hat",
] as const;

export function StoreTeaser() {
  const brand = getBrand();
  const isRedOwl = brand.id === "red-owl";
  const catalog = getStoreProducts();
  const featuredIds = isRedOwl ? RED_OWL_FEATURED_IDS : SULLYS_FEATURED_IDS;
  const featured = featuredIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <section id="store" className={styles.section} aria-labelledby="store-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {isRedOwl ? "Merchandise" : "Store"}
        </p>
        <h2 id="store-title" className={styles.title}>
          {isRedOwl ? "Wear the owl" : "Take the gym with you"}
        </h2>
        <p className={styles.copy}>
          {isRedOwl
            ? "Official Red Owl gloves, hoodies, tees, and hats — checkout on redowlboxing.com."
            : "Wraps, gloves, hats, and tees. Proceeds support the non-profit mission."}
        </p>
        <ul className={styles.grid}>
          {featured.map((p) => (
            <li key={p!.id} className={styles.card}>
              <Image
                src={p!.image}
                alt={p!.name}
                width={280}
                height={280}
                className={styles.img}
              />
              <span className={styles.name}>{p!.name}</span>
              <span className={styles.price}>{formatPrice(p!.priceCents)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Link href="/store">
            <Button type="button">
              {isRedOwl ? "Shop merchandise" : "Open the store"}
            </Button>
          </Link>
          {isRedOwl ? (
            <a
              href="https://www.redowlboxing.com/collections/all-merchandise"
              target="_blank"
              rel="noreferrer"
            >
              <Button type="button" variant="secondary">
                Full collection
              </Button>
            </a>
          ) : (
            <Link href="/donate">
              <Button type="button" variant="secondary">
                Donate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
