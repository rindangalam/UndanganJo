import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import InvitationPage from "@/components/invitation/invitation-page";

export const dynamic = "force-dynamic";

async function getInvitation(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const query = supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .order("status", { ascending: true });

  const { data } = await query.limit(50);

  const published = (data ?? []).find((i) => i.status === "published");
  if (published) return published;

  const own = (data ?? []).find((i) => i.customer_id === user?.id);
  if (own && user) return own;

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Undangan ${slug}`,
    description: "Undangan pernikahan digital",
  };
}

export default async function InvitationSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) notFound();

  return <InvitationPage invitation={invitation} />;
}
