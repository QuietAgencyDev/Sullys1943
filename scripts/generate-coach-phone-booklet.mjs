/**
 * Phone booklet for coaches. Open the PDF on a phone, or print it.
 * Usage: node scripts/generate-coach-phone-booklet.mjs
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

const out = path.join(root, "docs", "09-manuals", "Sullys-Coach-Phone-Booklet.pdf");
const downloads = path.join(
  process.env.USERPROFILE || "",
  "Downloads",
  "Sullys-Coach-Phone-Booklet.pdf",
);

function h1(doc, text) {
  doc.moveDown(0.6);
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(18).text(text);
  doc.moveDown(0.25);
}

function p(doc, text) {
  doc.fillColor(INK).font("Helvetica").fontSize(12).text(text, { lineGap: 3 });
  doc.moveDown(0.35);
}

function step(doc, n, text) {
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(12).text(`${n}. ${text}`, { lineGap: 2 });
  doc.moveDown(0.28);
}

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 48, bottom: 48, left: 48, right: 48 },
  info: {
    Title: "Sully's coach phone booklet",
    Author: "Sully's Boxing Gym",
  },
});
const stream = fs.createWriteStream(out);
doc.pipe(stream);

doc.rect(0, 0, doc.page.width, 72).fill(BROWN);
doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(16).text("SULLY'S BOXING GYM", 48, 22);
doc.font("Helvetica").fontSize(11).text("Coach booklet · read this on your phone before launch", 48, 44);

doc.y = 92;
doc.fillColor(INK);

h1(doc, "Where you are");
p(doc, "The gym is at 1305 Dundas Street West, down the stairs, Toronto, ON M6J 1X8. The public site is www.sullys1943.com. Your phone home is staff.sullys1943.com.");
p(doc, "Glofox is still the biller. Do not take a membership payment in this system. Do not email the member list. Your password is handed to you in person. It is not printed here.");

h1(doc, "Sign in on your phone");
step(doc, "1", "Open staff.sullys1943.com.");
step(doc, "2", "Sign in with your own coach email. Do not use the front-desk login.");
step(doc, "3", "Open Coach. That is your home.");

h1(doc, "Two classes at once");
p(doc, "At 6:30 and at 7:30, two classes run together. The wall TV splits into two cards. Each card has its own name, its own clock, and its own spots. A standard class holds 25. Youth Boxing, Junior Boxing, Fight Team, and Technical Sparring hold 12.");
p(doc, "You program only your class. The other coach programs the class beside you. If your name is not on a class, it is an open floor class and any coach on duty can run it.");

h1(doc, "Tomorrow: write your class");
step(doc, "1", "On Coach home, find your class in the floor list. A line that says “with another class” shares that start time.");
step(doc, "2", "Tap Program this class.");
step(doc, "3", "Attach a workout, or build one under Class builder: blocks, rounds, and notes.");
step(doc, "4", "Save it before the bell. On the day, Start runs your clock on the wall. The other class keeps its own clock.");
p(doc, "Class details can be filled in tomorrow. The times are already on the board. You are adding the work inside those times, not moving the times.");

h1(doc, "The week");
p(doc, "Monday to Friday. 12:00 House of Pain. 1:00 Strength and Conditioning. 4:30 Youth Boxing on Monday, Wednesday, and Friday, or Junior Boxing on Tuesday and Thursday. 5:30 Beginner Boxing. 6:30 the main class plus the second class beside it. 7:30 House of Pain plus the second class beside it. Fight Team and Technical Sparring are 90 minutes and invite only.");

h1(doc, "The wall");
p(doc, "The floor TV is www.sullys1943.com/tv/floor. Press F for fullscreen. Tap the page once if the bell does not play. When two classes are live, read both cards. Do not treat the left card as the only class.");

doc.end();

stream.on("finish", () => {
  fs.mkdirSync(path.dirname(downloads), { recursive: true });
  fs.copyFileSync(out, downloads);
  console.log(out);
  console.log(downloads);
});
