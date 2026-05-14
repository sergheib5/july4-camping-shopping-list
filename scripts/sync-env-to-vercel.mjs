/**
 * Upserts VITE_* keys from .env into the linked Vercel project for Production
 * and Preview (Vite embeds these at build time). Other keys are skipped so
 * local-only secrets are not pushed.
 *
 * Usage: npm run vercel:sync-env
 * Requires: `vercel link` done, `vercel login` (or VERCEL_TOKEN).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const projectPath = path.join(root, ".vercel", "project.json");

function parseEnvFile(text) {
  const pairs = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const value = t.slice(i + 1).trim();
    if (key) pairs.push([key, value]);
  }
  return pairs;
}

function main() {
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env at", envPath);
    process.exit(1);
  }
  if (!fs.existsSync(projectPath)) {
    console.error("Missing .vercel/project.json — run `vercel link` first.");
    process.exit(1);
  }

  const { orgId } = JSON.parse(fs.readFileSync(projectPath, "utf8"));
  if (!orgId) {
    console.error(".vercel/project.json has no orgId");
    process.exit(1);
  }

  const allPairs = parseEnvFile(fs.readFileSync(envPath, "utf8"));
  const pairs = allPairs.filter(([key]) => key.startsWith("VITE_"));
  const skipped = allPairs.length - pairs.length;
  if (pairs.length === 0) {
    console.error(
      "No VITE_* variables found in .env (only those keys are synced for safety).",
    );
    process.exit(1);
  }
  if (skipped > 0) {
    console.warn(`Skipping ${skipped} non-VITE_* key(s) (not synced to Vercel).`);
  }

  const targets = ["production", "preview"];
  for (const [key, value] of pairs) {
    for (const vercelEnv of targets) {
      execFileSync(
        "npx",
        [
          "vercel@latest",
          "env",
          "add",
          key,
          vercelEnv,
          "--value",
          value,
          "--yes",
          "--force",
          "--scope",
          orgId,
        ],
        { cwd: root, stdio: "inherit" },
      );
    }
  }

  console.log(
    `Synced ${pairs.length} key(s) × ${targets.length} environments to Vercel.`,
  );
}

main();
