import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvitationEditor from "./invitation-editor";

export default async function EditInvitationPage({
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

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!invitation) notFound();

  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", invitation.package_id ?? "")
    .maybeSingle();

  const themesQuery = supabase
    .from("themes")
    .select("*")
    .eq("is_active", true)
    .order("is_premium", { ascending: true });
  const { data: themes } = await themesQuery;

  return (
    <InvitationEditor
      invitation={invitation}
      pkg={pkg ?? null}
      themes={themes ?? []}
    />
  );
}
