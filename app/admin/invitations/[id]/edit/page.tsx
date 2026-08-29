import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvitationEditor from "@/app/(customer)/dashboard/[id]/edit/invitation-editor";

export const metadata: Metadata = {
  title: "Edit Undangan",
};

export default async function AdminEditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userRole = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (userRole.error || userRole.data?.role !== "admin") redirect("/dashboard");

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!invitation) notFound();

  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", invitation.package_id ?? "")
    .maybeSingle();

  const { data: themes } = await supabase
    .from("themes")
    .select("*")
    .eq("is_active", true)
    .order("is_premium", { ascending: true });

  return (
    <InvitationEditor
      invitation={invitation}
      pkg={pkg ?? null}
      themes={themes ?? []}
      backHref="/admin"
      backLabel="Kembali ke Admin"
    />
  );
}
