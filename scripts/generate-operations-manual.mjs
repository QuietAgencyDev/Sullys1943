/**
 * Sully's operations manual: cover, contents, chapters, glossary.
 * Usage: node scripts/generate-operations-manual.mjs
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
const INK = "#1A120E";
const MUTED = "#5C5148";
const LOGO = path.join(root, "apps", "web", "public", "brand", "sullys-logo-primary.png");

const chapters = [
  {
    title: "1. What this system is",
    body: [
      "This book is how the gym runs the new system. It is for the owner, the coaches, and the front desk. Read it on a phone or print it.",
      "The public site is www.sullys1943.com. Staff and coaches sign in at staff.sullys1943.com. The floor television is www.sullys1943.com/tv/floor. Press F on that page for fullscreen.",
      "The gym is at 1305 Dundas Street West, Toronto, ON M6J 1X8, down the stairs. The old 1554 address is history. Do not send anyone there.",
      "Glofox is still the membership biller. This system does not take a membership payment yet. Do not charge a card here. Do not email the member list. Passwords are handed over in person and are not printed in this book.",
    ],
  },
  {
    title: "2. Who uses which screen",
    body: [
      "Members and parents use the public site on a phone: classes, booking, the check-in card, and the waiver. Parents book the youth and junior classes. There are no walk-ins for those classes, and parents do not make a Glofox account.",
      "Coaches use the staff site on a phone. Coach home lists the day. Program this class is where tomorrow’s work goes: the blocks, the rounds, and the notes. Each coach runs only the class that is theirs.",
      "Front desk uses the staff site at the desk. A booking is not a check-in. The member holds the QR. The desk scans it. Jacob and Jesse use their own front-desk logins.",
      "The floor television is not a login. It is a browser on the wall. It reads the same classes the phones use.",
    ],
  },
  {
    title: "3. The week, and two classes at once",
    body: [
      "Classes run Monday to Friday. Saturday is not on the public board.",
      "12:00 House of Pain, 50 minutes. 1:00 Strength and Conditioning, 50 minutes. 4:30 Youth Boxing on Monday, Wednesday, and Friday, or Junior Boxing on Tuesday and Thursday, 50 minutes, free, parent booking required. 5:30 Beginner Boxing, 50 minutes.",
      "6:30 is two classes. One is the main class: BoxTech on Monday, Wednesday, and Friday, House of Pain on Tuesday and Thursday. The class beside it is Fight Path 1 on Monday and Wednesday, Battle Royale on Tuesday with Coach Jonathan Bochner, and Fight Path 2 on Thursday and Friday.",
      "7:30 is two classes. House of Pain runs every weekday. Beside it: Technical Sparring on Monday and Friday, 90 minutes, invite only. Strength and Conditioning on Wednesday, 50 minutes. Fight Team on Tuesday and Thursday, 90 minutes, invite only.",
      "A standard class holds 25 people. Youth Boxing, Junior Boxing, Fight Team, and Technical Sparring hold 12. Nothing on the board is larger than 25.",
      "When two classes are live, the wall splits into two equal cards. Each card has its own name, its own start and end, and its own time left. The left card is not the only class. On the coach phone, both classes appear, and each one has its own Program this class link.",
    ],
  },
  {
    title: "4. Programming a class",
    body: [
      "The times are already on the board. Tomorrow you add the work inside those times. You do not move the times.",
      "Sign in at staff.sullys1943.com with your own coach email. Open Coach. Find your class. A line that says “with another class” shares that start time.",
      "Tap Program this class. Attach a workout you already built, or open Class builder and write the blocks: title, work or rest, and a note the floor can read.",
      "Save it before the bell. On the day, start runs your clock. If a coach timer is in control, the wall follows that coach’s round. If it is not, the big number is the time left in the class, not a 3-minute round.",
      "Fight Team and Technical Sparring stay invite only. Do not open them to the room.",
    ],
  },
  {
    title: "5. The floor television",
    body: [
      "Open www.sullys1943.com/tv/floor in Chrome. Press F. Tap the page once so the bell can play.",
      "One class on the floor: the big number is the time left in that class, and the line under it is the start and end.",
      "Two classes on the floor: the screen splits. Read both names. Each clock counts down its own class.",
      "The ticker along the bottom is Canadian boxing news and gym notes. It keeps moving. It is not a list of who to bill.",
      "The leaderboard is Sully XP from attendance in this system. It is not a BoxRec record.",
    ],
  },
  {
    title: "6. Payments, on purpose, later",
    body: [
      "Do not turn payments on during the Glofox call. One member, one bill, one month, and only after the Glofox end date is written down.",
      "When memberships move, cards are Stripe and bank debit is GoCardless. Cash stays on the desk ledger. The shop and the donation page stay in demonstration checkout until a real processor is switched on. A gift certificate on the site is not a completed sale until that switch.",
      "The official donation page is www.sullys1943.com/donate. The old sullysboxinggym.com donations page is not the official page.",
      "Stored cards and the old waiver did not come across. Members sign the Sully’s waiver here before they train.",
    ],
  },
];

const glossary = [
  ["B+C", "Two classes in the same time slot. Both are real. Both have their own roster and clock."],
  ["Booking", "A saved seat. It does not mean the person is in the gym."],
  ["Check-in", "The scan at the desk. This is what counts as being on the floor."],
  ["Class clock", "The time left until the class ends. This is the big number when a coach has not taken the round clock."],
  ["Coach home", "The phone screen at staff.sullys1943.com after a coach signs in."],
  ["Floor TV", "The wall browser at www.sullys1943.com/tv/floor. No login."],
  ["Glofox", "The old membership system. It still bills until the written end date. Do not give it a new card number from this book."],
  ["GoCardless", "The bank-debit path for memberships, later. Not switched on."],
  ["Invite only", "Fight Team and Technical Sparring. A coach approves the seat."],
  ["List price", "The posted adult month, $150. Three members are still on $120. Do not invent a second price."],
  ["Mock checkout", "The shop and donate buttons run a demonstration. They do not charge a card."],
  ["Parent booking", "An adult books Youth or Junior. The child does not need a Glofox account."],
  ["Program this class", "Where a coach attaches the workout for one session, including one of a pair."],
  ["Round clock", "The coach’s work and rest timer. It replaces the class clock only while that coach is in control."],
  ["Sully XP", "Points for showing up and finishing. The floor leaderboard ranks them. Not a fight record."],
  ["Stripe", "The card path for memberships, later. Not switched on."],
  ["Waiver", "The Sully’s waiver in this system. The old waiver did not transfer."],
];

const out = path.join(root, "docs", "09-manuals", "Sullys-Operations-Manual.pdf");
const downloads = path.join(process.env.USERPROFILE || "", "Downloads", "Sullys-Operations-Manual.pdf");

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 64, bottom: 58, left: 58, right: 58 },
  bufferPages: true,
  info: {
    Title: "Sully's Operations Manual",
    Author: "Sully's Boxing Gym",
    Subject: "How the gym runs the system",
  },
});
const stream = fs.createWriteStream(out);
doc.pipe(stream);

function header() {
  doc.save();
  doc.rect(0, 0, doc.page.width, 36).fill(BROWN);
  doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(9).text("SULLY'S BOXING GYM  ·  EST 1943", 58, 13, { lineBreak: false });
  doc.fillColor(RED).font("Helvetica").fontSize(9).text("OPERATIONS", 430, 13, { lineBreak: false });
  doc.restore();
  doc.y = 52;
}

function h1(text) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.4);
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(16).text(text);
  doc.moveDown(0.25);
}

function p(text) {
  doc.fillColor(INK).font("Helvetica").fontSize(11).text(text, { lineGap: 3, align: "left" });
  doc.moveDown(0.35);
}

doc.rect(0, 0, doc.page.width, doc.page.height).fill("#140F0C");
doc.rect(0, 0, 14, doc.page.height).fill(RED);
if (fs.existsSync(LOGO)) {
  doc.image(LOGO, 58, 78, { width: 92 });
}
doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(12).text("SULLY'S BOXING GYM", 170, 96);
doc.fillColor(RED).font("Helvetica").fontSize(10).text("EST 1943  ·  TORONTO", 170, 114);
doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(32).text("Operations\nManual", 58, 230, { width: 480 });
doc.fillColor(CREAM).font("Helvetica").fontSize(13).text("How the floor, the phones, and the desk run one system.", 58, 340, { width: 460 });
doc.fillColor(RED).font("Helvetica-Bold").fontSize(11).text("1305 Dundas Street West  ·  down the stairs", 58, 390);
doc.fillColor("#B7A898").font("Helvetica").fontSize(10).text("November 2026  ·  For coaches, front desk, and the owner\nRead it on a phone before launch. Passwords are not in this book.", 58, 640, { width: 460 });

doc.addPage();
header();
h1("Contents");
const contents = [
  "1. What this system is",
  "2. Who uses which screen",
  "3. The week, and two classes at once",
  "4. Programming a class",
  "5. The floor television",
  "6. Payments, on purpose, later",
  "Glossary",
];
contents.forEach((line, i) => {
  doc.fillColor(i === contents.length - 1 ? RED : INK).font("Helvetica-Bold").fontSize(13).text(line);
  doc.moveDown(0.28);
});
p("Each chapter is short enough to read on a phone between classes. The glossary is the last chapter. If a word on the screen is new, look there before you change a setting.");

for (const chapter of chapters) {
  doc.addPage();
  header();
  h1(chapter.title);
  for (const paragraph of chapter.body) p(paragraph);
}

doc.addPage();
header();
h1("Glossary");
p("These words mean one thing in this gym. Use them the same way on the phone, at the desk, and on the wall.");
for (const [term, meaning] of glossary) {
  if (doc.y > 700) {
    doc.addPage();
    header();
  }
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(12).text(term);
  doc.fillColor(INK).font("Helvetica").fontSize(11).text(meaning, { lineGap: 2 });
  doc.moveDown(0.35);
}

const range = doc.bufferedPageRange();
for (let i = 1; i < range.count; i += 1) {
  doc.switchToPage(i);
  const y = doc.page.height - 36;
  doc.strokeColor("#E4D8C8").moveTo(58, y - 8).lineTo(doc.page.width - 58, y - 8).stroke();
  doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Sully's Boxing Gym  ·  Operations manual", 58, y, { lineBreak: false });
  doc.text(String(i), doc.page.width - 80, y, { width: 22, align: "right", lineBreak: false });
}

doc.end();
stream.on("finish", () => {
  fs.copyFileSync(out, downloads);
  console.log(out);
  console.log(downloads);
});
