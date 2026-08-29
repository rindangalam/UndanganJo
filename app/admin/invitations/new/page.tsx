import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewInvitationForm from "./invitation-form";

export const metadata: Metadata = {
  title: "Buat Undangan Manual",
};

export default async function NewInvitationPage() {
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

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, price")
    .eq("is_active", true)
    .order("price", { ascending: true });

  return (
    <div className="flex min-h-screen flex-col bg-linen-bg">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="font-serif text-2xl font-medium text-rosewood-ink">
            UndanganJo
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-onsurface-variant hover:text-rosewood-ink"
          >
            Batal
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 py-10">
        <NewInvitationForm packages={packages ?? []} />
      </main>
    </div>
  );
}
