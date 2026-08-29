import { createClient } from "@/lib/supabase/server";

export async function getCurrentRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role ?? null;
}

export async function isAdminUser(): Promise<boolean> {
  return (await getCurrentRole()) === "admin";
}
