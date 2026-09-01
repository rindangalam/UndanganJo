"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

export interface InvitationDataInput {
  groom_name: string;
  bride_name: string;
  akad_date: string;
  akad_time: string;
  akad_location: string;
  akad_maps_url: string;
  reception_date: string;
  reception_time: string;
  reception_location: string;
  reception_maps_url: string;
  story: string;
  gift_name: string;
  gift_account: string;
  gift_info: string;
}

type ActionResult = { ok: boolean; error?: string };

export async function createInvitation(packageId: string): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = `undangan-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;

  const { data, error } = await supabase
    .from("invitations")
    .insert({ customer_id: user.id, package_id: packageId, slug, status: "draft" })
    .select("id")
    .single();

  if (error || !data) redirect("/dashboard");

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/${data.id}/edit`);
}

export async function saveInvitationData(
  id: string,
  data: InvitationDataInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const isAdmin = await isAdminUser();

  let query = supabase
    .from("invitations")
    .update({
      groom_name: data.groom_name || null,
      bride_name: data.bride_name || null,
      akad_date: data.akad_date || null,
      akad_time: data.akad_time || null,
      akad_location: data.akad_location || null,
      akad_maps_url: data.akad_maps_url || null,
      reception_date: data.reception_date || null,
      reception_time: data.reception_time || null,
      reception_location: data.reception_location || null,
      reception_maps_url: data.reception_maps_url || null,
      story: data.story || null,
      gift_name: data.gift_name || null,
      gift_account: data.gift_account || null,
      gift_info: data.gift_info || null,
    })
    .eq("id", id);
  if (!isAdmin) query = query.eq("customer_id", user.id);

  const { error } = await query;

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/${id}/edit`, "layout");
  return { ok: true };
}

export async function setTheme(
  id: string,
  themeId: string | null
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const isAdmin = await isAdminUser();

  if (themeId) {
    const { data: theme } = await supabase
      .from("themes")
      .select("id, is_premium")
      .eq("id", themeId)
      .maybeSingle();
    if (!theme) return { ok: false, error: "Tema tidak ditemukan." };

    let invitationQuery = supabase
      .from("invitations")
      .select("package_id")
      .eq("id", id);
    if (!isAdmin) invitationQuery = invitationQuery.eq("customer_id", user.id);
    const { data: invitation } = await invitationQuery.maybeSingle();
    if (!invitation) return { ok: false, error: "Undangan tidak ditemukan." };

    if (theme.is_premium) {
      const { data: pkg } = await supabase
        .from("packages")
        .select("premium_themes")
        .eq("id", invitation.package_id ?? "")
        .maybeSingle();
      if (!pkg?.premium_themes) {
        return { ok: false, error: "Paket kamu tidak mengakses tema premium." };
      }
    }
  }

  let updateQuery = supabase
    .from("invitations")
    .update({ theme_id: themeId })
    .eq("id", id);
  if (!isAdmin) updateQuery = updateQuery.eq("customer_id", user.id);
  const { error } = await updateQuery;

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/${id}/edit`, "layout");
  return { ok: true };
}

export async function addPhoto(id: string, url: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const isAdmin = await isAdminUser();

  let invitationQuery = supabase
    .from("invitations")
    .select("gallery_photos, package_id")
    .eq("id", id);
  if (!isAdmin) invitationQuery = invitationQuery.eq("customer_id", user.id);
  const { data: invitation } = await invitationQuery.maybeSingle();
  if (!invitation) return { ok: false, error: "Undangan tidak ditemukan." };

  const { data: pkg } = await supabase
    .from("packages")
    .select("max_photos")
    .eq("id", invitation.package_id ?? "")
    .maybeSingle();
  const max = pkg?.max_photos ?? 0;
  const current = (invitation.gallery_photos ?? []).length;
  if (current >= max) {
    return { ok: false, error: `Maksimal ${max} foto untuk paket ini.` };
  }

  let updateQuery = supabase
    .from("invitations")
    .update({ gallery_photos: [...(invitation.gallery_photos ?? []), url] })
    .eq("id", id);
  if (!isAdmin) updateQuery = updateQuery.eq("customer_id", user.id);
  const { error } = await updateQuery;

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/${id}/edit`, "layout");
  return { ok: true };
}

export async function removePhoto(
  id: string,
  url: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const isAdmin = await isAdminUser();

  let invitationQuery = supabase
    .from("invitations")
    .select("gallery_photos")
    .eq("id", id);
  if (!isAdmin) invitationQuery = invitationQuery.eq("customer_id", user.id);
  const { data: invitation } = await invitationQuery.maybeSingle();
  if (!invitation) return { ok: false, error: "Undangan tidak ditemukan." };

  const remaining = ((invitation.gallery_photos ?? []) as string[]).filter(
    (p) => p !== url
  );

  let updateQuery = supabase
    .from("invitations")
    .update({ gallery_photos: remaining })
    .eq("id", id);
  if (!isAdmin) updateQuery = updateQuery.eq("customer_id", user.id);
  const { error } = await updateQuery;

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/${id}/edit`, "layout");
  return { ok: true };
}

export async function setMedia(
  id: string,
  data: { livestream_url?: string | null; video_url?: string | null }
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const isAdmin = await isAdminUser();

  if (data.video_url || data.livestream_url) {
    let invitationQuery = supabase
      .from("invitations")
      .select("package_id")
      .eq("id", id);
    if (!isAdmin) invitationQuery = invitationQuery.eq("customer_id", user.id);
    const { data: pkg } = await invitationQuery.maybeSingle();
    if (!pkg) return { ok: false, error: "Undangan tidak ditemukan." };

    const { data: packageInfo } = await supabase
      .from("packages")
      .select("has_video")
      .eq("id", pkg.package_id ?? "")
      .maybeSingle();
    if (!packageInfo?.has_video) {
      return { ok: false, error: "Paket kamu tidak mendukung video & live streaming." };
    }
  }

  const update: Record<string, string | null> = {};
  if (data.livestream_url !== undefined) update.livestream_url = data.livestream_url || null;
  if (data.video_url !== undefined) update.video_url = data.video_url || null;
  if (Object.keys(update).length === 0) return { ok: true };

  let updateQuery = supabase.from("invitations").update(update).eq("id", id);
  if (!isAdmin) updateQuery = updateQuery.eq("customer_id", user.id);
  const { error } = await updateQuery;

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/${id}/edit`, "layout");
  return { ok: true };
}

export async function setMusic(
  id: string,
  url: string | null
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  const isAdmin = await isAdminUser();

  if (url) {
    let invitationQuery = supabase
      .from("invitations")
      .select("package_id")
      .eq("id", id);
    if (!isAdmin) invitationQuery = invitationQuery.eq("customer_id", user.id);
    const { data: pkg } = await invitationQuery.maybeSingle();
    if (!pkg) return { ok: false, error: "Undangan tidak ditemukan." };

    const { data: packageInfo } = await supabase
      .from("packages")
      .select("has_music")
      .eq("id", pkg.package_id ?? "")
      .maybeSingle();
    if (!packageInfo?.has_music) {
      return { ok: false, error: "Paket kamu tidak mendukung musik latar." };
    }
  }

  let updateQuery = supabase
    .from("invitations")
    .update({ music_url: url })
    .eq("id", id);
  if (!isAdmin) updateQuery = updateQuery.eq("customer_id", user.id);
  const { error } = await updateQuery;

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/${id}/edit`, "layout");
  return { ok: true };
}
