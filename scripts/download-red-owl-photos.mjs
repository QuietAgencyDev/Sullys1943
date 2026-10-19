/**
 * Download curated Red Owl / Scarborough Smartbox originals into
 * apps/web/public/gym/red-owl and apps/web/public/brand/red-owl/photos.
 * Skips Unsplash stock and tiny WordPress thumbs.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const gymDir = "apps/web/public/gym/red-owl";
const brandDir = "apps/web/public/brand/red-owl/photos";
fs.mkdirSync(gymDir, { recursive: true });
fs.mkdirSync(brandDir, { recursive: true });

/** @type {{ url: string; dest: string }[]} */
const files = [
  // Smartbox — gym / program photography
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/Artboard-7.jpg",
    dest: `${gymDir}/smartbox-hero.jpg`,
  },
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/DSC02973-2048x1365.jpg",
    dest: `${gymDir}/smartbox-training.jpg`,
  },
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/Junior-Jabs.jpg",
    dest: `${gymDir}/smartbox-junior-jabs.jpg`,
  },
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/Untitled-design.png",
    dest: `${brandDir}/smartbox-wordmark.png`,
  },
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/2.png",
    dest: `${brandDir}/smartbox-graphic-2.png`,
  },
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/2-1.png",
    dest: `${brandDir}/smartbox-graphic-2b.png`,
  },
  {
    url: "https://scarboroughsmartbox.ca/wp-content/uploads/2025/12/Centennial_College_Logo.jpg",
    dest: `${brandDir}/partner-centennial.jpg`,
  },

  // Red Owl Boxing — about / events / Scarborough
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/red_owl_boxing.jpg",
    dest: `${brandDir}/red-owl-logo-photo.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/DSC02060-min.jpg",
    dest: `${gymDir}/redowl-ring-1.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/XIV_Main_DSC03601.jpg",
    dest: `${gymDir}/redowl-event-crowd.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/FightNight-DSC07553.jpg",
    dest: `${gymDir}/redowl-fight-night.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/Boxfest17-FightNight-Adrian-DSC09971.jpg",
    dest: `${gymDir}/redowl-boxfest-adrian.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/XVI-FightNight-Burnside-DSC00320.jpg",
    dest: `${gymDir}/redowl-boxfest-burnside.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/382A0022_f71a1f67-9a0b-4845-8522-ce691c382b07.jpg",
    dest: `${gymDir}/redowl-portrait-1.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/382A0025.jpg",
    dest: `${gymDir}/redowl-portrait-2.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/WhatsApp_Image_2025-04-07_at_20.24_edited.jpg",
    dest: `${gymDir}/scarborough-gym-1.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/WhatsApp_Image_2025-04-09_at_09.55.26_0641559d_1.jpg",
    dest: `${gymDir}/scarborough-gym-2.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/1000052497_1.jpg",
    dest: `${gymDir}/scarborough-gym-3.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/1000052624_1.jpg",
    dest: `${gymDir}/scarborough-gym-4.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/1000052572.jpg",
    dest: `${gymDir}/scarborough-gym-5.jpg`,
  },
  {
    url: "https://www.redowlboxing.com/cdn/shop/files/1000025890_1.jpg",
    dest: `${gymDir}/scarborough-gym-6.jpg`,
  },
];

const manifest = [];
for (const f of files) {
  try {
    execSync(`curl.exe -sL "${f.url}" -o "${f.dest}"`, { stdio: "inherit" });
    const size = fs.statSync(f.dest).size;
    if (size < 2000) {
      fs.unlinkSync(f.dest);
      console.warn("too small, skip", f.dest, size);
      continue;
    }
    console.log("ok", f.dest, size);
    manifest.push({
      file: f.dest.replace(/^apps\/web\/public/, ""),
      source: f.url,
    });
  } catch (e) {
    console.warn("fail", f.url, e.message);
  }
}

fs.writeFileSync(
  path.join(gymDir, "SOURCES.json"),
  JSON.stringify(
    {
      note: "Original Red Owl Boxing / Scarborough Smartbox assets only — not Sully's IP",
      downloadedAt: new Date().toISOString(),
      items: manifest,
    },
    null,
    2,
  ),
);
console.log("done", manifest.length);
