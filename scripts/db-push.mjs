import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = join(__dirname, "..", "supabase", ".env");

function loadDotEnv(file) {
  const result = {};
  if (!existsSync(file)) return result;
  const content = readFileSync(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const env = process.env;
const parsed = loadDotEnv(envFile);

const dbUrl = env.SUPABASE_DB_URL || parsed.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error("SUPABASE_DB_URL tidak ditemukan di supabase/.env");
  process.exit(1);
}

const args = ["db", "push"];
if (process.argv.includes("--debug")) args.push("--debug");
if (process.argv.includes("--dry-run")) args.push("--dry-run");
args.push("--yes");

const result = spawnSync("supabase", [...args, "--db-url", dbUrl], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
