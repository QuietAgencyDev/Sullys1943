# ChatGPT brief — Sully’s Owner Manual and Coach Manual

Upload this whole file into ChatGPT. Then send the message in the box below, exactly.

```
Design two separate print-ready manuals from this file: the Owner Manual and the Coach Manual.

Rules:
- Do not rewrite, shorten, or invent procedures. Keep every heading, step, and warning.
- Do not print any password, seed login, or demo account.
- Output two self-contained HTML files I can open in a browser and print to PDF on US Letter paper.
- Make them look like branded gym books, not a software help doc and not a generic template.
- Use the brand lock and the design direction in this file.
- Put the cover on its own page. Start each numbered chapter on a new page.
- Show page numbers and the running footer.
- After the HTML, tell me the print settings: Letter, background graphics on, margins none.
```

---

## Brand lock

Use these and do not substitute a different palette.

| Token | Value | Use |
| --- | --- | --- |
| Sully red | `#C82026` | Spine, rules, chapter numbers, warnings |
| Corner brown | `#3A2418` | Cover wordmark, chapter titles |
| Cream | `#F3E6C8` | Cover field, callout panels, section tabs |
| Paper | `#FFFBF6` | Page background |
| Ink | `#1A120E` | Body text |
| Muted | `#6B5A4E` | Captions, paths, page numbers |

Wordmark, set in type if no logo file is available:

**SULLY'S BOXING GYM**
**EST 1943**

Line under the wordmark, in red, small caps:

**CANADA'S OLDEST BOXING CLUB**

Manifesto, always the footer, never a slogan swap:

**Boxing is the engine. People are the purpose. Character is the legacy.**

Address block, exact:

1554 Dundas St W (lower level), Toronto, ON M6H 1Z6
(416) 805-8108 · info@sullysboxinggym.com
Mon–Fri 7:30 AM–9:00 PM · Sat 11:00 AM–5:00 PM · Sunday closed

Credit line, small, on the cover only:

Web and system by Quiet Agency · quietagency.co

Type:

- Cover and chapter titles: a condensed heavy sans, such as Oswald, Bebas Neue, or Anton. All caps for titles.
- Body: a highly readable sans, such as Source Sans 3 or IBM Plex Sans. 12.5pt minimum. Line height about 1.45.
- Steps: numbered, large, one action per line.
- Paths such as `/owner` sit in a small cream chip, not in the sentence.

Voice on the page: short, floor-ready, confident. No emoji. No stock photos of strangers boxing. No fake screenshots. Decoration is the red spine, cream panels, a thin brown rule, and the 1943 mark.

---

## Design direction

Each manual is a US Letter book, about 10 to 14 pages, printed single-sided or double-sided. Coaches and the owner will read these at the desk and on the floor, sometimes standing.

Cover:

- Full cream page.
- A 14pt Sully-red bar down the entire left edge.
- Wordmark at the top.
- Huge title.
- Audience line in brown.
- A cream-on-brown band near the bottom with the manifesto.
- Quiet Agency credit in small type above that band.
- Version line: November 2026.

Inside pages:

- Same red spine, 8pt, on every page.
- Top: small wordmark left, manual name right.
- Chapter number in red, huge, sitting beside the title.
- Body in ink on paper.
- A "Corner rule" panel: cream background, brown left border, for the one thing that must not be skipped.
- A "Never" panel: white card, red left border, red label NEVER, for hard stops.
- Opening and closing checklists as a two-column checklist with empty square boxes, large enough to tick with a pen.
- Footer rule, manifesto on the left, page number on the right.

Do not use a purple gradient, a SaaS dashboard look, Inter-on-white docs, or a Canva gym-poster collage.

---

# MANUAL ONE — OWNER

**Cover title:** Owner Manual
**Cover subtitle:** How to open the gym, run the desk, and read the day
**Audience:** Owner and trusted admin
**Version:** November 2026

## 1. What this book is

This is the owner’s book for the Sully’s system. It covers the morning brief, the front desk, the door, the screens, waivers, staff access, and the open and close.

The coach book is separate. Hand that one to the coaches. This one stays with the owner.

The member site is https://www.sullys1943.com
The staff console is https://staff.sullys1943.com

Corner rule: Sign in on the staff console before the first member reaches the desk. If the staff page will not load, check the gym internet before you troubleshoot anything else.

## 2. The morning picture

Open Owner Brief at `/owner`. The screen title is "The gym, at a glance." It refreshes about every 15 seconds.

Read it in this order:

1. Revenue today, and how it compares with yesterday.
2. Check-ins today.
3. Classes on the board, and how full they are.
4. Active members, youth and adult.
5. Pending waivers.
6. Pending payments.
7. Staff overrides from the desk. Every override should have a real reason.

If a number looks wrong, do not guess in a notebook and leave the screen. Ask the desk what they recorded, then fix the record in the system.

Corner rule: Pending waivers and pending payments are the two lists that should be near empty before the evening classes.

## 3. Open the gym

Do this before members arrive.

1. Power the desk computer, the scanner, the network, and every screen. One cable from the computer to each TV. A splitter clones the same picture and cannot give each TV its own page.
2. Open https://staff.sullys1943.com and sign in with the owner account.
3. Open `/owner` and read the morning picture.
4. Confirm today’s classes are on the board.
5. On the reception screen, open https://www.sullys1943.com/tv/reception and press F for fullscreen.
6. On the floor screen, open https://www.sullys1943.com/tv/floor, press F for fullscreen, then tap the page once so the bell and clap can play.
7. Open Desk Check-in at `/desk`. Choose the current class. Click the scan box so the cursor is sitting in it.
8. Scan one test card before the door opens.

The scanner is a keyboard. It types the code and presses Enter. If the cursor is in the wrong box, the scan lands in the wrong place.

Never: Leave the scan box unfocused during check-in. The member will look checked in and the system will have missed them.

## 4. Front desk

Path: `/desk`

1. Member opens the digital card on their phone at `/app/card` and holds the QR steady, screen bright, about a hand’s width from the scanner.
2. The code changes about every 60 seconds. If it fails once, ask them to leave the card page open and scan the fresh code.
3. A clean scan checks them in.
4. If the system blocks them, read the reason out loud. It is usually an unsigned waiver or a membership that is not active.
5. Staff override is for a real exception. Turn it on, type a reason of at least a few words, then scan again. That reason shows on the owner brief.
6. Walk-in drop-in is sold at the desk. Check them in on the same visit when they are staying for the class.
7. Family link: connect a child to the parent’s email, create the youth profile, and make sure the guardian waiver is signed before a child card is issued.

Path: `/desk/kiosk` is the fullscreen door station. Use it when the desk wants members to step up to their own screen. The desk scanner page is still the place for overrides and family linking.

Path: `/desk/dry-run` is the opening check. Run it when the scanner, the network, or the screens feel uncertain. Fix what it flags before the rush.

Corner rule: No signed waiver, no QR. The override is the exception, and it always leaves a trail.

Never: Override with a blank reason, a dot, or "ok."

## 5. Screens

Each TV shows its own page.

- Reception: https://www.sullys1943.com/tv/reception — welcome, schedule, arrivals.
- Floor: https://www.sullys1943.com/tv/floor — the class, the round timer, the cards, the celebration.
- A spare screen can open https://www.sullys1943.com/tv/demo while you are training a new staff member.

The floor timer follows the coach in Live Class Mode. If the floor TV loses the network, it keeps the last good board and the timer keeps running. A banner on the screen means the live feed dropped. Do not restart the round from the TV. Fix the network, or let the coach keep the clock.

Tap the floor page once after it opens. Browsers block sound until someone touches the page.

Public screens show first names and initials. They are not a full member list.

## 6. Waivers and the card

1. A member cannot pull a check-in QR until the liability waiver is signed.
2. A child cannot pull a QR until the guardian has signed.
3. Members sign and download their copy at `/app/waiver`.
4. Parents sign the youth waiver from Family at `/app/family`.
5. The owner brief lists people who still need a signature. Clear that list from the desk, not from memory.

Corner rule: The card on the phone is the member’s key to the floor. Brightness up. Hold still. If it will not issue, the waiver or the membership is the reason.

## 7. Money

Read today’s takings on `/owner`. The tender split shows how the day was paid.

Cash stays on the Sully’s ledger at the desk.

Card is the next piece. The Helcim terminal is on order and is not part of this book yet. Do not tell members that card-on-file or tap is live until the owner has run one real charge and the owner total matches the terminal.

Until that day:

1. Take cash the way the gym already does.
2. Record the visit in the staff console.
3. Do not improvise a card button that is not on the screen.

Membership plans and drop-ins live in the system. Members review their own history at `/app/billing`.

Never: Write a card number down. Never put a card number in a message, a note, or a waiver.

## 8. People and access

Path: `/admin/users`
Only the owner and an admin can open it.

1. Invite a front desk, coach, admin, or owner account.
2. Give them a temporary password in person, and have them replace it on first sign-in.
3. Change the role when the job changes.
4. When someone leaves, disable the account before they leave the building. A disabled account cannot sign in.
5. You cannot disable your own account. Ask the other owner or admin to do that.

Coach accounts can run class, roster, live mode, messages, and coach analytics. They cannot open the owner money page or staff admin.

Front desk can scan, override with a reason, run the kiosk, and run the opening check.

Never: Share one login among the whole staff. Each person gets their own account so the override trail names a person.

## 9. Messages from the owner

From the owner brief, send one message to a group: active members, youth, adults, trial, monthly, or people who still owe a waiver.

Members read it in Messages inside the member app, with an unread mark.

Write it the way you would say it at the desk. Class time, door time, what to bring, who it is for.

Never: Medical detail, a card number, or a private billing note in a broadcast.

## 10. Kitchen

The kitchen is not open. The member card says coming soon. Do not take food orders on the system, and do not promise a meal plan from the app.

When the gym decides to serve food, this page of the manual gets replaced. Until then, ignore the kitchen tile.

## 11. Close the gym

1. Coaches finalize attendance and mark no-shows on the roster.
2. Read the owner brief once more. Clear anything that cannot wait until morning: an unsigned waiver you already chased, an override with a thin reason, a payment the desk still owes a receipt for.
3. Log out of the staff console if the desk computer stays in a public spot.
4. Lock the desk computer and shut the screens down the way the gym already does.

Corner rule: The last person out is the person who looked at `/owner`, not the person who only turned off the lights.

## 12. When something breaks

1. Staff site will not load: check the gym internet, then try the member site. If both fail, the building connection is down. The floor TV can keep the last class on screen.
2. Scan does nothing: click the scan box. Confirm the scanner adds Enter at the end of the code.
3. Member has no QR: send them to the waiver, or the parent to Family.
4. Floor TV is silent: tap the page once.
5. Floor TV shows the wrong class: the coach starts Live Class Mode for the session that is actually on the floor.
6. A number on the owner brief looks frozen: refresh the page. It should move again within a few seconds.

Support for the system: Quiet Agency · quietagency.co
Gym questions: the owner, then info@sullysboxinggym.com

---

# MANUAL TWO — COACH

**Cover title:** Coach Manual
**Cover subtitle:** How to take the class from the first name on the card to the last bell
**Audience:** Coaches
**Version:** November 2026

## 1. Your corner

You run the class. The desk runs the door. The owner runs the money.

Sign in at https://staff.sullys1943.com with your own coach account. Your home is Coach Command. The screen title is "Today on the floor."

From there you can open:

- Roster and boxing cards
- Live Class Mode
- Class builder
- Messages
- Coach analytics

You do not need the owner page, the staff admin page, or the kitchen. The kitchen is not open.

Corner rule: Open today’s class before the athletes are in the ring. The floor TV follows you. If you are not in Live Class Mode, the room is looking at a board you are not driving.

## 2. Before the bell

1. Sign in.
2. On Coach Command, read today’s classes, who is checked in, who is still due, and who needs a look.
3. Open the class you are about to teach.
4. Glance the roster. Know the new names before you shout them.
5. If you built the workout ahead of time, open it from the class builder so Live Mode is not a blank clock.
6. Confirm the floor TV is on https://www.sullys1943.com/tv/floor, fullscreen, and that someone tapped the screen once for sound.

The desk owns the scanner. If a member is in the room and not on your list, send them to the desk. Do not invent a check-in from the coach page unless the roster gives you that action for this class.

## 3. Roster and boxing cards

Path: `/coach/roster`
Screen title: "Roster & Boxing Cards."

This is the class list and the athlete card.

1. Pick today’s class from the row of sessions.
2. See who is in the gym, who is booked, and who is still missing.
3. Open an athlete when you need the card: what changed, and the next step you want them to hear.
4. Mark attendance honestly at the end of the round. A no-show is a no-show.
5. If a check-in was a mistake and the page lets you void it, write a clear reason.

Corner rule: The card is a coaching note, not a scoreboard for the parent group chat. Write what the athlete can use next class.

Never: Put an injury, a medical note, or a family problem into a broadcast message. Say it to the right person.

## 4. Live Class Mode

Open Live from the class you are teaching.

The page shows the class name, how many are checked in, and whether the floor TV is synced. A healthy pill means the floor is with you. "TV sync recovering" means the screen is catching up or the network hiccuped. Keep coaching. The timer on your page is the source.

1. Start the class when the room is actually ready, not while people are still at the desk.
2. Run the rounds from this page. The floor TV shows the same clock.
3. Kids classes show Kids Mode on the page. Keep the language and the clock matched to that room.
4. Finish the class from this page. Athletes receive the class XP when you complete it. Do not complete it early to "get ahead" of the next group.
5. If the page says the device is offline, stay on the page. Do not refresh in the middle of a round unless the clock is frozen. Finishing while offline can wait until the pill turns healthy again, then complete.

What the room sees: the floor TV shows the timer, the class, the cards in the mix, and the celebration when the round earns it. You do not design those cards during class.

Corner rule: One coach drives the clock. A second coach does not start a second timer for the same class.

## 5. Build the workout

Path: `/coach/builder`
Screen title: "Program every bell."

Use this before class, not while athletes are waiting on the bell.

1. Build the workout you intend to reuse.
2. Save it.
3. Attach it to the class so Live Mode opens on that plan.
4. If the plan changes at the last minute, change it here, then go to Live. Do not describe a different workout than the one on the screen if athletes are reading the TV.

## 6. Messages

Path: `/coach/messages`
Screen title: "Keep the corner connected."

Use messages for class news a member needs before they arrive: time change, gloves, a level note, a welcome to someone new.

1. Answer a member thread when it is yours to answer.
2. Send a class note to the people in that class, not to the whole gym, unless the owner asked for a broadcast.
3. The owner sends gym-wide messages from the owner brief. Ask them when the note is for everyone.

Never: Card numbers, medical detail, or another athlete’s business.

## 7. After class

1. Complete Live Class Mode if you have not already.
2. Finalize the roster. Checked in, no-show, and any void with a reason.
3. Write the next step on the cards that changed today. One line is enough.
4. Leave the next coach a clean class. Their Live page should not open on your unfinished round.

## 8. Know your corner

Path: `/coach/analytics`
Screen title: "Know your corner."

Use it between classes, not during a round. It shows classes taught, attendance, and challenge results. Read it to see who is slipping and which class is thin. Bring a real pattern to the owner. Do not manage money from this page.

## 9. The floor TV, in coach language

- Address: https://www.sullys1943.com/tv/floor
- Fullscreen: press F.
- Sound: tap the page once after it loads.
- The cards in the rotation are the gym’s cards, including the coaches. You do not upload a new card from the floor.
- If the TV shows a banner that the feed dropped, your Live page is still the clock. Tell the desk the screen needs the network. Keep the round.

Reception is a different page, https://www.sullys1943.com/tv/reception. That one is the desk’s welcome screen. Do not put the class timer on reception.

## 10. What to do when the room goes sideways

1. Athlete says they paid and they are not on the roster: desk, not a side door.
2. Athlete has no QR: waiver, or the parent for a youth. Desk can override with a written reason. You do not have to.
3. Timer and TV disagree: trust Live Class Mode. Say the round out loud. Let the screen catch up.
4. Wrong class on your screen: leave Live and open the session that is in the room.
5. You cannot sign in: do not use someone else’s account. Find the owner or admin.

The desk phone and the front door stay the desk’s job. Your job is the athletes in front of you and the clock on the floor.

---

## Print notes for the person at the computer

After ChatGPT hands back the two HTML files:

1. Save them as `Sullys-Owner-Manual.html` and `Sullys-Coach-Manual.html`.
2. Open each in Chrome or Edge.
3. Print → Save as PDF.
4. Paper: Letter.
5. Margins: None.
6. Background graphics: On.
7. Scale: 100, not "fit to page," if the page already matches Letter.

Print the owner book for the office. Print the coach book for the coaches’ corner. Do not print passwords onto either one.
