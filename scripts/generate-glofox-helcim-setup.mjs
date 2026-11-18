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
    Subject: "Office print for Glofox, Stripe, GoCardless, the desk, and the wall TV",
  },
});
const stream = fs.createWriteStream(out);
doc.pipe(stream);

if (fs.existsSync(LOGO)) doc.image(LOGO, 196, 48, { width: 220 });
doc.y = 300;
doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text("Master Setup", 54, doc.y, { width: 504, align: "center" });
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(12).text("Leave Glofox. Cards on Stripe. Bank debit on GoCardless.", { width: 504, align: "center" });
doc.moveDown(0.8);
doc.fontSize(11).text("1554 Dundas St W (lower level), Toronto, ON M6H 1Z6", { width: 504, align: "center" });
doc.text("(416) 805-8108  ·  info@sullysboxinggym.com", { width: 504, align: "center" });
doc.text("Mon–Fri 7:30 AM–9:00 PM  ·  Sat 11:00 AM–5:00 PM  ·  Sunday closed", { width: 504, align: "center" });
doc.moveDown(1.2);
doc.font("Helvetica-Bold").fontSize(12).text("Developed by Quiet Agency", { width: 504, align: "center" });
doc.font("Helvetica").fontSize(10).text("quietagency.co", { width: 504, align: "center" });
doc.moveDown(0.8);
doc.fontSize(9).text("Office print  ·  18 November 2026  ·  Letter  ·  Black and white", { width: 504, align: "center" });
doc.moveDown(0.3);
doc.font("Helvetica-Bold").fontSize(10).text("Migration calls: Thursday 19 November 2026", { width: 504, align: "center" });
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
  ["Jacob, front desk", "jacob@sullys.local", staff],
  ["Jesse, front desk", "jesse@sullys.local", staff],
  ["Tony Morrison", "coach@sullys.local", staff],
  ["Rico Mancini", "coach.rico@sullys.local", staff],
  ["Tommy", "coach.tommy@sullys.local", staff],
  ["Levi", "coach.levi@sullys.local", staff],
  ["Liznell", "coach.liznell@sullys.local", staff],
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
num(doc, "1", "The desk computer is the 22-inch STGSivir all-in-one. It stays on the desk. The 50-inch Roku TV goes on the wall. One HDMI cable runs from the computer's HDMI port to an HDMI input on the TV. On the Roku remote, choose that HDMI input and leave it there. The Roku home screen does not run the gym.");
num(doc, "2", "On the computer, press the Windows key and P, then choose Extend. The 22-inch screen and the wall TV are two different pages.");
num(doc, "3", "Sign in as the owner on the desk screen, at the staff address.");
num(doc, "4", "Read the owner brief. Confirm today's classes are on the board.");
num(doc, "5", "On the wall TV, open the floor address in Chrome and press F for fullscreen. Tap the page once so the bell can play. When two classes are on at once, the wall splits them.");
num(doc, "6", "On the desk screen, open desk check-in. Click the scan box. Scan one test card before the door opens.");
para(doc, "The scanner is a keyboard. It types the code and presses Enter. If the cursor is in the wrong box, the scan is missed. Hold the phone about a hand's width away, brightness up. The code changes about every three minutes.");
para(doc, "A person is on the floor only after a scan. Booking a class is not a check-in. The wall TV lists who scanned in, and who booked but has not scanned. If the system blocks them, read the reason. It is usually an unsigned waiver or a membership that is not active. An unpaid or past-due account shows on the desk. An override needs a written reason of more than a word. That reason shows on the owner brief. No signed waiver, no QR. A child card waits for the guardian waiver at Family.");
para(doc, "Payments are not live. Contact Glofox, cancel, and request the transfer before any card or bank debit runs here. Card memberships will be Stripe. Bank-debit memberships will be GoCardless. Cash stays on the Sully's desk ledger. Do not bill the same month in Glofox and here. Never write a card number down.");
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

h1(doc, "5  ·  Migration out — read this before the calls");
para(doc, "Print this section and take it to the calls on Thursday 19 November 2026. Glofox is still the biller. Stripe and GoCardless are off. The gym keeps using Glofox at the door until the written end date in this section is filled in. One member, one bill, one month. Never both.");
para(doc, "Already in Sully's from the 11 November 2026 export: 2,445 people, plus one older demo account, 2,446 names. That file is a contact list. It is not 2,446 paying members.");
bullet(doc, "144 standard adult dues were still in date: 141 at $150 a month, and 3 at $120 a month. List price about $21,510 a month. Not cash collected.");
bullet(doc, "11 standard adult plans were already expired: 1 at $150, and 10 at $120.");
bullet(doc, "Also in date, and not part of the 144: 17 youth at $85, 1 youth at $75, 6 complimentary youth at $0, 4 promo at $100, 1 promo at $130, and 4 flex passes.");
bullet(doc, "Stored cards did not come across. Class history did not come across. The old Glofox waiver did not come across. One Sully's waiver is signed. Password email is not sending. Do not mail the list.");
para(doc, "Goal after the move: 300 standard adult dues in date. Gap from the 11 November count: 156. The desk scoreboard is Adults in date, Net new this week, Cancellations, Remaining to 300.");

h1(doc, "6  ·  Thursday morning, before anyone is on the phone");
num(doc, "1", "Sign in to Glofox. Open Manage, then Clients.");
num(doc, "2", "Actions, then Download. Save the CSV on the office computer. Put today's date in the file name.");
num(doc, "3", "The header must include email, first name, and last name. It should also include phone, membership name, status, start, and end.");
num(doc, "4", "Send that file to Quiet Agency in private. Do not post it in a group chat. Delete it after the import is confirmed.");
num(doc, "5", "Open a blank page in this book. You will write the answers from the call. Do not cancel anything until those answers are written.");
urlLine(doc, "Glofox sign-in", "https://app.glofox.com/");
urlLine(doc, "How to download the client list", "https://support.glofox.com/hc/en-us/articles/46433498252564-How-to-Download-a-Client-List");

h1(doc, "7  ·  The Glofox call");
para(doc, "Say this: Sully's Boxing Gym is leaving. We need the software cancellation date, and a list of every member you will still bill, split into card and bank debit. We will not take a month you are still billing.");
num(doc, "1", "Confirm the account owner and the billing contact. Write the name.");
num(doc, "2", "Ask the monthly software invoice amount, and the date of the next software invoice.");
num(doc, "3", "Ask how many members have a live recurring payment today.");
num(doc, "4", "Ask how many of those are card, and how many are bank debit. Write both numbers.");
num(doc, "5", "Ask the next date each of those members will be billed. Ask them to stop the next run if that date lands in a month Sully's will bill.");
num(doc, "6", "Ask the last date they will bill any member. That date is the end. It has to be in writing the same day.");
num(doc, "7", "They cannot give you the full card number, and you do not want it. Ask for email, plan name, amount, next bill date, card brand, and last four digits only.");
num(doc, "8", "Ask whether a bank-debit mandate can be transferred. If they say no, those members sign a new GoCardless form. They are not put on a card to avoid the form.");
num(doc, "9", "Ask what happens to a member whose month is already paid. They train through the date they paid. Sully's does not bill that same month.");
num(doc, "10", "Do not accept a verbal cancel with no date. Ask them to email the cancellation date and the card-versus-bank list before you hang up.");
para(doc, "Do not give Glofox a card number. Do not let them talk you into one more software year. Do not turn Stripe on during this call.");

h1(doc, "8  ·  Write the answers here");
para(doc, "Person on the Glofox call: ________________________________  Date: 19 November 2026");
para(doc, "Software invoice amount: ______________    Next software invoice date: ______________");
para(doc, "Live recurring members: ________    Card: ________    Bank debit: ________    Cash only: ________");
para(doc, "Last date Glofox will bill a member: ____________________");
para(doc, "First date Sully's may bill that same member: ____________________");
para(doc, "Written email received the same day:  yes  /  no     Saved where: ____________________");
para(doc, "Bank-debit mandates transfer:  yes  /  no     If no, GoCardless forms needed: ________");

h1(doc, "9  ·  The Stripe call");
para(doc, "Stripe is cards only. GoCardless is bank debit only. Helcim is not the processor. The gym system never stores a full card number. Do this after the Glofox list is in hand, the same day if the list arrived.");
num(doc, "1", "Open or confirm the Stripe account in the gym's legal name. Canada. The statement name is Sully's Boxing Gym.");
num(doc, "2", "Do not build the live prices until the card list from Glofox is on the desk.");
num(doc, "3", "Prices to create when the list matches: Monthly $150, ages 19 and up. Monthly $120, ages 19 and up, for the three people still on that price. Any promo still in date stays its own price. Do not fold them into $150.");
num(doc, "4", "Youth is not an adult dues plan. Complimentary youth is $0 and is not a Stripe subscription.");
num(doc, "5", "Quiet Agency puts the secret keys on the server. Do not paste a secret key into email, text, or a group chat.");
num(doc, "6", "Run one real charge. The owner brief total must match Stripe before any member is told that card pay is live.");
num(doc, "7", "If the totals do not match, stop. Do not announce it. Do not bill the list.");
urlLine(doc, "Stripe", "https://dashboard.stripe.com/");
para(doc, "Stripe account email used: ______________________________________");
para(doc, "One real charge date: ______________    Amount: ______________    Owner brief matched:  yes  /  no");

h1(doc, "10  ·  GoCardless, only for bank debit");
num(doc, "1", "Open GoCardless only for the people Glofox marked as bank debit.");
num(doc, "2", "Each of those people signs a new debit mandate. A card on Stripe is not a substitute.");
num(doc, "3", "Do not put the same person on Stripe and GoCardless.");
num(doc, "4", "Cash stays on the desk ledger. The desk already flags an unpaid or past-due account and will not scan them onto the floor without a written override.");
urlLine(doc, "GoCardless", "https://manage.gocardless.com/");
para(doc, "QuickBooks comes after a settled week on Stripe or GoCardless. Do not post the same deposit a second way.");

h1(doc, "11  ·  The week of the switch");
para(doc, "Start this only after the last Glofox bill date is written in section 8 and the one Stripe charge matched.");
num(doc, "1", "If the Thursday CSV is newer than 11 November, Quiet Agency runs a dry pass, then the write. An email already in Sully's is kept. A row with no email or no name is skipped.");
num(doc, "2", "Turn on password email. Send one test to the owner. Open it. Use it. Then, and only then, a member can use Forgot password.");
num(doc, "3", "At the desk, the person sets a password, signs the Sully's waiver, and only then gets a QR. No waiver, no card. A youth card waits for the guardian.");
num(doc, "4", "Do not email all 2,445 people. Class packages first, then people who booked in the last 90 days.");
num(doc, "5", "The morning of the first class on this door: floor TV at the floor address, fullscreen, tapped once for sound. Desk scan box clicked. One test QR. Today's classes on the board.");
num(doc, "6", "Each Monday after the switch, write four numbers: Adults in date, Net new this week, Cancellations, Remaining to 300.");
urlLine(doc, "Dry run, writes nothing", "node scripts/import-glofox-members.mjs members.csv");
urlLine(doc, "Write", "node scripts/import-glofox-members.mjs members.csv --commit");
para(doc, "Floor page: https://www.sullys1943.com/tv/floor");
para(doc, "A name on the old file is not a member here until the dues are in date, the new waiver is signed, and the desk has scanned them in.");

h1(doc, "12  ·  Test before you announce it");
check(doc, "The 22-inch computer is on the gym Wi-Fi. Chrome is open. Windows key and P is set to Extend. The HDMI cable reaches the wall TV, and the Roku is on that HDMI input.");
check(doc, "Owner sign-in opens the owner brief.");
check(doc, "Front desk sign-in opens check-in. The cursor is in the scan box. One test QR checks in.");
check(doc, "Coach sign-in opens Today on the floor, not a member session. Liznell is on the staff list.");
check(doc, "The wall TV shows the floor page, full screen. Two live classes split side by side. The page was tapped once for sound.");
check(doc, "A person with no waiver cannot get a QR. A youth card waits for the guardian. A booking without a scan is not on the floor.");
check(doc, "An unpaid account is named on the desk and does not scan in without an override.");
check(doc, "A cash drop-in is on the Sully's ledger. Stripe and GoCardless are still off.");
check(doc, "An imported member can use Forgot password once that email is turned on, then sign the waiver.");
check(doc, "Nobody is billed in Glofox and here for the same month.");

h1(doc, "13  ·  Computer, wall TV, scanner");
para(doc, "Nothing is installed on the computer. Chrome is the gym. The 22-inch screen is the desk. The HDMI port feeds the 50-inch TV on the wall.");
bullet(doc, "Computer: STGSivir All-in-One Desktop, 22-inch FHD display.");
bullet(doc, "Processor: Intel Core i7, up to 3.9 GHz.");
bullet(doc, "Memory: 16 GB. Storage: 1 TB SSD.");
bullet(doc, "Network: Wi-Fi and Bluetooth 5.0. Use the gym Wi-Fi.");
bullet(doc, "Included: RGB keyboard, RGB mouse, mouse pad, webcam.");
bullet(doc, "System: Windows 11 Home. Browser: Chrome. No gym software to install.");
bullet(doc, "Video: one HDMI port. That port goes to the wall TV.");
bullet(doc, "Floor TV: 50-inch Roku, mounted on the wall. Middle of the screen about standing eye height.");
bullet(doc, "Cable: HDMI from the computer's HDMI port to an HDMI input on the Roku. Run it along the wall with slack. Power behind the TV.");
bullet(doc, "On the Roku remote, select that HDMI input and leave it. The Roku home screen does not run the gym.");
bullet(doc, "On the computer, press the Windows key and P, then Extend. Desk keeps staff check-in. Wall keeps the floor page, full screen.");
para(doc, "The member card is a QR code on a phone. A laser gun that only reads printed bars will not read it. Use a 2D imager, USB, that types as a keyboard and adds Enter. Zebra DS2208 is the one-cord counter scanner. Honeywell Voyager XP 1472g is the cordless kit. The base still has to arrive as keyboard input with Enter on the end. Plug the scanner into the all-in-one.");
urlLine(doc, "Chrome", "https://www.google.com/chrome/");
urlLine(doc, "Floor page on the wall TV", "https://www.sullys1943.com/tv/floor");
urlLine(doc, "Desk check-in", "https://staff.sullys1943.com/desk");
urlLine(doc, "Zebra DS2208 guide", "https://www.zebra.com/content/dam/support-dam/en/documentation/unrestricted/guide/product/ds2208-prg-en.pdf");
urlLine(doc, "Honeywell Voyager XP 1472g USB kit", "https://www.barcodefactory.com/honeywell/scanners/voyager-1472g/1472g2d-2usb-5-n");

h1(doc, "14  ·  Not live yet");
bullet(doc, "Stripe. Card memberships. Off until Glofox is cancelled and the transfer is requested.");
bullet(doc, "GoCardless. Bank debit. Off until that same transfer says which members pay from their bank.");
bullet(doc, "Password-reset email. Accounts exist. The email is not turned on, so do not send the member letter yet.");
bullet(doc, "QuickBooks. After a settled week. It is not connected.");
bullet(doc, "Glofox billing. The member list is in Sully's. Glofox is still billing until they cancel it.");
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
