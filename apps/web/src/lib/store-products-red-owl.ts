/**
 * Red Owl Boxing merchandise — mirrored from
 * https://www.redowlboxing.com/collections/all-merchandise
 * Buy links go to Shopify product pages (native checkout stays on their store).
 */
import type { StoreProduct } from "./store-products";

export const RED_OWL_SHOP_BASE =
  "https://www.redowlboxing.com/collections/all-merchandise";

export const RED_OWL_SHOP_PRODUCT_BASE =
  "https://www.redowlboxing.com/products";

export type RedOwlStoreProduct = StoreProduct & {
  /** Shopify product handle */
  handle: string;
  compareAtCents?: number | null;
  soldOut?: boolean;
};

export const RED_OWL_STORE_PRODUCTS: RedOwlStoreProduct[] = [
  {
    id: "red-owl-boxing-gloves",
    handle: "red-owl-boxing-gloves",
    name: "Boxing Gloves",
    priceCents: 7999,
    compareAtCents: 9999,
    category: "gear",
    blurb: "Red Owl branded gloves — save 20%.",
    legacySlug: "red-owl-boxing-gloves",
    image: "/store/red-owl/boxing-gloves.png",
    soldOut: false,
  },
  {
    id: "red-owl-quarter-zip-sweater",
    handle: "red-owl-quarter-zip-sweater",
    name: "ROB Quarter Zip Sweater",
    priceCents: 4499,
    compareAtCents: 5999,
    category: "apparel",
    blurb: "Quarter zip with Red Owl mark.",
    legacySlug: "red-owl-quarter-zip-sweater",
    image: "/store/red-owl/quarter-zip.png",
    soldOut: true,
  },
  {
    id: "red-owl-cotton-long-sleeve-tee",
    handle: "red-owl-cotton-long-sleeve-tee",
    name: "Legacy Long Sleeve Tee",
    priceCents: 2249,
    compareAtCents: 2999,
    category: "apparel",
    blurb: "Legacy long sleeve — from $22.49.",
    legacySlug: "red-owl-cotton-long-sleeve-tee",
    image: "/store/red-owl/long-sleeve-tee.png",
    soldOut: true,
  },
  {
    id: "red-owl-boxing-t-shirt",
    handle: "red-owl-boxing-t-shirt",
    name: "Legacy Owl T-Shirt",
    priceCents: 2499,
    category: "apparel",
    blurb: "Classic owl tee.",
    legacySlug: "red-owl-boxing-t-shirt",
    image: "/store/red-owl/legacy-owl-tee.png",
    soldOut: true,
  },
  {
    id: "red-owl-boxing-snapback-hat",
    handle: "red-owl-boxing-snapback-hat",
    name: "Owl Snapback Hat",
    priceCents: 2999,
    category: "apparel",
    blurb: "Snapback with owl mark.",
    legacySlug: "red-owl-boxing-snapback-hat",
    image: "/store/red-owl/snapback-hat.jpg",
    soldOut: true,
  },
  {
    id: "red-owl-boxing-hoodie",
    handle: "red-owl-boxing-hoodie",
    name: "ROB Hoodie",
    priceCents: 4999,
    category: "apparel",
    blurb: "Red Owl Boxing hoodie.",
    legacySlug: "red-owl-boxing-hoodie",
    image: "/store/red-owl/hoodie.jpg",
    soldOut: true,
  },
];

export function redOwlProductUrl(product: RedOwlStoreProduct) {
  return `${RED_OWL_SHOP_PRODUCT_BASE}/${product.handle}`;
}
