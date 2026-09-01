import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DeleteWishButton from "./delete-wish-button";
import { IconMail, IconHeart } from "@/components/icons";

export const metadata: Metadata = {
  title: "RSVP & Buku Ucapan",
};

export default async function GuestsPage({
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
    .select("id, slug, groom_name, bride_name, akad_date, reception_date")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!invitation) notFound();

  const [{ data: guests }, { data: wishes }] = await Promise.all([
    supabase
      .from("guests")
      .select("id, name, attending, guest_count, created_at")
      .eq("invitation_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wishes")
      .select("id, name, message, is_approved, created_at")
      .eq("invitation_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const guestRows = guests ?? [];
  const wishRows = wishes ?? [];

  const attending = guestRows.filter((g) => g.attending === true).length;
  const notAttending = guestRows.filter((g) => g.attending === false).length;
  const unspecified = guestRows.filter((g) => g.attending == null).length;
  const totalGuests = guestRows.reduce((sum, g) => sum + (g.guest_count || 1), 0);
  const pendingWishes = wishRows.filter((w) => !w.is_approved).length;

  const couple = [invitation.groom_name, invitation.bride_name]
    .filter(Boolean)
    .join(" & ");

  const stats = [
    { label: "Total RSVP", value: guestRows.length, icon: IconMail },
    { label: "Tamu Hadir", value: `${attending}`, icon: IconMail },
    { label: "Total Ucapan", value: wishRows.length, icon: IconHeart },
    { label: "Buku (perlu moderasi)", value: pendingWishes, icon: IconHeart },
  ];

  const AttendingBadge = ({ value }: { value: boolean | null }) => {
    if (value === true)
      return <span className="rounded-full bg-[#dae8d6] px-3 py-1 text-label-sm font-semibold text-[#2f4a2e]">Hadir</span>;
    if (value === false)
      return <span className="rounded-full bg-surface-container px-3 py-1 text-label-sm font-semibold text-onsurface-variant">Tidak Hadir</span>;
    return <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm font-semibold text-rosewood-ink">Belum</span>;
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar active="guests" />

      <main className="w-full flex-1 bg-linen-bg p-6 md:p-8">
        <header className="mb-6 border-b border-outline-variant pb-4">
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-label-sm font-semibold uppercase tracking-widest text-onsurface-variant transition hover:text-rosewood-ink"
          >
            &larr; Kembali
          </Link>
          <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
            RSVP &amp; Buku Ucapan
          </h1>
          <p className="mt-1 text-body-md text-onsurface-variant">
            {couple || "Undangan"} · /{invitation.slug}
          </p>
        </header>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative h-28 overflow-hidden rounded-lg border border-outline-variant bg-surface p-5"
            >
              <p className="text-label-sm uppercase tracking-widest text-onsurface-variant">
                {s.label}
              </p>
              <p className="mt-1 font-serif text-3xl font-medium text-rosewood-ink">
                {s.value}
              </p>
              <s.icon className="absolute -bottom-3 -right-3 h-16 w-16 opacity-10 text-rosewood-ink" />
            </div>
          ))}
        </section>

        {/* RSVP table */}
        <section className="mb-8 overflow-hidden rounded-lg border border-outline-variant bg-surface">
          <div className="border-b border-outline-variant px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-medium text-rosewood-ink">
                  Daftar RSVP
                </h2>
                <p className="mt-1 text-sm text-onsurface-variant">
                  {attending} hadir · {notAttending} tidak hadir · {unspecified}{" "}
                  belum konfirmasi · ~{totalGuests} orang
                </p>
              </div>
              <a
                href={`/api/rsvp/export?invitation_id=${encodeURIComponent(id)}`}
                className="inline-flex items-center gap-2 rounded-md bg-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-widest text-surface transition hover:opacity-90"
              >
                Export CSV
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-md">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm uppercase tracking-widest text-onsurface-variant">
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Orang</th>
                  <th className="px-5 py-3 font-semibold">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {guestRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-onsurface-variant">
                      Belum ada tamu yang RSVP.
                    </td>
                  </tr>
                ) : (
                  guestRows.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-outline-variant/60 transition last:border-0 hover:bg-surface-container-low"
                    >
                      <td className="px-5 py-4 font-medium text-onsurface">{g.name}</td>
                      <td className="px-5 py-4">
                        <AttendingBadge value={g.attending} />
                      </td>
                      <td className="px-5 py-4 text-onsurface-variant">{g.guest_count}</td>
                      <td className="px-5 py-4 text-onsurface-variant">
                        {g.created_at
                          ? new Date(g.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Guestbook */}
        <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
          <div className="border-b border-outline-variant px-5 py-4">
            <h2 className="font-serif text-xl font-medium text-rosewood-ink">
              Buku Ucapan
            </h2>
            <p className="mt-1 text-sm text-onsurface-variant">
              {wishRows.length} ucapan. Hapus ucapan yang tidak pantas.
            </p>
          </div>
          {wishRows.length === 0 ? (
            <p className="px-5 py-12 text-center text-onsurface-variant">
              Belum ada ucapan.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {wishRows.map((w) => (
                <li key={w.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-label-sm font-semibold uppercase tracking-widest text-onsurface">
                      {w.name}
                      {!w.is_approved && (
                        <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs font-semibold text-rosewood-ink">
                          Belum disetujui
                        </span>
                      )}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-body-md text-onsurface-variant">
                      {w.message}
                    </p>
                    <p className="mt-1 text-xs text-onsurface-variant/70">
                      {w.created_at
                        ? new Date(w.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  <DeleteWishButton wishId={w.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
