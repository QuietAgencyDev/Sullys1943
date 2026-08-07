/**
 * Validates STRIPE_SECRET_KEY from apps/api/.env (does not print the key).
 * Usage: node scripts/check-stripe.mjs
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(import.meta.dirname, "../apps/api/.env");
if (!fs.existsSync(envPath)) {
  console.error("Missing apps/api/.env");
  process.exit(1);
}

const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/^\s*STRIPE_SECRET_KEY\s*=\s*["']?([^"'#\r\n]+)/m);
const key = match?.[1]?.trim();

if (!key) {
  console.log("Stripe: MOCK (no STRIPE_SECRET_KEY in apps/api/.env)");
  console.log("Add sk_test_… from https://dashboard.stripe.com/test/apikeys");
  console.log("Then restart the API and run: node scripts/check-stripe.mjs");
  process.exit(0);
}

if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
  console.error("Stripe: key does not look like sk_test_ / sk_live_");
  process.exit(1);
}

const mode = key.startsWith("sk_test_") ? "test" : "live";
console.log(`Stripe: key present (${mode} mode, length ${key.length})`);

try {
  const res = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.ok) {
    console.log("Stripe: API ping OK — Checkout will use Stripe sessions");
    process.exit(0);
  }
  const body = await res.text();
  console.error(`Stripe: API ping failed (${res.status})`, body.slice(0, 200));
  process.exit(1);
} catch (err) {
  console.error(
    "Stripe: network error",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
}
