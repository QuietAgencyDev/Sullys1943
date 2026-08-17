/**
 * Wipe/reseed local DB as Red Owl Scarborough (destructive seed).
 * Usage: node scripts/seed-red-owl.mjs
 * Warning: replaces all seeded data (same as normal db:seed).
 */
import { spawn } from "node:child_process";

process.env.SEED_BRAND = "red-owl";

const child = spawn(
  "npm",
  ["run", "prisma:seed", "-w", "@sullys/api"],
  { stdio: "inherit", shell: true, env: process.env },
);

child.on("exit", (code) => process.exit(code ?? 0));
