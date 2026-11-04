/**
 * Three-page owner brief for Danielle. Stays off the public site.
 * Usage: node scripts/generate-danielle-owner-brief.mjs
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
const privateDir = path.join(root, "apps", "api", "private", "manuals");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });

const RED = "#C82026";
const BROWN = "#3A2418";
const INK = "#1A120E";
const CREAM = "#F3E6C8";

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 56, bottom: 52, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: "Sully's — For Danielle",
    Author: "Quiet Agency",
    Subject: "Why the house system beats Glofox, and how it meets QuickBooks",
  },
});
const dest = path.join(outDir, "Sullys-For-Danielle.pdf");
const stream = fs.createWriteStream(dest);
doc.pipe(stream);

function spine() {
  doc.rect(0, 0, 12, doc.page.height).fill(RED);
}

function footer(page, total) {
  const y = doc.page.height - 36;
  doc
    .strokeColor("#E4D3B4")
    .moveTo(54, y - 8)
    .lineTo(doc.page.width - 54, y - 8)
    .stroke();
  doc
    .fillColor(BROWN)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Boxing is the engine. People are the purpose. Character is the legacy.",
      54,
      y,
      { width: 340, lineBreak: false },
    );
  doc.text(`For Danielle · ${page} of ${total}`, 54, y, {
    width: doc.page.width - 108,
    align: "right",
    lineBreak: false,
  });
}

function h1(text) {
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(22).text(text, 54, doc.y, {
    width: 500,
  });
  doc.moveDown(0.35);
}

function h2(text) {
  doc.moveDown(0.25);
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(13).text(text, { width: 500 });
  doc.moveDown(0.15);
}

function p(text) {
  doc.fillColor(INK).font("Helvetica").fontSize(11).text(text, { width: 500, lineGap: 3 });
  doc.moveDown(0.35);
}

function bullets(lines) {
  for (const line of lines) {
    doc.fillColor(INK).font("Helvetica").fontSize(11).text(`•  ${line}`, {
      width: 500,
      lineGap: 2,
    });
    doc.moveDown(0.18);
  }
  doc.moveDown(0.2);
}

spine();
doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(11).text("SULLY'S BOXING GYM · EST 1943", 54, 48);
doc.fillColor(RED).fontSize(9).text("OWNER BRIEF  ·  NOVEMBER 2026", 54, 64);
doc.fillColor(INK).font("Helvetica-Bold").fontSize(28).text("For Danielle", 54, 96);
doc.fillColor(BROWN).font("Helvetica").fontSize(13).text(
  "One house system. Less rent on software.\nMore of the day kept inside Sully's.",
  54,
  136,
  { width: 460, lineGap: 2 },
);

doc.y = 190;
h1("Why this is easier than Glofox");
p("Glofox is a booking app you rent. It was built for every kind of studio. This one was built for the door, the floor, and the morning you already run at 1554 Dundas.");
bullets([
  "The member's phone is the card. The desk scans it. If the waiver is missing, the card does not open. Staff can override, and the reason lands on your brief.",
  "The coach runs the round from one page. The floor TV follows that clock, then returns to the house cards between rounds.",
  "You open one screen in the morning: money today, who came in, who still owes a waiver, and who to call.",
  "Parents see their child's class and waiver. They do not see the adult books.",
  "Youth classes stay free, the way the gym already runs Little Champs and Jab Lab.",
]);
p("Staff do not learn a second product. Members do not download a studio app that also belongs to a software company. The list of members stays in Sully's database.");

doc.addPage();
spine();
doc.y = 48;
h1("How it ties into QuickBooks");
p("Two books, on purpose. Sully's is the book of the gym: who is a member, who paid cash, who paid card, who was late, who still needs a waiver. QuickBooks is the book of the business: the sales and the deposit. Card numbers never go into either book from this system.");
h2("What you will see");
bullets([
  "Each day the owner brief already splits the till: cash on the Sully's ledger, card on the Helcim terminal.",
  "After the terminal has matched the brief for a week or two, the bookkeeper gets a simple export of settled Canadian totals. Not a member list. Not a waiver. A day of money.",
  "The next step is a nightly send into QuickBooks Online. The same day cannot be posted twice. If Helcim is also set to send deposits to QuickBooks, we turn one of them off so the deposit is not doubled.",
]);
h2("Where it stands today");
p("QuickBooks is not connected yet. The owner brief says Planned. That is deliberate. The terminal has to be trusted before a number is allowed to become an accounting entry. Connecting it early would give the bookkeeper a clean file of the wrong day.");
p("Helcim is the card service. Sully's still owns the membership. Cash never needs to pass through Helcim. Card does. QuickBooks receives the result, after the fact.");

doc.addPage();
spine();
doc.y = 48;
h1("Where Sully's saves, and where it earns");
h2("Money that stops leaving");
bullets([
  "Glofox is a monthly platform bill that sits on top of the gym, and it grows as the member list grows. This app's hard cost is the hosting bill: about $6 to $40 USD a month once the paid plans are on, plus the domain once a year. The printed costs sheet has the lines.",
  "You stop paying staff to retype the day into QuickBooks. The export is the same numbers already on your morning screen.",
  "A missed waiver or a shared login is how a desk loses a visit and loses the trail. Here the card will not issue, and an override names the person who allowed it.",
  "Youth are not a software seat you rent. The class is free in the system because it is free in the gym.",
]);
h2("Money the gym keeps that used to walk out");
bullets([
  "A full class does not turn a member away and forget them. The waitlist moves the next person in when someone cancels.",
  "A member who misses two classes in two weeks shows up as a name to call, before they quietly disappear.",
  "Drop-in cash and card hit the same day on your brief, next to yesterday, so a short till is visible before the deposit.",
  "The floor TVs sell the house, the coaches, and the neighbours while the round is on. That is advertising you are not buying.",
]);
p("None of this is a promise of a dollar figure. It is the work the desk and the floor already do, kept in one place so less of it leaks.");
doc.moveDown(0.4);
doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(11).text(
  "Prepared for Danielle · Sully's Boxing Gym · Quiet Agency · November 2026",
  { width: 500 },
);
doc.moveDown(0.25);
doc.font("Helvetica").fontSize(10).fillColor(INK).text(
  "Private. Not for the public website. Adult monthly price on the join page stays the desk rate until you name the number you want published.",
  { width: 500, lineGap: 2 },
);

const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i += 1) {
  doc.switchToPage(i);
  footer(i + 1, range.count);
}

doc.end();
stream.on("finish", () => {
  fs.copyFileSync(dest, path.join(privateDir, "Sullys-For-Danielle.pdf"));
  console.log(dest);
});
