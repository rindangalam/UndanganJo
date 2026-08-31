"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

type ActionResult = { ok: boolean; error?: string };

export async function createManualOrder(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "Anda tidak memiliki akses admin." };
  }

  const supabase = await createClient();
  const invitationId = String(formData.get("invitation_id") ?? "").trim();
  const packageIdRaw = String(formData.get("package_id") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();

  if (!invitationId) {
    return { ok: false, error: "Pilih undangan untuk order ini." };
  }
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Nominal harus berupa angka positif." };
  }
  const packageId = packageIdRaw ? packageIdRaw : null;

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, customer_id, status")
    .eq("id", invitationId)
    .maybeSingle();
  if (!invitation) {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  const { error: orderError } = await supabase.from("orders").insert({
    invitation_id: invitationId,
    customer_id: invitation.customer_id,
    package_id: packageId,
    amount,
    status: "pending",
    payment_method: "manual",
  });
  if (orderError) {
    return { ok: false, error: orderError.message };
  }

  // Undangan draft yang dipesan manual menunggu pembayaran.
  if (invitation.status === "draft") {
    await supabase
      .from("invitations")
      .update({ status: "menunggu_bayar" })
      .eq("id", invitationId);
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function confirmOrderPaid(orderId: string): Promise<ActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "Anda tidak memiliki akses admin." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, payment_method, invitation_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "Order tidak ditemukan." };
  if (order.payment_method !== "manual") {
    return { ok: false, error: "Hanya order manual yang dikonfirmasi admin." };
  }
  if (order.status === "paid") {
    return { ok: false, error: "Order ini sudah berstatus lunas." };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid", confirmed_by: user.id })
    .eq("id", orderId);
  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  // FR-G9: order manual lunas → undangan terkait otomatis published.
  if (order.invitation_id) {
    await supabase
      .from("invitations")
      .update({ status: "published" })
      .eq("id", order.invitation_id);
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function createAdminInvitation(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult & { id?: string }> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "Anda tidak memiliki akses admin." };
  }

  const supabase = await createClient();
  const packageIdRaw = String(formData.get("package_id") ?? "").trim();
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();

  if (!packageIdRaw) {
    return { ok: false, error: "Pilih paket untuk undangan ini." };
  }
  if (!customerName) {
    return { ok: false, error: "Nama customer wajib diisi sebagai referensi." };
  }

  const slug = `undangan-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      customer_id: null,
      package_id: packageIdRaw,
      slug,
      status: "draft",
      created_by_admin: true,
      customer_name: customerName,
      customer_phone: customerPhone || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Gagal membuat undangan." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true, id: data.id };
}

function toBool(value: FormDataEntryValue | null, fallback = false): boolean {
  if (value === "on") return true;
  if (value === null) return fallback;
  return value === "true";
}

function toInt(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === "") return null;
  const n = Number(String(value));
  return Number.isFinite(n) ? Math.floor(n) : null;
}

// ============================================================
// FR-G4: CRUD tema
// ============================================================

export async function createTheme(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Akses admin diperlukan." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Nama tema wajib diisi." };
  const key = String(formData.get("key") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(key))
    return { ok: false, error: "Key harus berupa huruf/angka/tanda hubung (cth: sastra, modern-noir)." };
  const thumbnail_url = String(formData.get("thumbnail_url") ?? "").trim() || null;
  const is_premium = toBool(formData.get("is_premium"), false);
  const is_active = toBool(formData.get("is_active"), true);

  const supabase = await createClient();
  const { error } = await supabase.from("themes").insert({
    name,
    key,
    thumbnail_url,
    is_premium,
    is_active,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings", "layout");
  return { ok: true };
}

export async function updateTheme(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Akses admin diperlukan." };
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { ok: false, error: "Data tidak lengkap." };
  const key = String(formData.get("key") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(key))
    return { ok: false, error: "Key harus berupa huruf/angka/tanda hubung (cth: sastra, modern-noir)." };
  const thumbnail_url = String(formData.get("thumbnail_url") ?? "").trim() || null;
  const is_premium = toBool(formData.get("is_premium"), false);
  const is_active = toBool(formData.get("is_active"), true);

  const supabase = await createClient();
  const { error } = await supabase
    .from("themes")
    .update({ name, key, thumbnail_url, is_premium, is_active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings", "layout");
  return { ok: true };
}

export async function deleteTheme(themeId: string): Promise<ActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Akses admin diperlukan." };
  const supabase = await createClient();
  const { error: delError } = await supabase
    .from("themes")
    .delete()
    .eq("id", themeId);
  if (delError) {
    return {
      ok: false,
      error:
        "Tema masih dipakai undangan lain atau tidak bisa dihapus. Gunakan toggle 'Aktif' untuk menyembunyikan.",
    };
  }
  revalidatePath("/admin/settings", "layout");
  return { ok: true };
}

// ============================================================
// FR-G5: CRUD paket
// ============================================================

export async function createPackage(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Akses admin diperlukan." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Nama paket wajib diisi." };
  const price = toInt(formData.get("price"));
  if (price === null || price < 0)
    return { ok: false, error: "Harga harus berupa angka non-negatif." };
  const max_photos = toInt(formData.get("max_photos"));
  const description = String(formData.get("description") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("packages").insert({
    name,
    price,
    description,
    max_photos: max_photos ?? 20,
    has_music: toBool(formData.get("has_music"), false),
    has_video: toBool(formData.get("has_video"), false),
    premium_themes: toBool(formData.get("premium_themes"), false),
    is_active: toBool(formData.get("is_active"), true),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings", "layout");
  return { ok: true };
}

export async function updatePackage(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Akses admin diperlukan." };
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { ok: false, error: "Data tidak lengkap." };
  const price = toInt(formData.get("price"));
  if (price === null || price < 0)
    return { ok: false, error: "Harga harus berupa angka non-negatif." };
  const max_photos = toInt(formData.get("max_photos"));
  const description = String(formData.get("description") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("packages")
    .update({
      name,
      price,
      description,
      max_photos: max_photos ?? 20,
      has_music: toBool(formData.get("has_music"), false),
      has_video: toBool(formData.get("has_video"), false),
      premium_themes: toBool(formData.get("premium_themes"), false),
      is_active: toBool(formData.get("is_active"), true),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings", "layout");
  return { ok: true };
}

export async function deletePackage(packageId: string): Promise<ActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "Akses admin diperlukan." };
  const supabase = await createClient();
  const { error: delError } = await supabase
    .from("packages")
    .delete()
    .eq("id", packageId);
  if (delError) {
    return {
      ok: false,
      error:
        "Paket masih dipakai undangan/order lain atau tidak bisa dihapus. Gunakan toggle 'Aktif' untuk menyembunyikan.",
    };
  }
  revalidatePath("/admin/settings", "layout");
  return { ok: true };
}
