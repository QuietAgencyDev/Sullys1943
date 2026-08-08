import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "apps", "web", "public", "store");
const RAW_DIR = path.join(OUT_DIR, "_raw");
const META_PATH = path.join(ROOT, "apps", "web", "src", "lib", "store-products.generated.json");

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,image/*,*/*",
        },
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(get(next));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks),
            contentType: res.headers["content-type"] ?? "",
            url,
          }),
        );
      },
    );
    req.on("error", reject);
  });
}

function decode(html) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractProducts(shopHtml) {
  const html = decode(shopHtml);
  const products = [];
  const re =
    /<li[^>]*class="[^"]*product[^"]*"[\s\S]*?<\/li>/gi;
  const blocks = html.match(re) ?? [];
  for (const block of blocks) {
    const href =
      block.match(/href="(https?:\/\/www\.sullysboxinggym\.com\/product\/[^"]+)"/i)?.[1] ??
      block.match(/href="(\/product\/[^"]+)"/i)?.[1];
    if (!href) continue;
    const url = href.startsWith("http")
      ? href
      : `https://www.sullysboxinggym.com${href}`;
    const name =
      block.match(/class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim() ??
      block.match(/<h2[^>]*>([^<]+)</i)?.[1]?.trim() ??
      "Product";
    const priceRaw =
      block.match(/woocommerce-Price-amount[^>]*>[\s\S]*?<bdi>([^<]+)/i)?.[1] ??
      block.match(/\$[\d,.]+/)?.[0];
    const price = priceRaw
      ? Math.round(parseFloat(priceRaw.replace(/[^0-9.]/g, "")) * 100)
      : 0;
    const img =
      block.match(/data-src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1] ??
      block.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1] ??
      null;
    products.push({
      id: slugify(name),
      name: name.replace(/\s+/g, " "),
      priceCents: price,
      productUrl: url.split("?")[0],
      imageUrl: img?.split("?")[0] ?? null,
    });
  }
  // de-dupe by url
  const seen = new Set();
  return products.filter((p) => {
    if (seen.has(p.productUrl)) return false;
    seen.add(p.productUrl);
    return true;
  });
}

async function enrichProduct(p) {
  try {
    const { status, body } = await get(p.productUrl);
    if (status !== 200) return p;
    const html = decode(body.toString("utf8"));
    const desc =
      html.match(
        /<div[^>]*class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1] ??
      html.match(
        /<div[^>]*id="tab-description"[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1] ??
      "";
    const blurb = decode(desc)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
    const ogImage =
      html.match(
        /property="og:image"\s+content="(https?:\/\/[^"]+)"/i,
      )?.[1] ??
      html.match(
        /content="(https?:\/\/[^"]+)"\s+property="og:image"/i,
      )?.[1];
    const gallery =
      html.match(
        /data-large_image="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
      )?.[1] ??
      html.match(
        /data-src="(https?:\/\/[^"]+uploads[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
      )?.[1];
    return {
      ...p,
      blurb: blurb || p.blurb || "Official Sully's gear.",
      imageUrl: (ogImage || gallery || p.imageUrl)?.split("?")[0] ?? p.imageUrl,
    };
  } catch {
    return p;
  }
}

async function downloadImage(url, destBase) {
  const { status, body, contentType } = await get(url);
  if (status !== 200 || body.length < 200) {
    throw new Error(`image fail ${status} ${url}`);
  }
  let ext = ".jpg";
  if (contentType.includes("png") || url.toLowerCase().endsWith(".png")) ext = ".png";
  if (contentType.includes("webp") || url.toLowerCase().endsWith(".webp"))
    ext = ".webp";
  const dest = destBase + ext;
  fs.writeFileSync(dest, body);
  return dest;
}

fs.mkdirSync(RAW_DIR, { recursive: true });

const shop = await get("https://www.sullysboxinggym.com/shop/");
console.log("shop", shop.status, shop.body.length);
if (shop.status !== 200) {
  console.error(shop.body.toString("utf8").slice(0, 400));
  process.exit(1);
}

let products = extractProducts(shop.body.toString("utf8"));
if (!products.length) {
  // fallback known slugs from earlier scrape
  const fallback = [
    ["Adult Hand Wraps", 2000, "adult-hand-wraps"],
    ["Kid's Hand Wraps", 2000, "kids-hand-wraps"],
    ["Kid's Boxing Gloves", 7000, "kids-boxing-gloves"],
    ["Sully's Baseball Hat", 3000, "sullys-baseball-hat"],
    ["Sully's Bucket Hat", 3000, "sullys-bucket-hat"],
    ["Sully's Logo Hat", 3000, "sullys-logo-hat"],
    ["Sully's Boxing Gloves - White", 9000, "sullys-boxing-gloves-white"],
    ["Sully's Boxing Gloves - Black", 9000, "sullys-boxing-gloves-black"],
    ["Sully's Boxing Gym T-Shirts", 4000, "sullys-boxing-gym-t-shirts"],
  ];
  products = fallback.map(([name, priceCents, slug]) => ({
    id: slug,
    name,
    priceCents,
    productUrl: `https://www.sullysboxinggym.com/product/${slug}/`,
    imageUrl: null,
    blurb: "Official Sully's gear.",
  }));
  console.log("fallback product list");
}

console.log("found", products.length);
products = await Promise.all(products.map(enrichProduct));

const catalog = [];
for (const p of products) {
  let localRaw = null;
  if (p.imageUrl) {
    try {
      localRaw = await downloadImage(p.imageUrl, path.join(RAW_DIR, p.id));
      console.log("img", p.id, path.basename(localRaw));
    } catch (e) {
      console.warn("img fail", p.id, e.message);
    }
  }
  const category =
    /hat|shirt|tee|apparel|bucket|baseball|logo hat/i.test(p.name)
      ? "apparel"
      : "gear";
  catalog.push({
    id: p.id,
    name: p.name,
    priceCents: p.priceCents,
    category,
    blurb: p.blurb || "Official Sully's gear.",
    legacySlug: p.productUrl.replace(/\/$/, "").split("/").pop(),
    imageUrl: p.imageUrl,
    localRaw: localRaw ? path.relative(ROOT, localRaw).replace(/\\/g, "/") : null,
    image: localRaw ? `/store/${p.id}.jpg` : null,
  });
}

fs.writeFileSync(META_PATH, JSON.stringify(catalog, null, 2));
console.log("wrote", META_PATH);
