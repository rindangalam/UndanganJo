import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(file) {
  const result = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    result[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return result;
}

const env = loadDotEnv(".env.local");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// hapus semua invitations test (customer_id null atau slug ber-pattern test)
const { data: invs } = await admin.from("invitations").select("id, slug");
const testInvs = (invs ?? []).filter(
  (i) => i.slug && (i.slug.startsWith("a-") || i.slug.startsWith("b-") || i.slug.startsWith("a-pub-"))
);
if (testInvs.length) {
  await admin.from("invitations").delete().in("id", testInvs.map((i) => i.id));
  console.log("deleted invitations:", testInvs.map((i) => i.slug).join(", "));
} else {
  console.log("no test invitations to delete");
}

// hapus semua user test (email rls_* dan example.test)
const {
  data: { users },
} = await admin.auth.admin.listUsers();
const testUsers = (users ?? []).filter((u) => (u.email || "").endsWith("@example.test"));
for (const u of testUsers) {
  await admin.auth.admin.deleteUser(u.id).catch(() => {});
}
console.log("deleted test users:", testUsers.length);
