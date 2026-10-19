/** Store catalog — legacy Woo checkout URLs until native payments. */
import { getBrandId } from "./brand";
import {
  RED_OWL_SHOP_BASE,
  RED_OWL_STORE_PRODUCTS,
  redOwlProductUrl,
  type RedOwlStoreProduct,
} from "./store-products-red-owl";

export type StoreProduct = {
  id: string;
  name: string;
  priceCents: number;
  category: "gear" | "apparel";
  blurb: string;
  legacySlug: string;
  image: string;
};

const SHOP_BASE_SULLYS = "https://www.sullysboxinggym.com/shop";

export const SULLYS_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "adult-hand-wraps",
    name: "Adult Hand Wraps",
    priceCents: 2000,
    category: "gear",
    blurb: "Protect the hands and train longer.",
    legacySlug: "adult-hand-wraps",
    image: "/store/adult-hand-wraps.jpg",
  },
  {
    id: "kids-hand-wraps",
    name: "Kid's Hand Wraps",
    priceCents: 2000,
    category: "gear",
    blurb: "Shorter stretch wraps for young fighters.",
    legacySlug: "kids-hand-wraps",
    image: "/store/kids-hand-wraps.jpg",
  },
  {
    id: "kids-boxing-gloves",
    name: "Kid's Boxing Gloves",
    priceCents: 7000,
    category: "gear",
    blurb: "Lighter gloves sized for young fighters.",
    legacySlug: "kids-boxing-gloves",
    image: "/store/kids-boxing-gloves.jpg",
  },
  {
    id: "sullys-boxing-gloves-white",
    name: "Sully's Boxing Gloves — White",
    priceCents: 9000,
    category: "gear",
    blurb: "Gym-branded gloves for serious rounds. Various sizes.",
    legacySlug: "sullys-boxing-gloves-white",
    image: "/store/sullys-boxing-gloves-white.jpg",
  },
  {
    id: "sullys-boxing-gloves-black",
    name: "Sully's Boxing Gloves — Black",
    priceCents: 9000,
    category: "gear",
    blurb: "Same work ethic. Darker leather. Various sizes.",
    legacySlug: "sullys-boxing-gloves-black",
    image: "/store/sullys-boxing-gloves-black.jpg",
  },
  {
    id: "sullys-baseball-hat",
    name: "Sully's Baseball Hat",
    priceCents: 3000,
    category: "apparel",
    blurb: "EST 1943 on the street.",
    legacySlug: "sullys-baseball-hat",
    image: "/store/sullys-baseball-hat.jpg",
  },
  {
    id: "sullys-bucket-hat",
    name: "Sully's Bucket Hat",
    priceCents: 3000,
    category: "apparel",
    blurb: "Shade and swagger for camp days.",
    legacySlug: "sullys-bucket-hat",
    image: "/store/sullys-bucket-hat.jpg",
  },
  {
    id: "sullys-logo-hat",
    name: "Sully's Logo Hat",
    priceCents: 3000,
    category: "apparel",
    blurb: "The mark. Clean and loud.",
    legacySlug: "sullys-logo-hat",
    image: "/store/sullys-logo-hat.jpg",
  },
  {
    id: "sullys-boxing-gym-t-shirts",
    name: "Sully's Boxing Gym T-Shirts",
    priceCents: 4000,
    category: "apparel",
    blurb: "Sully's logo tee — black and white.",
    legacySlug: "product-1",
    image: "/store/sullys-boxing-gym-t-shirts.jpg",
  },
];

export type CatalogProduct = StoreProduct | RedOwlStoreProduct;

export function getStoreProducts(): CatalogProduct[] {
  return getBrandId() === "red-owl"
    ? RED_OWL_STORE_PRODUCTS
    : SULLYS_STORE_PRODUCTS;
}

/** @deprecated Prefer getStoreProducts() — kept for Sully cart defaults */
export const STORE_PRODUCTS = SULLYS_STORE_PRODUCTS;

export function getShopBase() {
  return getBrandId() === "red-owl" ? RED_OWL_SHOP_BASE : SHOP_BASE_SULLYS;
}

export function formatPrice(cents: number, currency: "CAD" | "USD" = "CAD") {
  const brandCurrency = getBrandId() === "red-owl" ? "USD" : currency;
  return new Intl.NumberFormat(
    brandCurrency === "USD" ? "en-US" : "en-CA",
    {
      style: "currency",
      currency: brandCurrency,
      minimumFractionDigits: brandCurrency === "USD" ? 2 : 0,
    },
  ).format(cents / 100);
}

export function productShopUrl(product: CatalogProduct) {
  if (getBrandId() === "red-owl" && "handle" in product) {
    return redOwlProductUrl(product);
  }
  return `${SHOP_BASE_SULLYS}/${product.legacySlug}/`;
}

export const SHOP_BASE = getShopBase();

export { RED_OWL_SHOP_BASE, RED_OWL_STORE_PRODUCTS };
