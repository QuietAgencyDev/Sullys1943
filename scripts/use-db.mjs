/**
 * Toggle Prisma between local SQLite and Docker Postgres.
 * Usage: node scripts/use-db.mjs sqlite|postgres
 */
import fs from "node:fs";
import path from "node:path";

const mode = (process.argv[2] || "").toLowerCase();
if (mode !== "sqlite" && mode !== "postgres") {
  console.error("Usage: node scripts/use-db.mjs sqlite|postgres");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const schemaPath = path.join(root, "apps/api/prisma/schema.prisma");
const envPath = path.join(root, "apps/api/.env");

let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${mode === "postgres" ? "postgresql" : "sqlite"}"`,
);
fs.writeFileSync(schemaPath, schema);

const sqliteUrl = 'DATABASE_URL="file:./dev.db"';
const postgresUrl =
  'DATABASE_URL="postgresql://sullys:sullys@localhost:5432/sullys"';

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
if (/^DATABASE_URL=/m.test(env)) {
  env = env.replace(
    /^DATABASE_URL=.*$/m,
    mode === "postgres" ? postgresUrl : sqliteUrl,
  );
} else {
  env = `${mode === "postgres" ? postgresUrl : sqliteUrl}\n${env}`;
}
fs.writeFileSync(envPath, env);

console.log(`Database mode: ${mode}`);
console.log(
  mode === "postgres"
    ? "Next: npm run db:up && npm run db:push && npm run db:seed"
    : "Next: npm run db:push && npm run db:seed",
);
