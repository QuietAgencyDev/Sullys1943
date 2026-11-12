/**
 * Desk computer equipment list for the gym install.
 * Not published on the website.
 * Usage: node scripts/sullys-equipment-pdf.mjs "C:\\Users\\user\\Sullys-Equipment-List.pdf"
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
  process.argv[2] ?? path.join(root, "docs", "09-manuals", "Sullys-Equipment-List.pdf");

const RED = "#C82026";
const BROWN = "#3A2418";
const CREAM = "#F3E6C8";
const INK = "#1a120e";
const MUTED = "#5c5148";

const ROWS = [
  ["Desk computer", "Have today", "Windows 11 desktop. 16 GB memory. Wired network port. Chrome. Skip AI and gaming models. A Lenovo ThinkCentre small desktop is the office choice."],
  ["Video outputs", "Need 3", "Desk screen, reception TV, and floor TV each need their own picture. Two HDMI ports need a third output (USB-C dock or extra HDMI). A splitter copies one picture and cannot give each TV its own page."],
  ["Desk screen", "Use the PC", "The computer's own monitor is the desk. Staff console: http://localhost:3001"],
  ["Reception TV", "One TV", "Own HDMI cable from the computer. Reception page, fullscreen (F): http://localhost:3000/tv/reception"],
  ["Floor TV", "One TV", "Own HDMI cable from the computer. Floor page, fullscreen (F), tap once for the bell: http://localhost:3000/tv/floor"],
  ["HDMI cables", "Two, labeled", "One cable per TV. Label them Reception and Floor. Do not use a splitter."],
  ["Wired network", "Required", "Ethernet from the gym network into the computer. Wi-Fi is a backup only."],
  ["QR scanner", "USB 2D", "Member cards are a QR on a phone. A laser gun that only reads printed bars will not work. USB 2D imager that types like a keyboard and presses Enter. Counter: Zebra DS2208. Cordless: Honeywell Voyager XP 1472g."],
  ["Install USB", "Bring it", "Copy Sullys-FRESH (or the latest install folder) onto the stick. On this PC double-click Install to this PC.bat, then Start Sullys on the desktop."],
  ["Helcim terminal", "On order", "Helcim Smart Terminal. Leave it standalone until it is paired. Do not buy a magstripe reader or a card-number keyboard for the computer."],
  ["Keyboard and mouse", "Desk", "USB. Click the scan box before the first member. The scanner types into whatever is focused."],
  ["Speakers", "Floor TV", "The floor page plays the bell. Tap the page once after it opens. Built-in TV speakers are enough."],
];

fs.mkdirSync(path.dirname(dest), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 48, bottom: 42, left: 42, right: 42 },
  info: {
    Title: "Sully's Gym Computer Equipment List",
    Author: "Sully's Boxing Gym",
    Subject: "Desk PC, screens, scanner, and cables",
  },
});

doc.pipe(fs.createWriteStream(dest));

function bar() {
  doc.save();
  doc.rect(0, 0, doc.page.width, 44).fill(BROWN);
  doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(11).text("SULLY'S BOXING GYM  -  EST 1943", 42, 15);
  doc.restore();
  doc.y = 58;
}

bar();
doc.fillColor(RED).font("Helvetica-Bold").fontSize(18).text("Gym computer equipment");
doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("1554 Dundas St W (lower level), Toronto  -  for the desktop PC arriving today");
doc.moveDown(0.35);
doc.fillColor(INK).font("Helvetica").fontSize(10).text(
  "This is the list for the desk computer that runs Sully's: staff console, desk scanner, reception screen, and floor TV. It is not a boxing-gear list. One computer drives the desk and both TVs.",
  { paragraphGap: 4, lineGap: 2 },
);

const left = 42;
const colStatus = 148;
const colNote = 214;
const noteWidth = doc.page.width - 42 - colNote;
let y = doc.y + 4;

doc.rect(left - 4, y - 3, doc.page.width - 80, 16).fill(CREAM);
doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(8);
doc.text("ITEM", left, y);
doc.text("STATUS", colStatus, y);
doc.text("WHAT TO GET / HOW IT IS USED", colNote, y);
y += 18;

for (const [item, status, note] of ROWS) {
  doc.font("Helvetica").fontSize(8);
  const noteHeight = doc.heightOfString(note, { width: noteWidth });
  const rowHeight = Math.max(28, noteHeight + 8);
  if (y + rowHeight > doc.page.height - 88) {
    doc.addPage();
    bar();
    y = doc.y;
  }
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(8.5).text(item, left, y, { width: 100 });
  doc.font("Helvetica").fontSize(8).fillColor(BROWN).text(status, colStatus, y, { width: 60 });
  doc.fillColor(INK).font("Helvetica").fontSize(8).text(note, colNote, y, { width: noteWidth });
  y += rowHeight;
}

doc.y = y + 6;
doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(11).text("Plug in today");
doc.fillColor(INK).font("Helvetica").fontSize(10);
[
  "1.  Put the computer on the desk. Plug in power, ethernet, keyboard, mouse, and the scanner.",
  "2.  Plug one HDMI into the reception TV and one HDMI into the floor TV. Label the cables.",
  "3.  If Windows asks, allow Node on private networks. Chrome is the browser.",
  "4.  Double-click Install to this PC.bat from the USB. When it says Done, double-click Start Sullys on the desktop.",
  "5.  Open Floor TV, Reception TV, and Staff. Press F on each TV. Tap Floor TV once for sound. Click the scan box and scan one test card.",
].forEach((line) => {
  doc.text(line, { paragraphGap: 2, lineGap: 1 });
});

doc.moveDown(0.35);
doc.fillColor(MUTED).font("Helvetica").fontSize(8.5).text(
  "Do not run the installer on a home PC. Do not run npm install. Staff passwords are handed over in person. Helcim tap is not live until one real charge matches the owner total.",
);

doc.save();
doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(
  "Developed by Quiet Agency  -  quietagency.co",
  42,
  doc.page.height - 28,
  { lineBreak: false },
);
doc.restore();

doc.end();
console.log(dest);
