/**
 * Generate Sully's branded PDF instruction manuals (Owner/Staff + Members/Users).
 * Usage: node scripts/generate-instruction-manuals.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "apps/api/package.json"));
const PDFDocument = require("pdfkit");

const RED = "#C82026";
const BROWN = "#3A2418";
const CREAM = "#F3E6C8";
const MUTED = "#666666";
const INK = "#1a120e";

const outDir = path.join(root, "docs", "09-manuals");
const publicDir = path.join(root, "apps", "web", "public", "docs");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

function writePdf(filename, build) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 56, bottom: 56, left: 54, right: 54 },
      bufferPages: true,
      info: {
        Title: filename.replace(".pdf", ""),
        Author: "Quiet Agency · Sully's Boxing Gym",
        Subject: "Sully's Digital Performance Platform",
      },
    });
    const dest = path.join(outDir, filename);
    const stream = fs.createWriteStream(dest);
    doc.pipe(stream);
    build(doc);
    doc.end();
    stream.on("finish", () => {
      fs.copyFileSync(dest, path.join(publicDir, filename));
      resolve(dest);
    });
    stream.on("error", reject);
  });
}

function headerBar(doc, subtitle) {
  doc.rect(0, 0, doc.page.width, 48).fill(BROWN);
  doc
    .fillColor(CREAM)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("SULLY'S BOXING GYM · EST 1943", 54, 18, { continued: false });
  doc
    .fillColor(RED)
    .fontSize(9)
    .font("Helvetica")
    .text(subtitle, 54, 34);
  doc.moveDown();
  doc.y = 64;
}

function footer(doc, pageLabel) {
  const y = doc.page.height - 36;
  doc
    .strokeColor("#dddddd")
    .moveTo(54, y - 8)
    .lineTo(doc.page.width - 54, y - 8)
    .stroke();
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .font("Helvetica")
    .text(
      "Boxing is the engine. People are the purpose. Character is the legacy.",
      54,
      y,
      { width: 320 },
    );
  doc.text(pageLabel, 54, y, {
    width: doc.page.width - 108,
    align: "right",
  });
}

function ensureSpace(doc, need = 80) {
  if (doc.y + need > doc.page.height - 64) {
    doc.addPage();
    headerBar(doc, "Instruction Manual");
  }
}

function h1(doc, text) {
  ensureSpace(doc, 60);
  doc.moveDown(0.4);
  doc.fillColor(RED).fontSize(18).font("Helvetica-Bold").text(text);
  doc.moveDown(0.35);
}

function h2(doc, text) {
  ensureSpace(doc, 48);
  doc.moveDown(0.3);
  doc.fillColor(BROWN).fontSize(13).font("Helvetica-Bold").text(text);
  doc.moveDown(0.2);
}

function p(doc, text) {
  ensureSpace(doc, 36);
  doc
    .fillColor(INK)
    .fontSize(10)
    .font("Helvetica")
    .text(text, { align: "left", lineGap: 2 });
  doc.moveDown(0.35);
}

function bullet(doc, lines) {
  for (const line of lines) {
    ensureSpace(doc, 28);
    doc
      .fillColor(INK)
      .fontSize(10)
      .font("Helvetica")
      .text(`•  ${line}`, { indent: 8, lineGap: 1 });
  }
  doc.moveDown(0.3);
}

function note(doc, text) {
  ensureSpace(doc, 40);
  const x = 54;
  const w = doc.page.width - 108;
  const h = doc.heightOfString(text, { width: w - 16 }) + 14;
  doc.rect(x, doc.y, w, h).fill("#F7F0E4");
  doc
    .fillColor(BROWN)
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text(text, x + 8, doc.y + 7, { width: w - 16 });
  doc.y += h + 8;
}

function cover(doc, title, audience, version) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#140F0C");
  doc.rect(0, 0, 12, doc.page.height).fill(RED);
  doc
    .fillColor(CREAM)
    .fontSize(11)
    .font("Helvetica")
    .text("SULLY'S BOXING GYM · EST 1943", 54, 120);
  doc
    .fillColor(RED)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("DIGITAL PERFORMANCE PLATFORM", 54, 140);
  doc
    .fillColor(CREAM)
    .fontSize(28)
    .font("Helvetica-Bold")
    .text(title, 54, 180, { width: 480 });
  doc
    .fillColor("#C4A06A")
    .fontSize(12)
    .font("Helvetica")
    .text(audience, 54, 280);
  doc
    .fillColor(MUTED)
    .fontSize(10)
    .text(version, 54, 310);
  doc
    .fillColor("#888888")
    .fontSize(9)
    .text(
      "Web & system development by Quiet Agency · quietagency.co",
      54,
      700,
    );
  doc
    .fillColor("#666666")
    .fontSize(9)
    .text(
      "Boxing is the engine. People are the purpose. Character is the legacy.",
      54,
      720,
      { width: 420 },
    );
  doc.addPage();
}

function buildMemberManual(doc) {
  cover(
    doc,
    "Member & Family\nUser Guide",
    "For members, parents / guardians, and new joiners",
    "Version 1.1 · August 2026 · AAA pack",
  );
  headerBar(doc, "Member & Family User Guide");

  h1(doc, "1. Welcome");
  p(
    doc,
    "This guide helps you use Sully's digital platform: join the gym, sign your waiver, open member home, book or waitlist classes, check in with your phone QR, manage family youth accounts, and track your Boxing Passport.",
  );
  note(
    doc,
    "Demo logins (local/seed): member@sullys.local or parent@sullys.local · password password123",
  );

  h1(doc, "2. Quick start — Join");
  h2(doc, "Path: /join");
  bullet(doc, [
    "Create your account (name, email, password).",
    "Read and sign the liability waiver (typed legal name).",
    "Choose a plan (e.g. Monthly Unlimited or Trial).",
    "Complete payment (mock checkout in demo, or Stripe when live).",
    "Open the member portal and book your first class.",
  ]);
  p(
    doc,
    "You cannot issue a check-in QR until your waiver is signed. Parents must sign youth waivers before a child QR can be issued.",
  );

  h1(doc, "3. Sign in & password reset");
  h2(doc, "Paths: /app/login · /app/forgot-password · /app/reset-password");
  bullet(doc, [
    "Sign in with the email you registered — you land on Member Home (/app).",
    "Forgot password? Use Forgot password, enter your email, then open the reset link.",
    "Demo note: the reset link also appears on screen (and in the API console) when not in production.",
    "From Profile (/app/profile) open Passport, Billing, Waiver, Nutrition, Attendance, and Family.",
    "Use Log out when finished on a shared device.",
  ]);

  h1(doc, "4. Member home");
  h2(doc, "Path: /app");
  bullet(doc, [
    "See your next class, membership status, and waiver status at a glance.",
    "Open your digital card for desk check-in.",
    "Tap Book a class to grab or waitlist a session.",
  ]);
  note(
    doc,
    "On your phone: use the browser menu → Add to Home Screen for an installable Sully's portal icon (PWA).",
  );

  h1(doc, "5. Liability waiver");
  h2(doc, "Path: /app/waiver");
  bullet(doc, [
    "Review any required packets and sign with your full legal name.",
    "Download a PDF copy of a signed waiver for your records.",
    "Parents: sign youth waivers from /app/family (guardian signature).",
  ]);

  h1(doc, "6. Digital card & check-in QR");
  h2(doc, "Path: /app/card");
  bullet(doc, [
    "Open your digital card before you arrive at the desk.",
    "Show the rotating QR to the front desk scanner (or camera).",
    "QR codes expire about every 60 seconds — leave the page open so it refreshes.",
    "If QR is blocked, complete your waiver (and active membership) first.",
  ]);
  note(
    doc,
    "Tip: Brightness up on your phone. Hold steady 6–12 inches from the scanner.",
  );

  h1(doc, "7. Book classes, waitlist & calendar");
  h2(doc, "Paths: /app/book · /app/calendar");
  bullet(doc, [
    "Use the week strip to pick a day; each card shows coach, capacity, and your booked/waitlisted state.",
    "Book an open class, or Join waitlist when the room is full.",
    "Cancel in-policy from the same card — if you had a confirmed spot, the next waitlisted member is promoted.",
    "Parents can book for a linked child from Family tools.",
    "Today's schedule lives at /app/calendar; home is always /app.",
  ]);

  h1(doc, "8. Family / youth (parents)");
  h2(doc, "Path: /app/family");
  bullet(doc, [
    "View linked children (desk can link a child to your parent email).",
    "Sign the youth waiver as guardian.",
    "Issue a temporary child check-in QR for the desk.",
    "Book classes for your child when available.",
  ]);

  h1(doc, "9. Billing");
  h2(doc, "Path: /app/billing");
  bullet(doc, [
    "Review membership and payment history.",
    "Buy or renew a plan via /join.",
    "When Stripe is live, open the Customer Portal to update cards (after at least one live checkout).",
  ]);

  h1(doc, "10. Coaches, Passport, Legacy & nutrition");
  bullet(doc, [
    "Meet coaches on the public site: /coaches.",
    "Passport (/app/passport) — your progression story and milestones.",
    "Legacy Wall (/legacy) — Sully's history and culture.",
    "Nutrition (/app/nutrition) — profile and meal plan info when assigned.",
    "Attendance (/app/attendance) — your check-in history.",
  ]);

  h1(doc, "11. Visit & contact");
  bullet(doc, [
    "Address: 1554 Dundas St W (lower level), Toronto, ON M6H 1Z6",
    "Hours: Mon–Fri 7:30 AM–9:00 PM · Sat 12–5 PM",
    "Phone: (416) 805-8108 · info@sullysboxinggym.com",
    "Website visit page: /contact",
  ]);

  h1(doc, "12. Troubleshooting");
  bullet(doc, [
    "Can't get a QR? Sign waiver at /app/waiver.",
    "Check-in failed at desk? Ask staff — they can override with a reason when appropriate.",
    "Payment pending? Refresh /join/success or check /app/billing.",
    "Forgot password? Use /app/forgot-password (or ask the desk if email delivery is not configured).",
    "Empty schedule with an error message? Retry or check your connection — the app will not pretend classes exist when the feed fails.",
  ]);

  p(
    doc,
    "Questions about programs or culture: ask a coach, or email info@sullysboxinggym.com.",
  );

  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    if (i === 0) continue;
    footer(doc, `Member Guide · ${i}/${pages.count - 1}`);
  }
}

function buildOwnerManual(doc) {
  cover(
    doc,
    "Owner & Staff\nOperations Manual",
    "For owners, admins, front desk, coaches, and kitchen",
    "Version 1.1 · August 2026 · AAA pack",
  );
  headerBar(doc, "Owner & Staff Operations Manual");

  h1(doc, "1. Platform overview");
  p(
    doc,
    "Sully's Digital Performance Platform connects the public website, member portal, staff tools, and gym TV boards. Quiet Agency provides web & system development (quietagency.co).",
  );
  bullet(doc, [
    "Marketing site — brand, programs, Legacy, join, contact, TV boards",
    "Member portal — home, waiver, QR card, booking/waitlist, family, billing, passport",
    "Staff app — desk scanner, coach roster, kitchen KDS, owner brief, user admin",
    "API — memberships, check-in, documents, TV feed, waitlist promote, billing",
    "Public coaches page — /coaches (seed bios)",
  ]);

  h1(doc, "2. Staff logins (seed / demo)");
  note(
    doc,
    "Password for all seed accounts: password123",
  );
  bullet(doc, [
    "owner@sullys.local — Owner morning brief + staff admin",
    "admin@sullys.local — Staff user admin",
    "desk@sullys.local — Front desk scanner",
    "coach@sullys.local — Class roster",
    "Staff shell URL (local): http://localhost:3001",
  ]);

  h1(doc, "3. Front desk — scanner");
  h2(doc, "Path: /desk");
  bullet(doc, [
    "Keep the Scan target field focused — USB HID scanners type like a keyboard and press Enter.",
    "Select today's session to attach late flags for coaches.",
    "Member shows /app/card QR → scan → check-in + XP.",
    "If blocked (waiver / membership), enable Staff override, enter a reason (min 4 characters), then retry.",
    "Sell Drop-in for walk-ins ($25 seed product) with optional immediate check-in.",
    "Link Family: connect child to parent email, create youth profile, waiver packet, optional membership attach.",
  ]);
  h2(doc, "Dry-run before the scanner arrives");
  bullet(doc, [
    "Open /desk/dry-run → Run API dry-run (auto checks).",
    "Walk the manual floor checklist on that page.",
  ]);

  h1(doc, "4. Coach roster");
  h2(doc, "Path: /coach/roster");
  bullet(doc, [
    "View live class list, booked members, check-in status, late flags.",
    "Finalize attendance / mark no-shows when your process requires it.",
    "Void a mistaken check-in with a clear reason when supported.",
  ]);

  h1(doc, "5. Kitchen KDS");
  h2(doc, "Path: /kitchen");
  bullet(doc, [
    "View allergen-aware tickets and advance order status (placed → preparing → ready → completed).",
    "Coordinate with Floor/Reception TV kitchen specials when those boards are on.",
  ]);

  h1(doc, "6. Owner morning brief");
  h2(doc, "Path: /owner");
  bullet(doc, [
    "Today's check-ins, class fill rates, pending waivers, pending payments.",
    "Recent staff overrides (audit trail).",
    "Billing mode indicator (mock vs Stripe keys).",
  ]);

  h1(doc, "7. Staff user admin");
  h2(doc, "Path: /admin/users · roles: owner or admin");
  bullet(doc, [
    "Invite front desk, coach, admin, or owner accounts with a temporary password.",
    "Change roles as responsibilities change.",
    "Disable accounts immediately when someone leaves — they cannot log in.",
    "You cannot disable your own account.",
  ]);

  h1(doc, "8. Gym TV — second screens");
  bullet(doc, [
    "Demo kit: /tv/demo",
    "Floor board: /tv/floor — round timer hero, live/next class, leaderboard, welcome ticker",
    "Reception board: /tv/reception — schedule + welcome",
    "Press F for fullscreen on a spare monitor, Fire TV, or Chromecast.",
    "Boards refresh about every 15 seconds. Public feed uses first names / initials only.",
    "Offline hardening: last-good board is cached in the browser; a branded banner appears if the API drops — the round timer keeps running.",
  ]);
  note(
    doc,
    "Booking: when a class is full, members join a waitlist. Cancelling a confirmed booking promotes the next waitlisted athlete automatically.",
  );

  h1(doc, "9. Waivers & compliance");
  bullet(doc, [
    "Hard gate: no QR / check-in without a signed liability packet (unless staff override).",
    "Members download PDFs from /app/waiver; guardians from family tools.",
    "Staff may download packets when authorized.",
    "Always record a real override reason — it appears on the owner brief.",
  ]);

  h1(doc, "10. Memberships & billing");
  bullet(doc, [
    "Plans and drop-ins are seeded products (monthly, youth, trial, drop-in, etc.).",
    "Mock mode: /join/pay simulates payment.",
    "Stripe test: set STRIPE_SECRET_KEY=sk_test_… on the API, restart, run Checkout.",
    "Success page confirms Stripe via confirm-checkout; webhooks optional for local.",
    "Members see history at /app/billing.",
  ]);

  h1(doc, "11. Soft-launch gym facts");
  bullet(doc, [
    "1554 Dundas St W (lower level), Toronto, ON M6H 1Z6",
    "Mon–Fri 7:30 AM–9:00 PM · Sat 12–5 PM",
    "(416) 805-8108 · info@sullysboxinggym.com",
    "Shown on marketing /contact, footer, and desk banner.",
  ]);

  h1(doc, "12. Going live (cheap demo stack)");
  bullet(doc, [
    "Domain: Cloudflare",
    "Web: Vercel (apps/web)",
    "API: Railway (apps/api)",
    "Database: Neon Postgres (or keep SQLite for local-only demos)",
    "Follow docs/05-devops/03-go-live-today.md",
    "Set NEXT_PUBLIC_API_URL, WEB_ORIGIN, CORS_ORIGINS, Quiet Agency URL",
  ]);

  h1(doc, "13. Daily owner checklist");
  bullet(doc, [
    "Open /owner — scan KPIs and overrides.",
    "Confirm today's sessions exist for desk late flags.",
    "Glance at pending waivers / pending payments.",
    "Turn on Floor TV before peak classes (/tv/floor).",
    "Desk: focused scan field + session selected.",
    "After close: spot-check kitchen tickets cleared.",
  ]);

  h1(doc, "14. Support & credits");
  p(
    doc,
    "Platform web & system development: Quiet Agency — https://quietagency.co",
  );
  p(
    doc,
    "Gym operations & member experience: Sully's Boxing Gym staff and ownership.",
  );

  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    if (i === 0) continue;
    footer(doc, `Owner & Staff Manual · ${i}/${pages.count - 1}`);
  }
}

const memberFile = await writePdf(
  "Sullys-Member-Family-User-Guide.pdf",
  buildMemberManual,
);
const ownerFile = await writePdf(
  "Sullys-Owner-Staff-Operations-Manual.pdf",
  buildOwnerManual,
);

console.log("Generated:");
console.log(" ", memberFile);
console.log(" ", ownerFile);
console.log("Copied to apps/web/public/docs/ for download from the site.");
