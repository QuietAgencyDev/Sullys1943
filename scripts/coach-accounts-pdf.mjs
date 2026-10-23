/**
 * One-page coach account sheet for the gym.
 * Writes a PDF next to the path given, and does not publish it on the website.
 * Usage: node scripts/coach-accounts-pdf.mjs "C:\\Users\\user\\Sullys-Coach-Accounts.pdf"
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "apps/api/package.json"));
const PDFDocument = require("pdfkit");

const dest =
  process.argv[2] ?? path.join(root, "docs", "09-manuals", "Sullys-Coach-Accounts.pdf");

const RED = "#C82026";
const BROWN = "#3A2418";
const CREAM = "#F3E6C8";
const INK = "#1a120e";
const MUTED = "#5c5148";

const COACHES = [
  ["Rico Mancini", "coach.rico@sullys.local", "Boxtech, Mon-Fri 6:30 PM. Friday Fight Path 2, 7:15 PM. Saturday Beginner Boxing, 11:00 AM. Saturday Fight Path 1 & 2, 12:30 PM."],
  ["Tommy", "coach.tommy@sullys.local", "On the floor. No class is pinned to Tommy on the poster."],
  ["Levi", "coach.levi@sullys.local", "On the floor. No class is pinned to Levi on the poster."],
  ["Anthony P.", "coach.anthony.p@sullys.local", "On the floor. Sweet Science says Anthony only, so it is not assigned to Anthony P."],
  ["Jackie", "coach.jackie@sullys.local", "Body Shop, Wednesday 7:30 AM and 9:00 AM."],
  ["Viktoria Penney", "coach.viktoria@sullys.local", "On the floor. No class is pinned to Viktoria on the poster."],
  ["Jonathan Bochner", "coach.jonathan@sullys.local", "On the floor. No class is pinned to Jonathan on the poster."],
  ["Tony Morrison", "coach@sullys.local", "Tony's House of Pain, weekdays 12:00 PM, 1:30 PM, and 8:00 PM. Little Champs, Monday, Wednesday, and Friday 3:30 PM."],
  ["Anthony Sky", "coach.anthony@sullys.local", "Novice to fighters. On the floor. Sweet Science is not assigned to Anthony Sky."],
];

fs.mkdirSync(path.dirname(dest), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 48, left: 48, right: 48 },
  info: {
    Title: "Sully's Coach Accounts",
    Author: "Sully's Boxing Gym",
    Subject: "Coach sign-in and class setup",
  },
});

doc.pipe(fs.createWriteStream(dest));

function bar() {
  doc.save();
  doc.rect(0, 0, doc.page.width, 46).fill(BROWN);
  doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(11).text("SULLY'S BOXING GYM  -  EST 1943", 48, 16);
  doc.restore();
  doc.y = 62;
}

function h1(text) {
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(18).text(text, { paragraphGap: 4 });
  doc.fillColor(INK);
}

function h2(text) {
  doc.moveDown(0.4);
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(12).text(text);
  doc.fillColor(INK).font("Helvetica").fontSize(10);
}

function body(text) {
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(text, { paragraphGap: 3, lineGap: 2 });
}

function step(n, text) {
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(`${n}.  ${text}`, { paragraphGap: 2, lineGap: 1 });
}

bar();
h1("Coach accounts");
doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("1554 Dundas St W (lower level), Toronto  -  October 22, 2026");
doc.moveDown(0.4);
body("Each coach already has an account. Sign in with the email below. The password on every coach account is password123. Sign in once at the gym computer before class so the roster and the round clock are ready.");

h2("Where to sign in");
body("Gym computer, staff app:  http://localhost:3001");
body("Phone or a computer away from the desk:  https://www.sullys1943.com/app/login");
body("Floor TV, already on the gym screens:  http://localhost:3000/tv/floor");
doc.moveDown(0.2);
body("On the staff sign-in page, tap your name. The email and password fill in. Then press Sign in. You land in Coach Corner.");

h2("Set up a class");
step(1, "Open Coach command. Today's class is at the top. If it is yours, you will see the title, time, and how many people are checked in.");
step(2, "Open Class builder. Name the workout, turn on Kids mode for Little Champs or youth classes, and set the blocks: warmup, rounds, cooldown. Press Save template. That plan drives Live Class and the floor TV.");
step(3, "Open Roster when people arrive. The desk scans each member's boxing card. You mark who is present, and you can see their card and XP.");
step(4, "Press START CLASS. Run the round clock. When the class is done, finish it so the floor awards the class XP.");
step(5, "Messages sends a note to the people in that class. Analytics shows classes taught and attendance after the fact.");
doc.moveDown(0.25);
body("On a phone, sign in at the website, open Coach, and use the same round clock. Building the workout template is done on the staff app at the gym computer.");

h2("Your login and your classes");
doc.moveDown(0.2);

const left = 48;
const colEmail = 168;
const colNote = 330;
const widthNote = doc.page.width - 48 - colNote;
let y = doc.y;

function rowHeader() {
  doc.rect(left - 4, y - 3, doc.page.width - 88, 16).fill(CREAM);
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(8);
  doc.text("COACH", left, y);
  doc.text("EMAIL", colEmail, y);
  doc.text("ON THE POSTER", colNote, y);
  y += 18;
}

rowHeader();
for (const [name, email, note] of COACHES) {
  doc.font("Helvetica").fontSize(8);
  const noteHeight = doc.heightOfString(note, { width: widthNote });
  const rowHeight = Math.max(22, noteHeight + 8);
  if (y + rowHeight > doc.page.height - 64) {
    doc.addPage();
    bar();
    y = doc.y;
    rowHeader();
  }
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(8).text(name, left, y, { width: 112 });
  doc.font("Helvetica").fontSize(7.5).text(email, colEmail, y, { width: 154 });
  doc.font("Helvetica").fontSize(7.5).fillColor(INK).text(note, colNote, y, { width: widthNote });
  y += rowHeight;
  doc.strokeColor("#e4d7c2").moveTo(left, y - 4).lineTo(doc.page.width - 48, y - 4).stroke();
}

doc.y = y + 6;
h2("Desk scanner, for today's test");
body("Front desk: desk@sullys.local  -  password123");
body("Open Desk check-in to scan a member card. Open Opening check (http://localhost:3001/desk/dry-run) if the scanner needs a test before the floor opens. Coaches do not scan cards. The desk scan is what puts a member on the class roster.");

h2("Keep these private");
body("This sheet is for coaches and the front desk. It is not a page on the public website. Sweet Science is listed as Anthony, with no P. and no S., so Anthony P. and Anthony Sky both stay on the floor until a class poster names them.");

doc.end();
console.log(dest);
