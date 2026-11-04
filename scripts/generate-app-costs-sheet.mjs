/**
 * Printable hard-cost sheet for running the Sully's app.
 * Usage: node scripts/generate-app-costs-sheet.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "apps/api/package.json"));
const PDFDocument = require("pdfkit");

const outDir = path.join(root, "docs", "09-manuals");
const publicDir = path.join(root, "apps", "web", "public", "docs");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const RED = "#C82026";
const BROWN = "#3A2418";
const INK = "#1a120e";

const rows = [
  ["Domain sullys1943.com", "$1", "$12–15", "Cloudflare, paid once a year. Not monthly."],
  ["Member site and staff site", "$0 or $20 USD", "$0 or $240 USD", "Vercel. Hobby is $0. A live business usually sits on Pro, one seat, both sites."],
  ["API", "$5–20 USD", "$60–240 USD", "Railway. Budget the low end for this gym. Usage can move it."],
  ["Database", "$0–19 USD", "$0–228 USD", "Neon. Free while the gym is small. Pay when it needs to stay on."],
  ["Text and email alerts", "$0 until on", "Per message", "Not a hard monthly fee. Each text is extra when you turn it on."],
  ["Helcim card charges", "$0 software", "Percent of the charge", "No monthly app fee in this sheet. The terminal is equipment you already ordered."],
];

const doc = new PDFDocument({ size: "LETTER", margin: 54 });
const dest = path.join(outDir, "Sullys-App-Hard-Costs.pdf");
const stream = fs.createWriteStream(dest);
doc.pipe(stream);

doc.rect(0, 0, 12, doc.page.height).fill(RED);
doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(12).text("SULLY'S BOXING GYM · EST 1943", 54, 48);
doc.fillColor(RED).fontSize(10).text("HARD COSTS TO RUN THE APP", 54, 66);
doc.fillColor(INK).fontSize(26).text("What the app costs\nto keep the lights on", 54, 96, { width: 480 });
doc.moveDown(0.4);
doc.font("Helvetica").fontSize(11).fillColor(INK).text(
  "November 2026. These are list prices, not an invoice. Confirm each one on the bill. Gym rent, coaches, and Quiet Agency are not in this sheet. Amounts are USD unless the domain line says otherwise.",
  { width: 480, lineGap: 3 },
);

let y = 230;
for (const [name, month, year, note] of rows) {
  doc.rect(54, y, 504, 62).fill("#F7F0E4");
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(13).text(name, 66, y + 8, { width: 300 });
  doc.fillColor(RED).fontSize(11).text(`${month} / mo`, 380, y + 8, { width: 160, align: "right" });
  doc.fillColor(INK).font("Helvetica").fontSize(11).text(`${year} / yr`, 380, y + 24, { width: 160, align: "right" });
  doc.fillColor(INK).fontSize(10).text(note, 66, y + 32, { width: 300 });
  y += 72;
}

doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(14).text("Hard floor", 54, y + 8);
doc.fillColor(INK).font("Helvetica").fontSize(12).text(
  "About $6 to $40 USD a month once the sites are on a paid plan, plus the domain once a year. On the free tiers the app can sit under $25 a month, which is the demo budget already written for this project. Card fees and text messages are not in that number.",
  54,
  y + 28,
  { width: 480, lineGap: 3 },
);

doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(12).text(
  "Boxing is the engine. People are the purpose. Character is the legacy.",
  54,
  730,
  { width: 420 },
);

doc.end();
stream.on("finish", () => {
  fs.copyFileSync(dest, path.join(publicDir, "Sullys-App-Hard-Costs.pdf"));
  console.log(dest);
});
