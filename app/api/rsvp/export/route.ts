import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const csvEscape = (value: unknown): string => {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invitationId = searchParams.get("invitation_id");

  if (!invitationId) {
    return NextResponse.json({ error: "missing invitation_id" }, { status: 400 });
  }

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from("invitations")
    .select("id, slug, customer_id, groom_name, bride_name, akad_date, reception_date")
    .eq("id", invitationId)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const userRole = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = userRole.data?.role === "admin";
  const isOwner = invitation.customer_id === user.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: guests } = await admin
    .from("guests")
    .select("name, attending, guest_count, created_at")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  const rows = guests ?? [];

  const header = ["No", "Nama", "Status", "Orang", "Waktu"];
  const body = rows.map((g, i) => [
    i + 1,
    g.name,
    g.attending === true
      ? "Hadir"
      : g.attending === false
        ? "Tidak Hadir"
        : "Belum Konfirmasi",
    g.guest_count ?? "",
    g.created_at ? new Date(g.created_at).toLocaleString("id-ID") : "",
  ]);

  const csv = [header, ...body]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const slug = invitation.slug || "undangan";
  const filename = `rsvp-${slug}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
