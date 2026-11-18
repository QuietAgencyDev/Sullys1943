# ChatGPT brief — Sully’s savings, future-proofing, and growth

Upload this file together with `CHATGPT-MEMBERSHIP-CHART.md`. Then send the message in the box below, exactly.

```
Design two print-ready pages from these files.

Page 1: What the new system saves, and how it is future-proof.
Page 2: How that system carries the gym from 144 paying adults to 300.

Use only the numbers in these files. Do not invent a Glofox monthly bill. Do not invent yearly membership history. Hosting figures are a budget from 9 November 2026, not an invoice.

Brand: Sully red #C82026, corner brown #3A2418, cream #F3E6C8, ink #1A120E.
US Letter. One page each. No stock photos. No fake testimonials.
```

---

## Where the gym is

Date of this note: 15 November 2026. The gym opens Monday 16 November on the old system. Glofox still bills. The new Sully’s system is online and is not the door yet.

Already up: the public site, member sign-in, staff desk, floor TV page, reception TV page, and the API. Staff logins work, including the front desk.

Not ready to carry a class day: the live class calendar has no classes for opening week. One waiver is signed in the new system. Card and bank-debit billing are off. Password email is not sending yet.

Do not bill the same month in Glofox and here.

---

## What it costs to run

Planning numbers, 9 November 2026. Canadian dollars. Rate used then: 1.40 CAD per US dollar. Confirm every line on the real bill. Rent, coaches, and insurance are outside this sheet.

| Line | Open / month | Open / year |
| --- | ---: | ---: |
| Two domains | $3 | $30 |
| Cloudflare DNS, SSL, CDN, email forwarding | $0 | $0 |
| Member site and staff site | $28 | $336 |
| API and database, always on | $28 | $336 |
| Password and system mail, free tier | $0 | $0 |
| **Budget to run the gym** | **$59** | **$702** |

A usage spike can move the month toward $90. The cap to hold is under $100 a month. The free-tier floor is about $8 a month and is the wrong plan for a live gym.

There is no software licence on this sheet. Quiet Agency is not billing a platform fee or a maintenance retainer. Card fees, when billing moves, are a percent of the money that actually runs. They are not a second monthly software rent. QuickBooks, if the gym uses it, stays its own bill, about $30 a month, and waits until a settled week of real charges.

Later, only if the gym outgrows the open budget:

| Add | About / month | Why it waits |
| --- | ---: | --- |
| Stronger firewall and stats | $35 | Free Cloudflare is enough to open |
| Mail above 3,000 a month | $28 | Free tier is 3,000 emails a month and 100 a day |
| Overnight error alerts | $0–$36 | Free is enough at this size |
| Text messages | Per text | Off until the gym turns them on |
| Apple developer account | $12 | About $140 a year. The home-screen app does not need it |

---

## Savings

The saving is the software rent the gym stops paying once Glofox is cancelled, plus the dues the desk keeps. This file does not name a Glofox price. Put the gym’s own Glofox invoice next to the $59 budget. The difference is the software saving. Until that invoice is cancelled, the saving has not started.

What does not get saved by switching early:

- Do not run two bills for the same member in the same month.
- Do not count the $59 as profit. It is the cost of keeping the sites on.
- The list-price dues of the 144 paying adults are about **$21,510 a month**. Hosting at $59 is about **0.3%** of that. The money is in keeping those 144 and adding the next ones, not in shaving the hosting line.

At the goal of 300 paying adults, list-price dues are about **$44,910 a month**. That is about **$23,400 a month** more than today, at list price, before failed payments. Hosting stays in the same $59 to $100 band while that grows.

---

## Future-proof

The gym keeps the system. A cancelled vendor does not take the member list with it.

| Already in the gym’s system | Still to do before it carries the floor |
| --- | --- |
| 2,446 member accounts, loaded 11 November 2026 | Live class week loaded on the board |
| Staff desk, coach logins, owner brief | New Sully’s waiver on each person who scans in |
| Floor TV and reception TV | One real card charge and one bank debit that match the owner total |
| Member list owned in the gym database | Password email turned on, then tested once |
| Home-screen app from the website. No app store required | Glofox cancelled, and recurring payments transferred |

Billing path when the transfer is agreed: cards on Stripe, bank debit on GoCardless, cash on the desk ledger. The gym system does not store a full card number. Helcim is not the processor.

What did not come across from Glofox: stored cards, class history, and the old waiver. A person sets a password, signs the Sully’s waiver, and then holds a check-in card.

---

## Growth the system is built to hold

Same definition as the membership file. **144** standard adult dues in date on 11 November 2026. Goal **300**. Gap **156** net new paying adults. Pace **26 a month for 6 months**, counted net of cancellations.

The system earns its keep when those 26 show up as a dues plan in date, a signed waiver, and a scan at the door. A name on the old file is not a member until that happens.

Order of work:

1. Stay on Glofox through the transfer. No double bill.
2. Load the real week onto the floor board before the first class that uses this door.
3. Sign waivers at the desk as people arrive. No waiver, no QR.
4. Turn on mail. Send nothing to the full list. Class packages first, then recent visits.
5. Move cards to Stripe and bank debit to GoCardless only after Glofox agrees the transfer.
6. Each Monday, four numbers: paying adults in date, net new this week, cancelled this week, still to go until 300.

The desk scoreboard is the growth plan. The $59 budget is what keeps that scoreboard on.
