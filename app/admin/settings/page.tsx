import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "../admin-sidebar";
import ThemesManager from "./themes-manager";
import PackagesManager from "./packages-manager";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
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

  const [{ data: themes }, { data: packages }] = await Promise.all([
    supabase.from("themes").select("*").order("created_at", { ascending: true }),
    supabase.from("packages").select("*").order("created_at", { ascending: true }),
  ]);

  return (
    <div className="flex min-h-screen bg-linen-bg">
      <AdminSidebar active="settings" />

      <main className="w-full flex-1 p-6 md:p-8">
        <header className="mb-6 border-b border-outline-variant pb-4">
          <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
            Settings
          </h1>
          <p className="mt-1 text-body-md text-onsurface-variant">
            Kelola katalog tema &amp; paket.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <ThemesManager themes={themes ?? []} />
          <PackagesManager packages={packages ?? []} />
        </div>
      </main>
    </div>
  );
}
