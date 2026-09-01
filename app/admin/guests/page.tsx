import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "../admin-sidebar";
import AdminDeleteWishButton from "./delete-wish-button";

export const metadata: Metadata = {
  title: "RSVP & Ucapan",
};

export default async function AdminGuestsPage() {
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

  const [{ data: invites }, { data: guests }, { data: wishes }] = await Promise.all([
    supabase
      .from("invitations")
      .select("id, slug, groom_name, bride_name"),
    supabase
      .from("guests")
      .select("id, invitation_id, name, attending, guest_count, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("wishes")
      .select("id, invitation_id, name, message, is_approved, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const invitations = invites ?? [];
  const guestRows = guests ?? [];
  const wishRows = wishes ?? [];

  const byInvitation = invitations.map((inv) => {
    const gs = guestRows.filter((g) => g.invitation_id === inv.id);
    return {
      ...inv,
      couple: [inv.groom_name, inv.bride_name].filter(Boolean).join(" & ") || "—",
      rsvpTotal: gs.length,
      attending: gs.filter((g) => g.attending === true).length,
      guestsCount: gs.reduce((s, g) => s + (g.guest_count || 1), 0),
      wishes: wishRows.filter((w) => w.invitation_id === inv.id),
    };
  });

  const totalRsvp = guestRows.length;
  const totalAttending = guestRows.filter((g) => g.attending === true).length;
  const totalWishes = wishRows.length;

  return (
    <div className="flex min-h-screen bg-linen-bg">
      <AdminSidebar active="guests" />

      <main className="w-full flex-1 p-6 md:p-8">
        <header className="mb-6 border-b border-outline-variant pb-4">
          <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
            RSVP &amp; Buku Ucapan
          </h1>
          <p className="mt-1 text-body-md text-onsurface-variant">
            Rekap RSVP dan moderasi ucapan lintas undangan (FR-E3 / FR-E4).
          </p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: "Total RSVP", value: totalRsvp },
            { label: "Tamu Hadir", value: totalAttending },
            { label: "Total Ucapan", value: totalWishes },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-outline-variant bg-surface p-6"
            >
              <p className="text-label-sm uppercase tracking-widest text-onsurface-variant">
                {s.label}
              </p>
              <p className="mt-1 font-serif text-3xl font-medium text-rosewood-ink">
                {s.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-8 overflow-hidden rounded-lg border border-outline-variant bg-surface">
          <div className="border-b border-outline-variant px-5 py-4">
            <h2 className="font-serif text-xl font-medium text-rosewood-ink">
              Rekap per Undangan
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-md">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm uppercase tracking-widest text-onsurface-variant">
                  <th className="px-5 py-3 font-semibold">Pasangan</th>
                  <th className="px-5 py-3 text-center font-semibold">RSVP</th>
                  <th className="px-5 py-3 text-center font-semibold">Hadir</th>
                  <th className="px-5 py-3 text-center font-semibold">Orang</th>
                  <th className="px-5 py-3 text-center font-semibold">Ucapan</th>
                  <th className="px-5 py-3 text-center font-semibold">Export</th>
                </tr>
              </thead>
              <tbody>
                {byInvitation.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-onsurface-variant">
                      Belum ada undangan.
                    </td>
                  </tr>
                ) : (
                  byInvitation.map((inv) => (
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
                      <td className="px-5 py-4 text-center text-onsurface-variant">
                        {inv.rsvpTotal}
                      </td>
                      <td className="px-5 py-4 text-center text-onsurface-variant">
                        {inv.attending}
                      </td>
                      <td className="px-5 py-4 text-center text-onsurface-variant">
                        ~{inv.guestsCount}
                      </td>
                      <td className="px-5 py-4 text-center text-onsurface-variant">
                        {inv.wishes.length}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <a
                          href={`/api/rsvp/export?invitation_id=${encodeURIComponent(inv.id)}`}
                          className="inline-flex items-center gap-1 rounded-md border border-outline-variant px-3 py-1.5 text-label-sm font-semibold text-rosewood-ink transition hover:bg-surface-container-low"
                        >
                          CSV
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Wish moderation */}
        <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
          <div className="border-b border-outline-variant px-5 py-4">
            <h2 className="font-serif text-xl font-medium text-rosewood-ink">
              Moderasi Ucapan
            </h2>
            <p className="mt-1 text-sm text-onsurface-variant">
              Hapus ucapan yang tidak pantas.
            </p>
          </div>
          {wishRows.length === 0 ? (
            <p className="px-5 py-12 text-center text-onsurface-variant">
              Belum ada ucapan.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {wishRows.map((w) => {
                const inv = invitations.find((i) => i.id === w.invitation_id);
                const couple =
                  inv && (inv.groom_name || inv.bride_name)
                    ? [inv.groom_name, inv.bride_name].filter(Boolean).join(" & ")
                    : "—";
                return (
                  <li key={w.id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-label-sm font-semibold uppercase tracking-widest text-onsurface">
                        {w.name}
                        {!w.is_approved && (
                          <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs font-semibold text-rosewood-ink">
                            Belum disetujui
                          </span>
                        )}
                        <span className="text-xs font-normal normal-case text-onsurface-variant">
                          → {couple} (/{inv?.slug ?? "-"})
                        </span>
                      </p>
                      <p className="mt-1 whitespace-pre-line text-body-md text-onsurface-variant">
                        {w.message}
                      </p>
                    </div>
                    <AdminDeleteWishButton wishId={w.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
