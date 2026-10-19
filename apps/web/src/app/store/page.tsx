import Image from "next/image";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { GYM } from "@/lib/gym-info";
import {
  formatPrice,
  getShopBase,
  getStoreProducts,
  productShopUrl,
  type CatalogProduct,
} from "@/lib/store-products";
import { StoreCart } from "./store-cart";
import styles from "./store.module.css";

const brand = getBrand();
const isRedOwl = brand.id === "red-owl";

export const metadata = {
  title: isRedOwl
    ? "Merchandise · Red Owl Boxing"
    : "Store · Sully's Boxing Gym",
  description: isRedOwl
    ? "Red Owl Boxing merchandise — gloves, hoodies, tees, and hats. Shop the official collection."
    : "Sully's gear and apparel — wraps, gloves, hats, and tees. Support Canada's oldest boxing club.",
};

export default function StorePage() {
  const products = getStoreProducts();
  const gear = products.filter((p) => p.category === "gear");
  const apparel = products.filter((p) => p.category === "apparel");
  const shopBase = getShopBase();

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            {isRedOwl ? "Merchandise" : "Store"}
          </p>
          <h1 className={styles.title}>
            {isRedOwl ? (
              <>
                <span>Official Red Owl</span>
                <span>merch</span>
              </>
            ) : (
              <>
                <span>Gear with a</span>
                <span>gym behind it</span>
              </>
            )}
          </h1>
          <p className={styles.lead}>
            {isRedOwl
              ? "Gloves, hoodies, tees, and hats from the Red Owl collection. Checkout on redowlboxing.com."
              : "Wraps, gloves, hats, and tees. Buy online or pick up at the desk. Proceeds support the non-profit mission."}
          </p>
          <div className={styles.actions}>
            <a href={shopBase} target="_blank" rel="noreferrer">
              <Button type="button">
                {isRedOwl ? "Shop on Red Owl" : "Shop online"}
              </Button>
            </a>
            {isRedOwl ? (
              <Link href="/trial">
                <Button type="button" variant="secondary">
                  3-day free trial
                </Button>
              </Link>
            ) : (
              <Link href="/donate">
                <Button type="button" variant="secondary">
                  Donate instead
                </Button>
              </Link>
            )}
          </div>
        </div>

        <ProductBlock title="Training gear" products={gear} />
        <ProductBlock title="Apparel" products={apparel} />

        {isRedOwl ? null : <StoreCart />}

        <section className={styles.desk} aria-label="Desk pickup">
          <h2 className={styles.subhead}>
            {isRedOwl ? "Scarborough gym" : "Prefer the desk?"}
          </h2>
          <p className={styles.copy}>
            {isRedOwl
              ? `Train at ${GYM.addressLine1}. Call `
              : `Ask at ${GYM.addressLine1}. Call `}
            <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a> or email{" "}
            <a href={`mailto:${GYM.email}`}>{GYM.email}</a>
            {isRedOwl ? "." : " to confirm sizes."}
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
  products: CatalogProduct[];
}) {
  if (!products.length) return null;
  return (
    <section className={styles.block} aria-label={title}>
      <h2 className={styles.subhead}>{title}</h2>
      <ul className={styles.list}>
        {products.map((p) => {
          const soldOut = "soldOut" in p && p.soldOut;
          const compare =
            "compareAtCents" in p && p.compareAtCents
              ? p.compareAtCents
              : null;
          return (
            <li key={p.id} className={styles.item}>
              <div className={styles.thumb}>
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="84px"
                  className={styles.thumbImg}
                />
              </div>
              <div className={styles.itemText}>
                <h3 className={styles.itemName}>{p.name}</h3>
                <p className={styles.itemBlurb}>{p.blurb}</p>
              </div>
              <div className={styles.itemMeta}>
                <span className={styles.price}>
                  {compare ? (
                    <>
                      <s style={{ opacity: 0.55, marginRight: "0.35rem" }}>
                        {formatPrice(compare)}
                      </s>
                      {formatPrice(p.priceCents)}
                    </>
                  ) : (
                    formatPrice(p.priceCents)
                  )}
                </span>
                {soldOut ? (
                  <span className={styles.buy} aria-disabled>
                    Sold out
                  </span>
                ) : (
                  <a
                    className={styles.buy}
                    href={productShopUrl(p)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buy
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
