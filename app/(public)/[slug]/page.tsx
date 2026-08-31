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
  const row = published ?? (user ? (data ?? []).find((i) => i.customer_id === user.id) : undefined);
  if (!row) return null;

  let themeKey: string | null = null;
  if (row.theme_id) {
    const { data: theme } = await supabase
      .from("themes")
      .select("key")
      .eq("id", row.theme_id)
      .maybeSingle();
    themeKey = theme?.key ?? null;
  }

  return { invitation: row, themeKey };
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
  const result = await getInvitation(slug);
  if (!result) notFound();

  return <InvitationPage invitation={result.invitation} themeKey={result.themeKey} />;
}
