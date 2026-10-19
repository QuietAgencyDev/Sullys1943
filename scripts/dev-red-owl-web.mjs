/**
 * Local Red Owl web preview: NEXT_PUBLIC_BRAND=red-owl on port 3010
 * Usage: npm run dev:web:red-owl
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "apps", "web");
const port = process.env.PORT || "3010";

process.env.NEXT_PUBLIC_BRAND = "red-owl";

const child = spawn("npx", ["next", "dev", "--port", String(port)], {
  cwd: webDir,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
