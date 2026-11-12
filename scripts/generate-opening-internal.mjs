/**
 * Internal print pack for the week of opening.
 * Usage: node scripts/generate-opening-internal.mjs
 * Not copied into the member or staff manuals.
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
const INK = "#1a120e";
const MUTED = "#5c4638";
const RULE = "#e4d5c4";

const outDir = path.join(root, "docs", "08-process");
fs.mkdirSync(outDir, { recursive: true });
const dest = path.join(outDir, "Sullys-Opening-Internal.pdf");

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 64, bottom: 52, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: "Sully's Opening Internal",
    Author: "Quiet Agency",
    Subject: "Internal only. Opening week, mail, shadow audio, costs.",
    Keywords: "internal",
  },
});
doc.pipe(fs.createWriteStream(dest));

const left = 54;
const width = 504;

function headerBar() {
  doc.save();
  doc.rect(0, 0, doc.page.width, 36).fill(BROWN);
  doc.fillColor(CREAM).font("Helvetica-Bold").fontSize(9).text(
    "SULLY'S  ·  INTERNAL  ·  DO NOT HAND TO MEMBERS",
    left,
    13,
    { width: 360, lineBreak: false },
  );
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(9).text(
    "9 NOV 2026",
    left,
    13,
    { width, align: "right", lineBreak: false },
  );
  doc.restore();
  doc.x = left;
  doc.y = 52;
}

function paintFooters() {
  const range = doc.bufferedPageRange();
  const total = range.count;
  for (let i = 0; i < total; i += 1) {
    doc.switchToPage(range.start + i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - 28;
    doc.save();
    doc.strokeColor(RULE).moveTo(left, y - 8).lineTo(left + width, y - 8).stroke();
    doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(
      "Quiet Agency internal  ·  Boxing is the engine. People are the purpose. Character is the legacy.",
      left,
      y,
      { width: 400, lineBreak: false },
    );
    doc.text(`${i + 1} / ${total}`, left, y, {
      width,
      align: "right",
      lineBreak: false,
    });
    doc.restore();
    doc.page.margins.bottom = bottom;
  }
}

function need(h) {
  if (doc.y + h > doc.page.height - 58) {
    doc.addPage();
    headerBar();
  }
}

function h1(text) {
  need(46);
  doc.moveDown(0.35);
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(16).text(text, left, doc.y, { width });
  doc.moveDown(0.25);
}

function h2(text) {
  need(32);
  doc.moveDown(0.2);
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(12).text(text, left, doc.y, { width });
  doc.moveDown(0.15);
}

function para(text) {
  need(36);
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(text, left, doc.y, {
    width,
    lineGap: 2,
  });
  doc.moveDown(0.35);
}

function check(text) {
  need(28);
  const y = doc.y;
  doc.rect(left, y + 1, 9, 9).lineWidth(0.8).strokeColor(BROWN).stroke();
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(text, left + 16, y, {
    width: width - 16,
    lineGap: 1,
  });
  doc.moveDown(0.22);
}

function bullet(text) {
  need(24);
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(`•  ${text}`, left, doc.y, {
    width,
    lineGap: 1,
  });
  doc.moveDown(0.15);
}

function scriptLine(time, who, line) {
  need(32);
  const y = doc.y;
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(9).text(time, left, y, {
    width: 52,
    lineBreak: false,
  });
  doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(9).text(who, left + 54, y, {
    width: 70,
    lineBreak: false,
  });
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(line, left + 128, y, {
    width: width - 128,
    lineGap: 1,
  });
  doc.moveDown(0.2);
}

function table(headers, rows, colW) {
  const rowH = (cells, head) => {
    doc.font(head ? "Helvetica-Bold" : "Helvetica").fontSize(8);
    let h = 16;
    cells.forEach((cell, i) => {
      const height = doc.heightOfString(String(cell), { width: colW[i] - 8 });
      h = Math.max(h, height + 8);
    });
    return h;
  };
  const drawRow = (cells, head) => {
    const h = rowH(cells, head);
    need(h + 2);
    let x = left;
    const y = doc.y;
    cells.forEach((cell, i) => {
      doc.rect(x, y, colW[i], h).fill(head ? BROWN : "#fffaf3");
      doc.rect(x, y, colW[i], h).lineWidth(0.4).strokeColor(RULE).stroke();
      doc
        .fillColor(head ? CREAM : INK)
        .font(head ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8)
        .text(String(cell), x + 4, y + 4, { width: colW[i] - 8 });
      x += colW[i];
    });
    doc.y = y + h;
    doc.x = left;
  };
  drawRow(headers, true);
  rows.forEach((row) => drawRow(row, false));
  doc.moveDown(0.35);
}

headerBar();
doc.fillColor(RED).font("Helvetica-Bold").fontSize(9).text("QUIET AGENCY  ·  PRINT AND KEEP AT THE DESK", left, doc.y);
doc.moveDown(0.3);
doc.fillColor(BROWN).font("Helvetica-Bold").fontSize(22).text(
  "Opening week internal pack",
  left,
  doc.y,
  { width },
);
doc.moveDown(0.25);
doc.fillColor(INK).font("Helvetica").fontSize(11).text(
  "Doors Monday 16 November 2026. The gym runs online on its own Wi-Fi. Members add the app to the phone home screen. This pack is internal. It is not a member handout.",
  left,
  doc.y,
  { width, lineGap: 2 },
);
doc.moveDown(0.4);

h1("1  ·  Already proven, and the two gaps");
para("Checked on the live sites the night of 9 November, without signing in as a member. The member site, the staff site, login rejection, the scanner route, the desk, the kiosk, the owner page, both TV pages, and the home-screen manifest all answered. The Mini PC scan from the gym matches that scanner route.");
bullet("Shadow punch counts on the phone worked. The save on the server did not. The live API answers 404 for the shadow round. The phone keeps the last five unsaved rounds in that browser until the API is published and the same signed-in phone opens Shadow again.");
bullet("Forgot password tells the person to check an inbox. Until the sending key is on the server, no email goes out. The link is only in the API log. Do not mail the Glofox list until a real reset arrives in a test inbox.");
bullet("Card pay is still in test mode. Helcim is not the live processor. Cash stays on the desk ledger. Do not bill the same month in Glofox and here.");
bullet("The member site was published 5 November. The staff site was published 25 September. Publish both with the API before opening week.");
bullet("Shadow video stays on the member's phone. The gym stores the counts, the stance, and the one correction. The server refuses a film upload. There is no video file yet, even on the phone. On-device replay can come later. It does not go to the cloud.");

h1("2  ·  Monday checklist");
h2("This week, before any member email");
check("Publish the API, then the member site, then the staff site. Open Shadow, finish one round, leave, come back, and see the same jab, cross, hook, and uppercut counts.");
check("Put RESEND_API_KEY and EMAIL_FROM on the API. Send one reset to a Quiet Agency inbox and to Danielle. Open the link on a phone and set a password.");
check("Create the mailboxes in section 3. Send a one-line test to each address from outside the gym.");
check("Download the Glofox client list. Dry-run the import. Then write it. Delete the file after the counts match.");
check("Confirm monthly and youth plans exist before the write. Active adults become monthly. Youth, kids, Little Champ, Jab Lab, and free become youth.");
check("Turn off or replace any live account that still uses the demo password. Staff passwords are handed over in person.");
check("Put next week's real classes on the schedule.");
check("One owner login, one front-desk login, one login per coach. No shared password.");

h2("Mini PC and Wi-Fi");
check("Chrome on https://staff.sullys1943.com, front desk signed in, scan box clicked. The scanner types the code and presses Enter.");
check("One real QR from a phone. Name and class show. A second scan within five minutes shows already checked in.");
check("Reception TV on /tv/reception, fullscreen. Floor TV on /tv/floor, fullscreen, then one tap so the bell can play. One cable per TV.");
check("Run the desk dry-run while signed in. Read the owner brief.");
check("Leave the desk signed in overnight and confirm it is still signed in at open. The session lasts seven days.");
check("Paper first-name list at the desk. If the internet drops, scanning stops. The floor TV can keep the last class it loaded.");

h2("Phones on gym Wi-Fi");
check("Safari or Chrome, https://www.sullys1943.com/app, Add to Home Screen, open the icon, sign in, sign the waiver, open the card, scan it.");
check("iPhone: Share, Add to Home Screen. Android: Chrome, Install or Add to Home Screen.");
check("A youth card waits until the guardian waiver is signed on Family.");
check("Shadow: allow the camera, chest-height phone, member side-on, head to shoes in frame, finish the 40 seconds.");

h2("Monday morning");
check("Internet up. Desk signed in. Scan box focused. One test scan. Both TVs on the right page. Floor tapped for sound.");
check("Someone at the desk who can search a name and write an override reason.");

h1("3  ·  Mail that works");
para("Cloudflare already holds sullys1943.com. Cloudflare Email Routing can receive and forward. It cannot send the password reset. Sending is Resend, from noreply@sullys1943.com, with SPF, DKIM, and DMARC on that domain. The app code now sends when RESEND_API_KEY is set. Until that key is on Railway, production still only logs the link.");
para("Human mail can stay on the addresses already printed on the site. Confirm each one receives. Add the new ones as forwards, not as extra paid seats, unless someone needs a full mailbox.");

table(
  ["Address", "Job", "How"],
  [
    ["noreply@sullys1943.com", "Reset links and system notes. No one replies here.", "Resend send-only"],
    ["info@sullysboxinggym.com", "Public gym inbox. Already on the site.", "Confirm it receives"],
    ["danielle@sullysboxinggym.com", "Owner.", "Confirm it receives"],
    ["desk@sullys1943.com", "Front desk. Forwards to the person on the Mini PC.", "Cloudflare forward"],
    ["coaches@sullys1943.com", "Coach group. Forwards to the coaches on this script.", "Cloudflare forward"],
    ["hello@sullys1943.com", "The member update letter. A person sends it, not noreply.", "Cloudflare forward to Danielle"],
  ],
  [175, 210, 119],
);

h2("Order of work");
bullet("In Resend, add sullys1943.com and copy the DNS records into Cloudflare. Grey-cloud the mail records if Resend asks for DNS only.");
bullet("Set RESEND_API_KEY and EMAIL_FROM on Railway. Publish the API.");
bullet("Forgot password on a real phone. The letter subject is Reset your Sully's password. The link lasts one hour.");
bullet("Then send the member letter below, in small batches, from hello@, after that person's row is in Sully's.");

h2("Member letter, send from hello@");
para("Subject: Your Sully's app is ready");
para("You can check in from your phone. Open https://www.sullys1943.com/app in Safari or Chrome and add Sully's to your home screen. Use Forgot password with this email and set a new one. The link expires in one hour. Sign the waiver, then open your check-in card at the desk. Youth check-in waits for the guardian. The old app is not the check-in once your account here is active. Questions: info@sullysboxinggym.com.");
para("Staff still have no change-password screen. Keep handing those passwords in person. Members change theirs from the reset link.");

h1("4  ·  Shadow audio script");
para("Record with one or two coaches. The round is 40 seconds. The screen changes cue about every 7 seconds, and a member with gloves up cannot read it. The voice says the same six lines the screen shows. Play it on a small speaker or the member's headphones. A phone speaker loses to the gym.");
para("Video of the round stays on the phone for now, and the current build does not save a video file at all. This recording is the coach's voice, kept as audio files we can drop into the app next. Record dry, close to the phone, one take per track. Leave a half-second of silence at each mark so the editor can cut.");
para("Coach A calls the round. Coach B reads the eight fixes, so the member hears a second voice when the note arrives. One coach can do both if the other is on the floor. Say lead hand, not left, except in the southpaw line.");

h2("Track A  ·  Before Start  ·  Coach A  ·  about 20 seconds");
scriptLine("0:00", "Coach A", "Phone at chest height. Prop it. Stand side on.");
scriptLine("0:06", "Coach A", "Head, both gloves, and both shoes stay in the picture.");
scriptLine("0:12", "Coach A", "Gloves on the cheeks. Chin down. Feet about as wide as your shoulders.");
scriptLine("0:18", "Coach A", "Southpaw, your lead hand is the right. Everyone else, lead is the left. Press Start.");

h2("Track B  ·  Stepping into frame  ·  Coach A");
para("Play this on a loop until the bell. It matches the frame the camera is waiting for.");
scriptLine("loop", "Coach A", "Step in. Side on. Hold still until you hear the bell. Head to shoes.");

h2("Track C  ·  The 40-second read  ·  Coach A");
para("Start this file on the bell. Six lines. About six to seven seconds apart. Do not add extra coaching in this take. The count is listening for the shape, not the speech.");
scriptLine("0:00", "Bell", "(gym bell, or a clap if you record the bell later)");
scriptLine("0:01", "Coach A", "Jab. Bring it home.");
scriptLine("0:07", "Coach A", "Cross. Bring it home.");
scriptLine("0:14", "Coach A", "Lead hook. Bring it home.");
scriptLine("0:21", "Coach A", "Rear hook. Bring it home.");
scriptLine("0:28", "Coach A", "Lead uppercut. Bring it home.");
scriptLine("0:34", "Coach A", "Rear uppercut. Bring it home.");
scriptLine("0:40", "Bell", "That's the read. Eyes up. One fix.");

h2("Track D  ·  The one fix  ·  Coach B  ·  pick the file that matches the screen");
para("After the read, the app shows one note. Play only that note. Then the member can press Practice for three quiet minutes. At 1:30 and with 10 seconds left, play the short reminder under the note.");

scriptLine("Set", "Coach B", "The camera did not hold you. Turn sideways. Phone at chest height. Head, both gloves, both shoes. Jab, and touch the glove back to the cheek. Three sets of ten.");
scriptLine("Quiet", "Coach B", "We saw you. We did not see two full punches. Hands at the cheeks. Lead hand out in a straight line. Touch the glove back to the cheek before the next one. Three sets of ten.");
scriptLine("Home", "Coach B", "The hand is staying out. Jab, touch the lead glove to the cheek. Cross, touch the rear glove to the cheek. The touch is the end of the punch. Three sets of eight.");
scriptLine("Long", "Coach B", "The straight punches are short. Stand side on. Turn the lead shoulder as the jab extends. Then bring the glove home. Three sets of eight.");
scriptLine("Guard", "Coach B", "Between punches the gloves live low. Start with both gloves on the cheeks. One jab. Both gloves home before the next punch. One minute, then rest.");
scriptLine("Feet", "Coach B", "The feet come together. Shoes about shoulder width. Lead foot toward the phone. Jab without the shoes touching. Three rounds of one minute.");
scriptLine("Chin", "Coach B", "Chin up. Tuck it. Eyes through the eyebrows. Jab from there. Chin stays down between punches. Three sets of eight.");
scriptLine("Clear", "Coach B", "Hands come home and the base is there. Next is the step with the jab. Lead foot moves with the jab. Rear foot slides after. Base stays wide. Three sets of eight, then the same with the cross.");
scriptLine("1:30", "Coach B", "Halfway. Same fix. Breathe. Hands home.");
scriptLine("0:10", "Coach B", "Ten seconds. Finish the set. Then the bell.");
scriptLine("End", "Coach B", "That's the round. Take it to class.");

h2("How to record");
bullet("Phone voice memo is enough. Name the files A-setup, B-frame, C-read, D-set, D-quiet, D-home, D-long, D-guard, D-feet, D-chin, D-clear, D-halfway, D-ten, D-end.");
bullet("One quiet room. No music. No other members in the take.");
bullet("Coach A and Coach B say their names once at the top of the session, off the track, so we know who is who.");
bullet("Do a second take of Track C only if a word is missed. We use one take in the app.");
bullet("Next feature: these files play inside Shadow, on the bell, and the matching fix plays when the note appears. Until that ships, the coach can play Track C from the Mini PC or a speaker while the member uses the phone.");

h1("5  ·  Operating cost in Canadian dollars");
para("Planning numbers for 9 November 2026. Rate used: 1.40 Canadian dollars per US dollar. These are list prices, not an invoice. Confirm every line on the bill. Gym rent, coaches, and insurance are outside this sheet. Cursor, ChatGPT, and Grok are Quiet Agency shop tools and are not on this sheet. Helcim is a percentage of the charge in the merchant agreement, not a monthly software fee, so it is not in the totals.");
para("Floor is the demo stack. Open-the-gym is what to budget so Monday does not sit on a free tier. The number to hold is $59 a month, $702 a year. A Railway spike or a second Vercel seat can move it toward $90 a month.");

table(
  ["Line", "Floor / mo", "Open / mo", "Open / yr", "Notes"],
  [
    ["Domains sullys1943.com and sullysboxinggym.com", "$1", "$3", "$30", "Cloudflare Registrar bills the .com in USD, about $10 to $11 US a year. Second domain if it is still on its own registrar."],
    ["Cloudflare DNS, SSL, CDN, Email Routing", "$0", "$0", "$0", "Already in use. Free plan. Email Routing forwards. It does not send resets."],
    ["Vercel, member site and staff site", "$0", "$28", "$336", "One Pro seat, $20 US. Both sites sit on the team. Hobby is $0 and is the wrong plan for a live gym."],
    ["Railway API and database", "$7", "$28", "$336", "About $5 to $25 US depending on always-on use. One planning line covers the API and Postgres."],
    ["Resend, password and system mail", "$0", "$0", "$0", "Free tier is 3,000 emails a month and 100 a day. Pro is $28 a month if the gym outgrows it."],
    ["Total to run the gym", "$8", "$59", "$702", "Open-the-gym column. Floor is only a fallback."],
  ],
  [168, 62, 62, 62, 150],
);

h2("Later, when you want the heavier stack");
table(
  ["Add", "CAD / mo", "CAD / yr", "Why it waits"],
  [
    ["Cloudflare Pro", "$35", "$420", "WAF and richer stats. Free Cloudflare is enough to open."],
    ["Resend Pro", "$28", "$336", "Only after the free 3,000 emails a month is tight."],
    ["QuickBooks Online", "$30", "$360", "Confirm the Intuit Canada invoice. After a settled Helcim week."],
    ["Error watch (Sentry or the same class)", "$0–$36", "$0–$432", "Free is enough at this size. Paid when you want alerts overnight."],
    ["Text messages", "Per text", "Per text", "Not on. Each Canadian text is extra when you turn it on."],
    ["Apple developer, store app", "$12", "$140", "About $99 US a year. The home-screen app does not need it."],
  ],
  [175, 70, 70, 189],
);
para("Helcim: Sully's pays the processor, per the agreement, on the money that actually runs through the terminal. A standalone terminal sale is a Helcim sale until the desk drives the terminal. Write those on the desk ledger until the owner total matches.");

h1("6  ·  Make it the best version of this gym");
para("Opening week first. Then these, in this order. Shadow film stays on the phone. New features get added on top of a door that already scans.");

h2("Before the first class");
check("API, member site, and staff site on the same publish.");
check("One reset email received, opened, and used.");
check("Glofox dry-run, then write, then the hello@ letter in batches.");
check("Waiver signed on a test member before their QR appears. Youth blocked until the guardian signs.");
check("Demo passwords gone from the live gym.");
check("Backup of the database confirmed on Railway or Neon, and one restore tried on a copy.");
check("Owner account has a second factor if the host offers it. Cloudflare, Vercel, Railway, Resend, and the registrar all have it on.");

h2("The floor, so it feels finished");
check("A marked standing spot and a phone stand at chest height for Shadow. Light on the member, not a bright window behind them.");
check("A small speaker for the coach audio. Track C on the bell. The matching Track D when the note shows.");
check("Big type stays on the screen for a loud room and for anyone who cannot hear the speaker.");
check("The Mini PC Chrome profile does not clear cookies on exit, and the scan box grabs focus again after a scan.");
check("A morning one-page: internet, scan test, both TVs, owner brief. Laminate it next to the scanner.");
check("Name search and a written override when someone has no QR. Void needs a reason.");

h2("The product after opening week");
check("Drop the coach audio files into Shadow so the phone plays them. No extra reading.");
check("Optional replay on the phone only, never uploaded. The gym keeps counts and the coach note.");
check("Coach review of the round on the staff site, confirm or rewrite the one fix.");
check("Member change-password inside the app, and the same for staff, so temp passwords die on first login.");
check("Login and reset rate limits, so a public page cannot be hammered.");
check("A nightly attendance export the owner can open.");
check("Helcim for real, one small charge matched to the owner total, then tell members card is live.");
check("QuickBooks after a settled Helcim week. Do not post the same deposit two ways.");
check("Texts later, for waitlist and class changes. Email first.");
check("Uptime alert to Danielle and the desk if the API health check fails.");
check("Kitchen stays closed on the system until you decide to take food orders.");

h2("Keep");
bullet("Home-screen app, not a store app, until the gym asks for one.");
bullet("One correction per shadow round. The phone can see shape and whether the hand came home. It cannot see force. Do not tell members it measures power.");
bullet("Youth training stays with the coach on the floor.");
bullet("First names on the TV. No email, no money, no medical notes on a screen.");
bullet("Glofox billing stops for a person only after they are active here, have a password, and have signed.");

para("Support for the system: Quiet Agency. Gym questions: the owner, then info@sullysboxinggym.com.");

paintFooters();
doc.end();
console.log(dest);
