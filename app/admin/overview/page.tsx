import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "../admin-sidebar";
import {
  IconInvitations,
  IconWallet,
  IconTrophy,
  IconDashboard,
  IconGroup,
  IconPerson,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Overview",
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

type IconType = typeof IconDashboard;

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: IconType;
}) {
  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-outline-variant bg-surface p-6">
      <p className="text-label-sm uppercase tracking-widest text-onsurface-variant">
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl font-medium text-rosewood-ink">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-onsurface-variant/80">{sub}</p>}
      <Icon className="absolute -bottom-3 -right-3 h-20 w-20 opacity-10 text-rosewood-ink" />
    </div>
  );
}

export default async function AdminOverviewPage() {
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

  const [{ count: invitationCount }, { data: orders }] = await Promise.all([
    supabase
      .from("invitations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("amount, status, payment_method"),
  ]);

  const rows = orders ?? [];

  const revenue = rows
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amount, 0);

  const statusOrder = ["pending", "paid", "failed"] as const;
  const statusCounts = Object.fromEntries(
    statusOrder.map((s) => [s, rows.filter((o) => o.status === s).length])
  );

  const selfServe = rows.filter((o) => o.payment_method === "gateway").length;
  const adminAssisted = rows.filter((o) => o.payment_method === "manual").length;
  const selfServeHalf = selfServe + adminAssisted === 0 ? 0 : selfServe / (selfServe + adminAssisted);

  const mainStats = [
    {
      label: "Total Undangan",
      value: (invitationCount ?? 0).toLocaleString("id-ID"),
      sub: "Semua undangan lintas customer",
      icon: IconInvitations,
    },
    {
      label: "Total Pendapatan",
      value: formatIDR(revenue),
      sub: `${statusCounts.paid} order lunas`,
      icon: IconWallet,
    },
    {
      label: "Total Order",
      value: rows.length.toLocaleString("id-ID"),
      sub: `${selfServe} self-serve · ${adminAssisted} admin-assisted`,
      icon: IconTrophy,
    },
  ];

  const statusCards = [
    {
      label: "Pending",
      value: String(statusCounts.pending),
      sub: "Menunggu pembayaran",
      icon: IconGroup,
    },
    {
      label: "Paid",
      value: String(statusCounts.paid),
      sub: "Pembayaran lunas",
      icon: IconPerson,
    },
    {
      label: "Failed",
      value: String(statusCounts.failed),
      sub: "Pembayaran gagal",
      icon: IconDashboard,
    },
  ];

  return (
    <div className="flex min-h-screen bg-linen-bg">
      <AdminSidebar active="overview" />

      <main className="w-full flex-1 p-6 md:p-8">
        <header className="mb-6 border-b border-outline-variant pb-4">
          <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
            Overview
          </h1>
          <p className="mt-1 text-body-md text-onsurface-variant">
            Ringkasan statistik platform (FR-G6).
          </p>
        </header>

        {/* Metrik utama */}
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {mainStats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              sub={s.sub}
              icon={s.icon}
            />
          ))}
        </section>

        {/* Order per status */}
        <section className="mb-8">
          <h2 className="mb-3 font-serif text-xl font-medium text-rosewood-ink">
            Order per Status
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {statusCards.map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                sub={s.sub}
                icon={s.icon}
              />
            ))}
          </div>
        </section>

        {/* Perbandingan self-serve vs admin-assisted */}
        <section className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="font-serif text-xl font-medium text-rosewood-ink">
            Sumber Order: Self-Serve vs Admin-Assisted
          </h2>
          <p className="mt-1 text-body-md text-onsurface-variant">
            {selfServe + adminAssisted === 0
              ? "Belum ada order. Perbandingan tampil setelah ada order."
              : `${selfServe} self-serve (${Math.round(selfServeHalf * 100)}%) · ${adminAssisted} admin-assisted (${Math.round((1 - selfServeHalf) * 100)}%)`}
          </p>
          <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full bg-rosewood-ink"
              style={{ width: `${selfServeHalf * 100}%` }}
            />
            <div className="h-full flex-1 bg-onsurface-variant/40" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-onsurface-variant">
            <span>Self-Serve ({selfServe})</span>
            <span>Admin-Assisted ({adminAssisted})</span>
          </div>
        </section>
      </main>
    </div>
  );
}
