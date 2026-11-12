/**
 * Black-and-white master setup book for the office printer.
 * Usage: node scripts/generate-glofox-helcim-setup.mjs
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
const out = path.join(root, "docs", "08-process", "Sullys-Master-Setup.pdf");

const INK = "#000000";
const MUTED = "#333333";

function headerBar(doc) {
  doc.save();
  if (fs.existsSync(LOGO)) doc.image(LOGO, 46, 16, { height: 38 });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(9).text("MASTER SETUP", 96, 22, { lineBreak: false });
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
  const x = [54, 168, 360];
  const w = [110, 186, 198];
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8).fillColor(INK);
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
    Title: "Sully's Master Setup",
    Author: "Quiet Agency",
    Subject: "Office print for Glofox, Helcim, logins, and the desk",
  },
});
const stream = fs.createWriteStream(out);
doc.pipe(stream);

if (fs.existsSync(LOGO)) doc.image(LOGO, 196, 48, { width: 220 });
doc.y = 300;
doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text("Master Setup", 54, doc.y, { width: 504, align: "center" });
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(12).text("Leave Glofox. Set up Helcim. Open the gym.", { width: 504, align: "center" });
doc.moveDown(0.8);
doc.fontSize(11).text("1554 Dundas St W (lower level), Toronto, ON M6H 1Z6", { width: 504, align: "center" });
doc.text("(416) 805-8108  ·  info@sullysboxinggym.com", { width: 504, align: "center" });
doc.text("Mon–Fri 7:30 AM–9:00 PM  ·  Sat 11:00 AM–5:00 PM  ·  Sunday closed", { width: 504, align: "center" });
doc.moveDown(1.2);
doc.font("Helvetica-Bold").fontSize(12).text("Developed by Quiet Agency", { width: 504, align: "center" });
doc.font("Helvetica").fontSize(10).text("quietagency.co", { width: 504, align: "center" });
doc.moveDown(0.8);
doc.fontSize(9).text("Office print  ·  5 November 2026  ·  Letter  ·  Black and white", { width: 504, align: "center" });
doc.moveDown(0.4);
doc.font("Helvetica-Oblique").fontSize(9).text("Keep this book in the office. Do not leave the login page on a floor TV.", {
  width: 460,
  align: "center",
});

doc.addPage();
headerBar(doc);
h1(doc, "1  ·  Sign-in accounts");
para(
  doc,
  "Seed accounts are for gym setup. Passwords are handed over in person and are not printed in this book. A person imported from Glofox does not get a shared password. They use Forgot password when that email is turned on. Give each real staff person their own account. Do not share one login across the desk.",
);
row(doc, ["Role", "Email", "Signs in at"], true);
const staff = "https://staff.sullys1943.com";
const memberSite = "https://www.sullys1943.com/app/login";
const logins = [
  ["Owner", "owner@sullys.local", staff],
  ["Admin", "admin@sullys.local", staff],
  ["Front desk", "desk@sullys.local", staff],
  ["Tony Morrison", "coach@sullys.local", staff],
  ["Rico Mancini", "coach.rico@sullys.local", staff],
  ["Tommy", "coach.tommy@sullys.local", staff],
  ["Levi", "coach.levi@sullys.local", staff],
  ["Anthony A.", "coach.anthony.p@sullys.local", staff],
  ["Jackie", "coach.jackie@sullys.local", staff],
  ["Viktoria Penney", "coach.viktoria@sullys.local", staff],
  ["Jonathan Bochner", "coach.jonathan@sullys.local", staff],
  ["Anthony Sky", "coach.anthony@sullys.local", staff],
  ["Member, Gavin Sheppard", "member@sullys.local", memberSite],
  ["Parent, Sam Parent", "parent@sullys.local", memberSite],
  ["Youth, Emma Kid", "kid@sullys.local", memberSite],
];
for (const line of logins) row(doc, line, false);
doc.moveDown(0.35);
para(doc, "Passwords are handed over in person. Do not leave a signed-in desk computer where members can reach it.");

h1(doc, "2  ·  Where each job starts");
urlLine(doc, "Public site", "https://www.sullys1943.com");
urlLine(doc, "Member sign-in and Forgot password", "https://www.sullys1943.com/app/login");
urlLine(doc, "Staff console", "https://staff.sullys1943.com");
urlLine(doc, "Owner brief", "https://staff.sullys1943.com/owner");
urlLine(doc, "Staff accounts", "https://staff.sullys1943.com/admin/users");
urlLine(doc, "Desk check-in", "https://staff.sullys1943.com/desk");
urlLine(doc, "Door kiosk", "https://staff.sullys1943.com/desk/kiosk");
urlLine(doc, "Opening check", "https://staff.sullys1943.com/desk/dry-run");
urlLine(doc, "Coach home", "https://staff.sullys1943.com/coach");
urlLine(doc, "Member card, the QR", "https://www.sullys1943.com/app/card");
urlLine(doc, "Waiver", "https://www.sullys1943.com/app/waiver");
urlLine(doc, "Family, guardian waiver", "https://www.sullys1943.com/app/family");
urlLine(doc, "Reception screen", "https://www.sullys1943.com/tv/reception");
urlLine(doc, "Floor screen", "https://www.sullys1943.com/tv/floor");
urlLine(doc, "System check", "https://api.sullys1943.com/api/v1/health");
para(doc, "Owner and admin can open money and staff accounts. A coach can run class, roster, live mode, messages, and coach notes. A coach cannot open the owner money page. Front desk can scan, override with a reason, run the kiosk, and run the opening check. Youth rounds stay with the coach. The shadow round is adults only.");

h1(doc, "3  ·  Owner manual");
para(doc, "Sign in on the staff console before the first member reaches the desk. If the staff page will not load, check the gym internet first.");
para(doc, "Morning. Open the owner brief. Read revenue against yesterday, check-ins, classes and how full they are, active members split youth and adult, pending waivers, pending payments, then staff overrides. Every override needs a real reason. Pending waivers and pending payments should be near empty before the evening classes.");
para(doc, "Open the gym.");
num(doc, "1", "Power the desk computer, the scanner, the network, and every screen. One cable from the computer to each TV. A splitter copies one picture and cannot give each TV its own page.");
num(doc, "2", "Sign in as the owner.");
num(doc, "3", "Read the owner brief. Confirm today's classes are on the board.");
num(doc, "4", "Reception: open the reception address and press F for fullscreen.");
num(doc, "5", "Floor: open the floor address, press F, then tap the page once so the bell can play.");
num(doc, "6", "Open desk check-in. Click the scan box. Scan one test card before the door opens.");
para(doc, "The scanner is a keyboard. It types the code and presses Enter. If the cursor is in the wrong box, the scan is missed. Hold the phone about a hand's width away, brightness up. The code changes about every 60 seconds.");
para(doc, "A clean scan checks the member in. If the system blocks them, read the reason. It is usually an unsigned waiver or a membership that is not active. An override needs a written reason of more than a word. That reason shows on the owner brief. No signed waiver, no QR. A child card waits for the guardian waiver at Family.");
para(doc, "Cash stays on the Sully's desk ledger. Do not tell members that tap or card-on-file is live until one real Helcim charge matches the owner total. Never write a card number down.");
para(doc, "People. Only the owner and an admin open staff accounts. Invite the person, hand them a temporary password in person, and have them replace it. When someone leaves, disable the account before they leave the building. You cannot disable your own account.");
para(doc, "Messages from the owner brief go to a group: active members, youth, adults, trial, monthly, or people who still owe a waiver. No medical detail and no card number in a broadcast. The kitchen is not open. Do not take food orders on the system.");
para(doc, "Close. Coaches finalize attendance. Read the owner brief once more. Log out of the staff console if the desk computer stays where members can reach it. The last person out is the person who looked at the owner brief.");
para(doc, "When it breaks. Both sites down: the building connection is down, and the floor TV can keep the last class. Scan does nothing: click the scan box. No QR: waiver, or the parent for a youth. Floor silent: tap the page once. Wrong class on the floor: the coach starts Live Class Mode for the class that is actually in the room. A frozen owner number: refresh. It should move within a few seconds.");

h1(doc, "4  ·  Coach manual");
para(doc, "The coach runs the class. The desk runs the door. The owner runs the money. Sign in with that coach's own account. Home is Coach Command, titled Today on the floor.");
num(doc, "1", "Open today's class before the athletes are in the ring. The floor TV follows Live Class Mode.");
num(doc, "2", "Read who is checked in, who is still due, and who needs a look. Know the new names.");
num(doc, "3", "Roster and boxing cards: pick the session, mark attendance honestly, and write the next step on the card. A no-show is a no-show. A void needs a reason.");
num(doc, "4", "Live Class Mode is the clock. Start when the room is ready. One coach drives the clock. Kids classes stay in kids language. Finish from this page so class XP is awarded. If the TV says the feed dropped, keep the round and tell the desk.");
num(doc, "5", "Build the workout before class, from Program every bell, and attach it to the class. Do not describe a different workout than the one on the screen.");
num(doc, "6", "Messages are for that class. Gym-wide notes come from the owner. No card numbers, no medical detail, no other athlete's business.");
num(doc, "7", "After class, complete Live, finalize the roster, and leave the next coach a clean page.");
para(doc, "An athlete who says they paid and is not on the roster goes to the desk. A coach who cannot sign in does not use someone else's account.");

h1(doc, "5  ·  Leave Glofox");
para(doc, "Do this while Glofox is still billing. Sully's does not cancel Glofox. Do not bill the same month in both places.");
num(doc, "1", "Sign in to Glofox. Open Manage, then Clients.");
num(doc, "2", "Optional: filter to active people if that package allows filters.");
num(doc, "3", "Actions, then Download. Save the CSV.");
num(doc, "4", "The header must include email, first name, last name, and should include phone, membership, status, start, and end.");
num(doc, "5", "Send the file to Quiet Agency in private. Do not post it in a group chat. Delete it after the import is confirmed.");
urlLine(doc, "Glofox sign-in", "https://app.glofox.com/");
urlLine(doc, "How to download the client list", "https://support.glofox.com/hc/en-us/articles/46433498252564-How-to-Download-a-Client-List");
para(doc, "A row with no email or no name is skipped. An email already in Sully's is kept. Card numbers are ignored. Waivers, class history, and stored cards do not come across. Youth, kid, child, Little Champ, Jab Lab, or free becomes the youth plan. Everything else becomes the adult monthly plan. Cancelled, expired, inactive, or frozen comes in cancelled. Paused stays paused.");
para(doc, "Quiet Agency runs a dry pass, then the write. New people set a password from Forgot password and sign the Sully's waiver before a check-in card will issue.");
urlLine(doc, "Dry run, writes nothing", "node scripts/import-glofox-members.mjs members.csv");
urlLine(doc, "Write", "node scripts/import-glofox-members.mjs members.csv --commit");
para(doc, "When a person is active in Sully's, has a password, and has signed the waiver, stop their next Glofox renewal. Stop new Glofox sales when the lists match. Cancel Glofox only after the owner says the two lists agree.");

h1(doc, "6  ·  Helcim");
para(doc, "Helcim takes the card. Sully's keeps memberships, waivers, cash, and the owner totals. The gym system never stores a full card number. The processing rate is the rate in the Helcim merchant agreement, not a number from a marketing page.");
num(doc, "1", "Open a Canadian Helcim merchant account. Finish identity checks and the bank deposit account.");
num(doc, "2", "Turn on online payments. Order the Smart Terminal from the Helcim dashboard. Leave it in standalone mode until Quiet Agency says to pair it.");
num(doc, "3", "Create an API access configuration that can start a HelcimPay purchase. Copy the API token once. Helcim will not show it again.");
num(doc, "4", "Send Quiet Agency the token, the account id, and, when Helcim shows them, the webhook secret and the terminal device code. Use the private channel you already use for passwords. Do not write them on this paper.");
num(doc, "5", "Quiet Agency sets PAYMENT_PROVIDER to helcim and sets HELCIM_API_TOKEN. Those two are what the software reads today. They open a HelcimPay checkout in Canadian dollars. The account id, webhook secret, and terminal id are collected now and are not read by the software yet. Do not invent a webhook address.");
urlLine(doc, "Helcim", "https://www.helcim.com/");
urlLine(doc, "Helcim sales", "sales@helcim.com    +1 (877) 643-5246");
urlLine(doc, "Smart Terminal", "https://www.helcim.com/smart-terminal/");
urlLine(doc, "Create the API token", "https://devdocs.helcim.com/docs/authentication-with-the-helcim-api-and-helcimpayjs");
urlLine(doc, "Pair the terminal later", "https://learn.helcim.com/docs/using-the-helcim-smart-terminal-api");
para(doc, "A standalone terminal sale is a Helcim sale. Write it on the desk ledger until the owner total matches the terminal. QuickBooks comes after a settled Helcim week. If Helcim's own QuickBooks switch is on, do not post the same deposits a second way.");

h1(doc, "7  ·  Test before you announce it");
check(doc, "Desk computer is on the wired network. Chrome is open. Each TV has its own cable. No splitter.");
check(doc, "Owner sign-in opens the owner brief.");
check(doc, "Front desk sign-in opens check-in. The cursor is in the scan box. One test QR checks in.");
check(doc, "Coach sign-in opens Today on the floor, not a member session.");
check(doc, "Reception and floor each show their own page. The floor page was tapped once for sound.");
check(doc, "A person with no waiver cannot get a QR. A youth card waits for the guardian.");
check(doc, "A cash drop-in is on the Sully's ledger, not in Helcim.");
check(doc, "One small Helcim test charge, after the token is in, matches the owner total.");
check(doc, "An imported member can use Forgot password, sign in, and sign the waiver.");
check(doc, "Nobody is billed in Glofox and Helcim for the same month.");

h1(doc, "8  ·  Computer, scanner, terminal");
para(doc, "Buy a current Windows 11 computer with 16 GB of memory, Chrome, a wired network port, and one video output for each screen that must show its own page. The desk can use the computer's own screen. Reception and the floor are two more screens. A machine with only two HDMI ports needs a third video output. Skip AI and gaming models. A Lenovo ThinkCentre small desktop is the office choice. A mini PC with two HDMI ports is enough if the third output is added.");
para(doc, "The member card is a QR code on a phone. A laser gun that only reads printed bars will not read it. Buy a 2D imager, USB, that types as a keyboard and adds Enter. Zebra DS2208 is the one-cord counter scanner. Honeywell Voyager XP 1472g is the cordless kit. The base still has to arrive as keyboard input with Enter on the end.");
para(doc, "One HDMI cable per TV, labeled desk, reception, and floor. Order the Helcim Smart Terminal inside the Helcim account. Do not buy a card-number keyboard or a magstripe reader for the computer.");
urlLine(doc, "Windows 11 requirements", "https://www.microsoft.com/en-ca/windows/windows-11-specifications");
urlLine(doc, "Chrome", "https://www.google.com/chrome/");
urlLine(doc, "Lenovo ThinkCentre, Canada", "https://www.lenovo.com/ca/en/c/desktops/thinkcentre/");
urlLine(doc, "Beelink mini PCs. Choose dual HDMI, not an AI model.", "https://www.bee-link.com/");
urlLine(doc, "Zebra DS2208 guide", "https://www.zebra.com/content/dam/support-dam/en/documentation/unrestricted/guide/product/ds2208-prg-en.pdf");
urlLine(doc, "Honeywell Voyager XP 1472g USB kit", "https://www.barcodefactory.com/honeywell/scanners/voyager-1472g/1472g2d-2usb-5-n");

h1(doc, "9  ·  Not live yet");
bullet(doc, "Helcim webhooks. Collect the secret. Do not point Helcim at the gym until Quiet Agency gives the address.");
bullet(doc, "The paired terminal. Standalone tap can be written on the desk ledger. The desk screen does not drive the terminal yet.");
bullet(doc, "QuickBooks. Planned after a settled Helcim week. It is not connected.");
bullet(doc, "Glofox billing. Importing the list does not stop it.");
para(doc, "Support for the system: Quiet Agency, quietagency.co. Gym questions: the owner, then info@sullysboxinggym.com.");
para(doc, "Boxing is the engine. People are the purpose. Character is the legacy.");
para(doc, "Developed by Quiet Agency.");

paintFooters(doc);
doc.end();
stream.on("finish", () => {
  fs.copyFileSync(out, path.join(root, "docs", "08-process", "Sullys-Glofox-Helcim-Setup.pdf"));
  console.log(`${out} (${fs.statSync(out).size} bytes)`);
});
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
