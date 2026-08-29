import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "../admin-sidebar";
import { IconEdit } from "@/components/icons";

export const metadata: Metadata = {
  title: "Invitations",
};

const STATUS_STYLE: Record<string, string> = {
  published: "bg-[#dae8d6] text-[#2f4a2e]",
  menunggu_bayar: "bg-secondary-container text-rosewood-ink",
  draft: "bg-surface-container text-onsurface-variant",
};

function first<T>(v: T[] | T | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function InvitationsPage() {
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

  const { data: rawInvitations } = await supabase
    .from("invitations")
    .select(
      "id, slug, customer_id, groom_name, bride_name, customer_name, customer_phone, status, created_at, package:packages(name)"
    )
    .order("created_at", { ascending: false });

  const invitations = (rawInvitations ?? []).map((inv) => {
    const pkg = first(inv.package);
    const couple =
      inv.groom_name && inv.bride_name
        ? `${inv.groom_name} & ${inv.bride_name}`
        : null;
    return {
      ...inv,
      pkgName: pkg?.name ?? "—",
      couple: couple ?? "—",
      source: inv.customer_id == null ? "Admin (WhatsApp)" : "Self-Serve",
    };
  });

  return (
    <div className="flex min-h-screen bg-linen-bg">
      <AdminSidebar active="invitations" />

      <main className="w-full flex-1 p-6 md:p-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
              Invitations
            </h1>
            <p className="mt-1 text-body-md text-onsurface-variant">
              Semua undangan lintas customer (self-serve & admin-assisted).
            </p>
          </div>
          <Link
            href="/admin/invitations/new"
            className="rounded-lg bg-rosewood-ink px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface"
          >
            New Manual Invitation
          </Link>
        </header>

        <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-md">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm uppercase tracking-widest text-onsurface-variant">
                  <th className="px-5 py-3 font-semibold">Pasangan</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Paket</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-onsurface-variant"
                    >
                      Belum ada undangan.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-outline-variant/60 transition last:border-0 hover:bg-surface-container-low"
                    >
                      <td className="px-5 py-4 font-medium text-onsurface">
                        {inv.couple}
                        <span className="block text-xs font-normal text-onsurface-variant">
                          /{inv.slug}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-onsurface-variant">
                        {inv.customer_name ?? "—"}
                        {inv.customer_phone ? (
                          <span className="block text-xs">
                            {inv.customer_phone}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-onsurface-variant">
                        {inv.source}
                      </td>
                      <td className="px-5 py-4 text-onsurface-variant">
                        {inv.pkgName}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-label-sm font-semibold ${
                            STATUS_STYLE[inv.status] ?? "bg-surface-container text-onsurface-variant"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/invitations/${inv.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-lg border border-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-wider text-rosewood-ink transition hover:bg-champagne-surface"
                        >
                          <IconEdit className="h-4 w-4" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
