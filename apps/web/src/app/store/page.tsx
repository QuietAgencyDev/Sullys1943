import Image from "next/image";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GYM } from "@/lib/gym-info";
import {
  STORE_PRODUCTS,
  SHOP_BASE,
  formatPrice,
  productShopUrl,
} from "@/lib/store-products";
import styles from "./store.module.css";

export const metadata = {
  title: "Store · Sully's Boxing Gym",
  description:
    "Sully's gear and apparel — wraps, gloves, hats, and tees. Support Canada's oldest boxing club.",
};

export default function StorePage() {
  const gear = STORE_PRODUCTS.filter((p) => p.category === "gear");
  const apparel = STORE_PRODUCTS.filter((p) => p.category === "apparel");

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Store</p>
          <h1 className={styles.title}>Gear with a gym behind it</h1>
          <p className={styles.lead}>
            Copied from the club shop — wraps, gloves, hats, and tees. Buy online
            or pick up at the desk. Proceeds support the non-profit mission.
          </p>
          <div className={styles.actions}>
            <a href={SHOP_BASE} target="_blank" rel="noreferrer">
              <Button type="button">Shop online</Button>
            </a>
            <Link href="/donate">
              <Button type="button" variant="secondary">
                Donate instead
              </Button>
            </Link>
          </div>
        </div>

        <ProductBlock title="Training gear" products={gear} />
        <ProductBlock title="Apparel" products={apparel} />

        <section className={styles.desk} aria-label="Desk pickup">
          <h2 className={styles.subhead}>Prefer the desk?</h2>
          <p className={styles.copy}>
            Ask at {GYM.addressLine1}. Call{" "}
            <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a> or email{" "}
            <a href={`mailto:${GYM.email}`}>{GYM.email}</a> to confirm sizes.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ProductBlock({
  title,
  products,
}: {
  title: string;
  products: typeof STORE_PRODUCTS;
}) {
  return (
    <section className={styles.block} aria-label={title}>
      <h2 className={styles.subhead}>{title}</h2>
      <ul className={styles.list}>
        {products.map((p) => (
          <li key={p.id} className={styles.item}>
            <div className={styles.thumb}>
              <Image
                src={p.image}
                alt={p.name}
                width={160}
                height={160}
                className={styles.thumbImg}
              />
            </div>
            <div className={styles.itemText}>
              <h3 className={styles.itemName}>{p.name}</h3>
              <p className={styles.itemBlurb}>{p.blurb}</p>
            </div>
            <div className={styles.itemMeta}>
              <span className={styles.price}>{formatPrice(p.priceCents)}</span>
              <a
                className={styles.buy}
                href={productShopUrl(p)}
                target="_blank"
                rel="noreferrer"
              >
                Buy
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
