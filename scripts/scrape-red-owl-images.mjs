import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const scrapeDir = "apps/web/tmp-scrape";
const outDir = "apps/web/public/gym/red-owl";
const photosDir = "apps/web/public/brand/red-owl/photos";

fs.mkdirSync(scrapeDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(photosDir, { recursive: true });

const pages = [
  ["https://scarboroughsmartbox.ca/", "smartbox-home.html"],
  ["https://scarboroughsmartbox.ca/about-us/", "smartbox-about.html"],
  ["https://scarboroughsmartbox.ca/program-details/", "smartbox-program.html"],
  ["https://www.redowlboxing.com/pages/about-red-owl-boxing", "redowl-about.html"],
  ["https://www.redowlboxing.com/pages/scarborough-members", "redowl-scarborough.html"],
  ["https://www.redowlboxing.com/", "redowl-home.html"],
];

for (const [url, file] of pages) {
  const dest = path.join(scrapeDir, file);
  try {
    execSync(`curl.exe -sL "${url}" -o "${dest}"`, { stdio: "inherit" });
    console.log("fetched", file, fs.statSync(dest).size);
  } catch (e) {
    console.warn("fail", url, e.message);
  }
}

const urls = new Set();

function addUrl(raw, base) {
  if (!raw) return;
  let u = raw.trim().replace(/&amp;/g, "&");
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("/")) {
    if (base.includes("smartbox")) u = "https://scarboroughsmartbox.ca" + u;
    else u = "https://www.redowlboxing.com" + u;
  }
  if (!/^https?:\/\//i.test(u)) return;
  u = u.split("?")[0];
  if (!/\.(jpe?g|png|webp|gif)$/i.test(u)) return;
  const low = u.toLowerCase();
  if (
    low.includes("favicon") ||
    low.includes("emoji") ||
    low.includes("payment") ||
    low.includes("icon-") ||
    low.includes("spinner") ||
    low.includes("pixel") ||
    low.includes("1x1")
  ) {
    return;
  }
  urls.add(u);
}

for (const file of fs.readdirSync(scrapeDir).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(scrapeDir, file), "utf8");
  const base = file.includes("smartbox")
    ? "https://scarboroughsmartbox.ca"
    : "https://www.redowlboxing.com";

  for (const m of html.matchAll(
    /(?:src|data-src|content|href)=["']([^"']+)["']/gi,
  )) {
    addUrl(m[1], base);
  }
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const part of m[1].split(",")) {
      addUrl(part.trim().split(/\s+/)[0], base);
    }
  }
  for (const m of html.matchAll(
    /https?:\/\/cdn\.shopify\.com\/[^"'\\\s>]+\.(?:jpe?g|png|webp)/gi,
  )) {
    addUrl(m[0], base);
  }
  for (const m of html.matchAll(
    /\/wp-content\/uploads\/[^"'\\\s>]+\.(?:jpe?g|png|webp)/gi,
  )) {
    addUrl(m[0], base);
  }
  // Elementor / CSS background urls
  for (const m of html.matchAll(/url\((['"]?)([^)'"]+)\1\)/gi)) {
    addUrl(m[2], base);
  }
}

const list = [...urls];
fs.writeFileSync(path.join(scrapeDir, "image-urls.json"), JSON.stringify(list, null, 2));
console.log("unique images", list.length);
for (const u of list) console.log(u);
