/**
 * Import a Glofox member CSV into Sully's.
 *
 * Dry run (default):  node scripts/import-glofox-members.mjs members.csv
 * Write:              node scripts/import-glofox-members.mjs members.csv --commit
 *
 * Expected columns, any order, header required:
 * email, first name, last name, phone, membership, status, start, end
 *
 * Card numbers are ignored. Existing emails are kept. A new person gets a
 * random password and must use Forgot password. Waivers are not imported.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "apps/api/package.json"));
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const file = process.argv.find((arg) => arg.endsWith(".csv"));
const commit = process.argv.includes("--commit");
if (!file) {
  console.error("Pass the Glofox CSV path.");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  const headers = rows.shift()?.map((header) => header.toLowerCase()) ?? [];
  return rows.map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
}

function pick(record, names) {
  for (const name of names) {
    const value = record[name];
    if (value) return value;
  }
  return "";
}

function planCode(label) {
  return /youth|kid|child|little champ|jab lab|complimentary/i.test(label)
    ? "youth"
    : "monthly";
}

function parseWhen(raw) {
  if (!raw) return null;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const date = us
    ? new Date(Number(us[3]), Number(us[1]) - 1, Number(us[2]))
    : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function memberStatus(label, plan, endsAt) {
  const value = label.toLowerCase();
  if (/cancel|expired|inactive|frozen/.test(value)) return "cancelled";
  if (/pause/.test(value)) return "paused";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (endsAt && endsAt >= today) return "active";
  if (/complimentary youth/i.test(plan)) return "active";
  return "cancelled";
}

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  const envFile = path.join(root, "apps", "api", ".env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnv();

const records = parseCsv(fs.readFileSync(path.resolve(file), "utf8"));
const prisma = new PrismaClient();

const org = await prisma.organization.findFirst();
const location = org
  ? await prisma.location.findFirst({ where: { organizationId: org.id } })
  : null;
if (!org || !location) {
  console.error("No gym organization in the database.");
  process.exit(1);
}

let created = 0;
let updated = 0;
let skipped = 0;
let active = 0;
const plans = new Map();

for (const record of records) {
  const email = pick(record, ["email", "e-mail", "email address"]).toLowerCase();
  const firstName = pick(record, ["first name", "firstname", "first"]);
  const lastName = pick(record, ["last name", "lastname", "last"]);
  if (!email || !firstName || !lastName) {
    skipped += 1;
    console.log("skip incomplete row");
    continue;
  }
  const plan = pick(record, [
    "membership",
    "membership name",
    "plan",
    "membership type",
  ]);
  const code = planCode(plan);
  const endsAt = parseWhen(
    pick(record, [
      "end",
      "end date",
      "expiry",
      "expires",
      "membership expiry date",
    ]),
  );
  const status = memberStatus(
    pick(record, ["status", "membership status", "member status"]),
    plan,
    endsAt,
  );
  if (status === "active") {
    active += 1;
    plans.set(`${code}`, (plans.get(code) ?? 0) + 1);
  }
  if (!commit) continue;

  const product = await prisma.membershipProduct.findFirst({
    where: { organizationId: org.id, code },
  });
  if (!product) {
    skipped += 1;
    console.log(`  no product ${code}`);
    continue;
  }

  let user = await prisma.user.findFirst({
    where: { organizationId: org.id, email },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        firstName,
        lastName,
        phone: pick(record, ["phone", "mobile", "phone number"]) || null,
        dateOfBirth: parseWhen(
          pick(record, ["date of birth", "dob", "birth date"]),
        ),
        passwordHash: await bcrypt.hash(
          `set-me-${Math.random().toString(36).slice(2)}`,
          10,
        ),
        role: "member",
      },
    });
    created += 1;
  } else {
    updated += 1;
  }

  const existing = await prisma.membership.findFirst({
    where: { payerUserId: user.id, productId: product.id, status: "active" },
  });
  if (!existing && status === "active") {
    await prisma.membership.create({
      data: {
        locationId: location.id,
        productId: product.id,
        payerUserId: user.id,
        status: "active",
        endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
        members: { create: { userId: user.id } },
      },
    });
  }
}

console.log(
  commit
    ? `Created ${created}, updated ${updated}, skipped ${skipped}, active memberships ${active}. Password email is not sent. Waiver still required.`
    : `Dry run only. ${records.length} rows, ${skipped} skipped, ${active} would be active (${[...plans.entries()].map(([k, v]) => `${k} ${v}`).join(", ")}).`,
);
await prisma.$disconnect();
