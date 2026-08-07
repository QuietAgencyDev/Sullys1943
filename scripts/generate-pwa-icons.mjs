/**
 * Generate simple branded PWA icons from the primary logo (sharp if available,
 * else copy logo as fallback PNGs via canvas-less path).
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logo = join(root, "apps/web/public/brand/sullys-logo-primary.png");
const outDir = join(root, "apps/web/public/icons");

mkdirSync(outDir, { recursive: true });

if (!existsSync(logo)) {
  console.error("Missing logo:", logo);
  process.exit(1);
}

async function main() {
  try {
    const sharp = (await import("sharp")).default;
    for (const size of [192, 512]) {
      const out = join(outDir, `icon-${size}.png`);
      await sharp(logo)
        .resize(size, size, {
          fit: "contain",
          background: { r: 20, g: 15, b: 12, alpha: 1 },
        })
        .png()
        .toFile(out);
      console.log("wrote", out);
    }
  } catch {
    // No sharp — copy logo as both sizes (browsers still accept for install demo)
    copyFileSync(logo, join(outDir, "icon-192.png"));
    copyFileSync(logo, join(outDir, "icon-512.png"));
    console.log("sharp unavailable — copied logo to icons/");
  }
}

main();
