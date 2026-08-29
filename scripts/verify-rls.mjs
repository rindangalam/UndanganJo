import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(file) {
  const result = {};
  const content = readFileSync(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    result[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return result;
}

const env = loadDotEnv(".env.local");
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const uuid = crypto.randomUUID().slice(0, 8);
const emailA = `rls_a_${uuid}@example.test`;
const emailB = `rls_b_${uuid}@example.test`;
const pw = "TestPass123!";

let failures = [];

function check(name, cond, extra = "") {
  if (cond) {
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(name);
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

// helper: create user dan kembalikan client terautentikasi
async function makeAuthenticatedClient(email) {
  const { data: uData, error: uErr } = await admin.auth.admin.createUser({
    email,
    password: pw,
    email_confirm: true,
  });
  if (uErr) throw new Error(`createUser ${email}: ${uErr.message}`);
  const userId = uData.user.id;

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: sErr } = await anon.auth.signInWithPassword({ email, password: pw });
  if (sErr) throw new Error(`signIn ${email}: ${sErr.message}`);

  return { userId, client: anon };
}

async function run() {
  console.log("RLS test — UndanganJo Sprint 1\n");

  // Bersihkan sisa undangan test (slug ber-prefix a-/b-/a-pub-) dari run sebelumnya
  const { data: leftover } = await admin
    .from("invitations")
    .select("id, slug")
    .or("slug.like,a-%");
  const testLeftover = (leftover ?? []).filter((i) =>
    /^(a-|b-|a-pub-)/.test(i.slug)
  );
  if (testLeftover.length) {
    await admin.from("invitations").delete().in("id", testLeftover.map((i) => i.id));
  }

  const A = await makeAuthenticatedClient(emailA);
  const B = await makeAuthenticatedClient(emailB);
  console.log(`  User A: ${emailA}`);
  console.log(`  User B: ${emailB}`);

  // 1. Belum ada undangan → kosong
  const a0 = await A.client.from("invitations").select("id");
  check("Awal: A melihat 0 undangan", a0.error === null && a0.data.length === 0);

  // 2. Admin sisipkan undangan: satu milik A (draft), satu milik B (draft), satu published milik A
  const insA = await admin
    .from("invitations")
    .insert({ customer_id: A.userId, slug: `a-${uuid}`, status: "draft", groom_name: "Ali", bride_name: "Ana" });
  check("Admin insert undangan A (draft)", insA.error === null, insA.error?.message);

  const insB = await admin
    .from("invitations")
    .insert({ customer_id: B.userId, slug: `b-${uuid}`, status: "draft", groom_name: "Budi", bride_name: "Bela" });
  check("Admin insert undangan B (draft)", insB.error === null, insB.error?.message);

  const insPub = await admin
    .from("invitations")
    .insert({ customer_id: A.userId, slug: `a-pub-${uuid}`, status: "published", groom_name: "Ali", bride_name: "Ana" });
  check("Admin insert undangan A (published)", insPub.error === null, insPub.error?.message);

  // 3. A melihat hanya undangan milik A (draft + published milik A), TIDAK undangan B
  const aList = await A.client.from("invitations").select("customer_id, status, slug");
  const aSlugs = (aList.data ?? []).map((r) => r.slug);
  check("A tidak melihat undangan B", !aSlugs.includes(`b-${uuid}`), JSON.stringify(aSlugs));
  check("A melihat undangan draft miliknya", aSlugs.includes(`a-${uuid}`));
  check("A melihat undangan published miliknya", aSlugs.includes(`a-pub-${uuid}`));

  // 4. B melihat hanya undangan milik B. B BOLEH melihat published milik A (FR-D1),
  //    tapi TIDAK boleh melihat draft A (tidak boleh ada kebocoran data draft).
  const bList = await B.client.from("invitations").select("status, slug");
  const bSlugs = (bList.data ?? []).map((r) => r.slug);
  check("B tidak melihat DRAFT A", !bSlugs.includes(`a-${uuid}`), JSON.stringify(bSlugs));
  check("B melihat undangan draft miliknya", bSlugs.includes(`b-${uuid}`));

  // 5. Anon (publik) hanya melihat published — draft A & B tidak terlihat
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anonList = await anon.from("invitations").select("slug");
  const anonSlugs = (anonList.data ?? []).map((r) => r.slug);
  check("Publik tidak melihat draft A", !anonSlugs.includes(`a-${uuid}`), JSON.stringify(anonSlugs));
  check("Publik tidak melihat draft B", !anonSlugs.includes(`b-${uuid}`));
  check("Publik melihat published milik A", anonSlugs.includes(`a-pub-${uuid}`));

  // cleanup
  await admin.auth.admin.deleteUser(A.userId).catch(() => {});
  await admin.auth.admin.deleteUser(B.userId).catch(() => {});

  console.log("\n" + (failures.length ? `GAGAL: ${failures.length} cek` : "SEMUA PASS ✅"));
  process.exit(failures.length ? 1 : 0);
}

run().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
