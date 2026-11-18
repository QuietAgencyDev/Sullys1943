/**
 * Printable store-setup sheet for Sully's 1943.
 * Usage: node scripts/generate-app-stores.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "apps/api/package.json"));
const PDFDocument = require("pdfkit");

const LOGO = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-user-cursor-SULLYS",
  "assets",
  "SullysLogo3-eaf96665-fd58-4f6d-b607-7a9248751e9a.jpg",
);
const out = path.join(root, "docs", "08-process", "Sullys-App-Stores.pdf");
const INK = "#000000";
const MUTED = "#333333";

function headerBar(doc) {
  doc.save();
  if (fs.existsSync(LOGO)) doc.image(LOGO, 46, 16, { height: 38 });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(9).text("APP STORES", 96, 22, { lineBreak: false });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Developed by Quiet Agency", 96, 36, { lineBreak: false });
  doc.strokeColor(INK).lineWidth(1.25).moveTo(54, 62).lineTo(doc.page.width - 54, 62).stroke();
  doc.restore();
  doc.x = 54;
  doc.y = 74;
}

function paintFooters(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - 30;
    doc.save();
    doc.strokeColor("#000").lineWidth(0.6).moveTo(54, y - 8).lineTo(doc.page.width - 54, y - 8).stroke();
    doc.fillColor(INK).font("Helvetica").fontSize(8).text("Developed by Quiet Agency  ·  quietagency.co", 54, y, {
      width: 380,
      lineBreak: false,
    });
    doc.text(`${i + 1} / ${range.count}`, doc.page.width - 90, y, { width: 36, align: "right", lineBreak: false });
    doc.restore();
    doc.page.margins.bottom = bottom;
  }
}

function need(doc, height) {
  if (doc.y + height > doc.page.height - 56) {
    doc.addPage();
    headerBar(doc);
  }
}

function h1(doc, text) {
  doc.x = 54;
  need(doc, 72);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(13).text(text.toUpperCase(), { width: 504 });
  doc.strokeColor(INK).lineWidth(0.8).moveTo(54, doc.y + 2).lineTo(180, doc.y + 2).stroke();
  doc.moveDown(0.45);
}

function para(doc, text) {
  doc.x = 54;
  need(doc, 32);
  doc.fillColor(INK).font("Helvetica").fontSize(10.5).text(text, { width: 504, lineGap: 2 });
  doc.moveDown(0.35);
}

function bullet(doc, text) {
  doc.x = 54;
  need(doc, 22);
  const y = doc.y;
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(10.5).text("•", 54, y, { lineBreak: false });
  doc.font("Helvetica").text(text, 70, y, { width: 488, lineGap: 1 });
  doc.moveDown(0.2);
}

function num(doc, n, text) {
  doc.x = 54;
  need(doc, 22);
  const y = doc.y;
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(10.5).text(String(n), 54, y, { width: 16, lineBreak: false });
  doc.font("Helvetica").text(text, 74, y, { width: 484, lineGap: 1 });
  doc.moveDown(0.18);
}

function check(doc, text) {
  doc.x = 54;
  need(doc, 20);
  const y = doc.y + 1;
  doc.lineWidth(1).strokeColor(INK).rect(54, y, 9, 9).stroke();
  doc.fillColor(INK).font("Helvetica").fontSize(10.5).text(text, 72, doc.y, { width: 486, lineGap: 1 });
  doc.moveDown(0.22);
}

function urlLine(doc, label, url) {
  doc.x = 54;
  need(doc, 28);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(10).text(label, { width: 504 });
  doc.fillColor(MUTED).font("Courier").fontSize(8).text(url, { width: 504 });
  doc.moveDown(0.25);
}

function row(doc, cols, bold) {
  need(doc, 16);
  const y = doc.y;
  const x = [54, 250, 400];
  const w = [190, 140, 158];
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8.5).fillColor(INK);
  cols.forEach((text, index) => {
    doc.text(text, x[index], y, { width: w[index], lineBreak: false });
  });
  doc.x = 54;
  doc.y = y + 13;
  doc.strokeColor("#bbbbbb").lineWidth(0.4).moveTo(54, doc.y).lineTo(558, doc.y).stroke();
  doc.y += 3;
}

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 48, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: "Sully's 1943 App Store and Google Play",
    Author: "Quiet Agency",
    Subject: "Store costs and what has to work by Monday 16 November 2026",
  },
});
const stream = fs.createWriteStream(out);
doc.pipe(stream);

if (fs.existsSync(LOGO)) doc.image(LOGO, 196, 48, { width: 220 });
doc.y = 300;
doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text("Sully's 1943", 54, doc.y, { width: 504, align: "center" });
doc.moveDown(0.25);
doc.font("Helvetica").fontSize(13).text("App Store and Google Play", { width: 504, align: "center" });
doc.moveDown(0.6);
doc.fontSize(11).text("The app is free. Members do not pay to download it.", { width: 504, align: "center" });
doc.moveDown(0.35);
doc.fontSize(11).text("Monday 16 November uses the phone you already have.", { width: 504, align: "center" });
doc.text("The stores come after the developer accounts are approved.", { width: 504, align: "center" });
doc.moveDown(0.8);
doc.fontSize(10).text("1305 Dundas Street West (down the stairs), Toronto", { width: 504, align: "center" });
doc.moveDown(0.8);
doc.font("Helvetica-Bold").fontSize(12).text("Developed by Quiet Agency", { width: 504, align: "center" });
doc.font("Helvetica").fontSize(10).text("quietagency.co", { width: 504, align: "center" });
doc.moveDown(0.7);
doc.fontSize(9).text("Office print  ·  12 November 2026  ·  Letter  ·  Black and white", { width: 504, align: "center" });
doc.moveDown(0.35);
doc.font("Helvetica-Oblique").fontSize(9).text("Fees are the stores' own prices in US dollars. Canadian amounts use 1.40 per US dollar as a planning rate, not a bill.", {
  width: 460,
  align: "center",
});

doc.addPage();
headerBar(doc);
h1(doc, "1  ·  Monday");
para(doc, "The gym opens Monday 16 November. Apple and Google will not have a public store listing ready by then. A new organization account can wait on a D-U-N-S number, and a first public release waits on store review. Do not tell members the App Store or Google Play icon is there on Monday.");
para(doc, "Monday's app is the member site on the phone. It already signs people in, books a class, and shows the check-in card.");
num(doc, "1", "On the member's phone, open https://www.sullys1943.com/app on the gym Wi-Fi.");
num(doc, "2", "iPhone: Share, then Add to Home Screen. Android: the browser menu, then Add to Home screen or Install app.");
num(doc, "3", "They sign in, book the class, then open the card and scan at the desk before they step on the floor.");
num(doc, "4", "A booking is not a check-in. No scan, not on the floor.");
para(doc, "The desk computer and the wall TV are separate. They do not need the store apps.");

h1(doc, "2  ·  What the stores cost");
para(doc, "These are the fees Apple and Google publish for a developer account. Confirm the charge on their own page before the card is used. The planning rate is 1.40 Canadian dollars per US dollar, the same rate as the 9 November cost sheet. It is not an invoice.");
row(doc, ["Item", "Their price", "Planning CAD"], true);
row(doc, ["Apple Developer Program", "99 USD per year", "About $139 a year"]);
row(doc, ["Google Play Console", "25 USD once", "About $35 once"]);
row(doc, ["Both, first year", "124 USD", "About $174"]);
row(doc, ["D-U-N-S number", "Free", "$0"]);
row(doc, ["Member download", "Free", "$0"]);
doc.moveDown(0.35);
para(doc, "The app is free on both stores. There is no price to download it, and there is no charge inside the app. Apple's yearly fee and Google's one-time fee are paid by the publisher, not by a member. Apple renews every year. Google's $25 does not.");
para(doc, "Gym dues are not an App Store purchase. Card memberships stay on Stripe. Bank debit stays on GoCardless. Both stay off until Glofox is cancelled and the transfer is agreed. Do not bill the same month in two places.");

h1(doc, "3  ·  Who publishes");
para(doc, "Quiet Agency opens the developer accounts and publishes. The app name on the phone is Sully's Boxing Gym. The seller name is the legal name on the account. If the account is Quiet Agency, the store can show Quiet Agency as the developer and Sully's as the app. If the seller must read Sully's Boxing Gym, the gym's own legal entity needs the account.");
bullet(doc, "Organization account if the name on the store should be a company. Apple and Google ask for a D-U-N-S number. Getting that number is free and can take longer than a weekend. It will not be ready for Monday if it is not already on file.");
bullet(doc, "Individual account is faster and shows a person's legal name as the seller. Google's personal accounts opened recently must run a closed test with 12 testers for 14 days before a public release. That test also misses Monday.");

doc.addPage();
headerBar(doc);
h1(doc, "4  ·  Open the two accounts");
para(doc, "Do this in the name that will own the app. Use a company card if the account is the company. Use the person's own card if the account is an individual. Apple can delay an enrollment when the card name does not match.");
num(doc, "1", "Apple. Sign in with an Apple Account that has two-factor authentication. Enroll in the Apple Developer Program. Pay the 99 USD year. Save the Apple ID and the team name. Do not share the password in a chat.");
num(doc, "2", "Google. Sign in with a Google Account. Open Play Console. Accept the agreement. Pay the 25 USD once. Choose organization or personal. Finish identity checks. Google may ask for a government ID. A rejected identity does not refund the $25.");
num(doc, "3", "If the account is an organization, look up or request the D-U-N-S number before paying Apple. The legal name, address, and phone must match the D-U-N-S record.");
num(doc, "4", "Send Quiet Agency the team access, not the password. Apple: invite quietagency as Admin on the team. Google: invite the Quiet Agency Google account as Admin. Access can be removed later without closing the store.");
urlLine(doc, "Apple Developer Program", "https://developer.apple.com/programs/");
urlLine(doc, "Apple D-U-N-S lookup", "https://developer.apple.com/enroll/duns-lookup/");
urlLine(doc, "Google Play Console", "https://play.google.com/console/signup");

h1(doc, "5  ·  Have these ready before the first upload");
bullet(doc, "App name: Sully's Boxing Gym. Price: Free. Support email: info@sullysboxinggym.com. Phone: (416) 805-8108.");
bullet(doc, "Privacy page: https://www.sullys1943.com/privacy. Both stores require a public privacy policy.");
bullet(doc, "A short description: sign in, book a class, scan the card at the desk before the floor.");
bullet(doc, "Screenshots of sign-in, the class book, and the check-in card, on a phone-shaped screen.");
bullet(doc, "An app icon from the Sully's shield. No passwords on any screenshot.");
para(doc, "Quiet Agency packages the member app, uploads a test build, then submits for review. The first public listing is after that review, not the day the account is paid.");

h1(doc, "6  ·  Monday checklist");
check(doc, "Members use https://www.sullys1943.com/app and add it to the home screen.");
check(doc, "They sign in, book a class, and scan at the desk before the floor.");
check(doc, "The desk scanner is clicked and ready. The wall TV is on the floor page.");
check(doc, "Nobody is told to search the App Store or Google Play yet.");
check(doc, "Stripe and GoCardless stay off. Glofox is still the biller until it is cancelled.");
check(doc, "Quiet Agency has been invited to the Apple team and the Play Console, or the accounts are still being opened.");
para(doc, "Support for the system: Quiet Agency, quietagency.co. Gym questions: the owner, then info@sullysboxinggym.com.");
para(doc, "Boxing is the engine. People are the purpose. Character is the legacy.");

paintFooters(doc);
doc.end();
stream.on("finish", () => {
  console.log(`${out} (${fs.statSync(out).size} bytes)`);
});
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
