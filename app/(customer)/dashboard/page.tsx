import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reconcilePendingOrder } from "@/lib/payment";
import { asArray } from "@/lib/utils";
import DashboardSidebar from "@/components/dashboard-sidebar";
import CheckoutButton from "./checkout-button";
import {
  IconMail,
  IconHeart,
  IconSparkle,
  IconAdd,
  IconEdit,
} from "@/components/icons";

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-linen-bg/90 text-secondary border border-outline-variant",
  },
  menunggu_bayar: {
    label: "Menunggu Bayar",
    className: "bg-secondary-container text-rosewood-ink",
  },
  published: {
    label: "Published",
    className: "bg-[#dae8d6] text-[#2f4a2e]",
  },
};

// Order yang berumur di bawah ini (menit) masih dianggap dalam window wajar bayar,
// tidak perlu dicek ke Midtrans pada setiap load dashboard (hindari spam status API).
const STALE_MINUTES = 15;

/**
 * Rekonsiliasi order gateway pending milik user yang sudah lewat batas umur.
 * Menanyakan status ke Midtrans dan menerapkan settlement bila sukses.
 * Dilakukan saat dashboard di-load sebagai lapisan cadangan webhook (B).
 */
async function reconcileStaleGatewayOrders(customerId: string) {
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

  const { data: orders } = await admin
    .from("orders")
    .select("id, amount, gateway_order_id")
    .eq("customer_id", customerId)
    .eq("payment_method", "gateway")
    .eq("status", "pending")
    .not("gateway_order_id", "is", null)
    .lt("updated_at", cutoff);

  for (const order of orders ?? []) {
    await reconcilePendingOrder(admin, order.gateway_order_id, order.amount);
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: invitations } = await supabase
    .from("invitations")
    .select(
      "id, slug, groom_name, bride_name, status, created_at, theme_id, package_id, package:packages(id, name, price)"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Lapisan rekonsiliasi (B): reconcile order gateway pending yang sudah lewat
  // window wajar (>15 menit) terhadap Midtrans. Menyelesaikan kasus webhook
  // tidak datang, tanpa bergantung tindakan user.
  await reconcileStaleGatewayOrders(user.id);

  const ids = (invitations ?? []).map((i) => i.id);

  const [{ data: guests }, { data: wishes }] = await Promise.all([
    ids.length
      ? supabase.from("guests").select("id").in("invitation_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("wishes").select("id").in("invitation_id", ids)
      : Promise.resolve({ data: [] }),
  ]);

  const activeProjects = invitations?.length ?? 0;
  const totalRsvp = guests?.length ?? 0;
  const totalWishes = wishes?.length ?? 0;

  const stats = [
    {
      label: "Total RSVP",
      value: totalRsvp,
      icon: IconMail,
      highlight: false,
    },
    {
      label: "Wishes Received",
      value: totalWishes,
      icon: IconHeart,
      highlight: false,
    },
    {
      label: "Active Projects",
      value: activeProjects,
      icon: IconSparkle,
      highlight: true,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar active="dashboard" />
      <main className="w-full flex-1 bg-linen-bg p-6 md:p-8">
        <header className="mb-6 flex items-end justify-between border-b border-outline-variant pb-4">
          <div>
            <p className="mb-1 text-label-sm uppercase tracking-widest text-onsurface-variant">
              Welcome Back
            </p>
            <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
              Workspace Overview
            </h1>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`relative h-32 overflow-hidden rounded-lg p-6 ${
                s.highlight
                  ? "bg-rosewood-ink text-linen-bg"
                  : "border border-outline-variant bg-linen-bg"
              }`}
            >
              <p
                className={`mb-2 text-label-sm uppercase tracking-widest ${
                  s.highlight ? "text-secondary-container" : "text-onsurface-variant"
                }`}
              >
                {s.label}
              </p>
              <p className="font-serif text-3xl font-medium">{s.value}</p>
              <s.icon className="absolute -bottom-4 -right-4 h-24 w-24 opacity-30" />
            </div>
          ))}
        </section>

        {/* Invitations */}
        <section>
          <h2 className="mb-6 font-serif text-2xl font-medium text-rosewood-ink">
            Undangan Aktif
          </h2>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {(invitations ?? []).map((inv) => {
              const meta = STATUS_META[inv.status] ?? {
                label: inv.status,
                className: "bg-linen-bg/90 text-secondary border border-outline-variant",
              };
              const title =
                inv.groom_name && inv.bride_name
                  ? `${inv.groom_name} & ${inv.bride_name}`
                  : "Undangan tanpa nama";
              const initials = title
                .split("&")
                .map((n) => n.trim().charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const createdDate = inv.created_at
                ? new Date(inv.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={inv.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low transition hover:shadow-sm"
                >
                  <div className="relative flex h-40 flex-col items-center justify-center bg-champagne-surface/60">
                    <span className="font-serif text-4xl text-rosewood-ink">
                      {initials || "U"}
                    </span>
                    <span className="absolute left-4 top-4 rounded px-3 py-1 text-label-sm uppercase text-primary">
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-2xl font-medium text-rosewood-ink">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-onsurface-variant">
                      /{inv.slug}
                      {createdDate ? ` · ${createdDate}` : ""}
                    </p>

                    {inv.status !== "published" && (() => {
                      const pkg = asArray(inv.package)[0];
                      return (
                      <div className="mt-4 border-t border-outline-variant pt-4">
                        {pkg ? (
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-label-sm uppercase tracking-widest text-onsurface-variant">
                                {pkg.name}
                              </p>
                              <p className="font-serif text-xl font-medium text-rosewood-ink">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  maximumFractionDigits: 0,
                                }).format(pkg.price)}
                              </p>
                            </div>
                            <CheckoutButton invitationId={inv.id} />
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/${inv.id}/edit`}
                            className="inline-block rounded border border-outline-variant px-4 py-2 text-label-sm font-semibold uppercase tracking-widest text-primary transition hover:bg-surface-variant"
                          >
                            Pilih Paket &amp; Bayar
                          </Link>
                        )}
                      </div>
                      );
                    })()}

                    <div
                      className={`mt-auto flex items-center justify-end ${
                        inv.status !== "published" ? "pt-3" : "border-t border-outline-variant pt-4"
                      }`}
                    >
                      <Link
                        href={`/dashboard/${inv.id}/edit`}
                        className="rounded-full p-2 text-onsurface-variant transition hover:bg-surface-variant hover:text-rosewood-ink"
                        aria-label="Edit undangan"
                      >
                        <IconEdit className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create new project card */}
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant bg-linen-bg">
                <IconAdd className="h-8 w-8 text-onsurface-variant" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-medium text-rosewood-ink">
                Create New Project
              </h3>
              <p className="mb-6 max-w-[200px] text-sm text-onsurface-variant">
                Start crafting a new beautiful invitation experience.
              </p>
              <Link
                href="/dashboard/new"
                className="rounded bg-rosewood-ink px-6 py-2 text-label-sm font-semibold uppercase tracking-widest text-linen-bg transition hover:bg-inverse-surface"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
