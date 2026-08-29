import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./admin-sidebar";
import ManualOrderForm from "./manual-order-form";
import OrderTable, { type TableOrder } from "./order-table";
import {
  IconTrophy,
  IconWallet,
  IconPerson as IconPersonStat,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Order Management",
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function first<T>(v: T[] | T | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function AdminPage() {
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

  const [{ data: invitations }, { data: packages }] = await Promise.all([
    supabase
      .from("invitations")
      .select("id, slug, groom_name, bride_name, customer_name")
      .order("created_at", { ascending: false }),
    supabase
      .from("packages")
      .select("id, name, price")
      .eq("is_active", true)
      .order("price", { ascending: true }),
  ]);

  const invitationOptions = (invitations ?? []).map((inv) => {
    const couple =
      inv.groom_name && inv.bride_name
        ? `${inv.groom_name} & ${inv.bride_name}`
        : null;
    return {
      id: inv.id,
      label: couple ?? inv.customer_name ?? inv.slug,
    };
  });

  const packageOptions = (packages ?? []).map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
  }));

  const { data: rawOrders } = await supabase
    .from("orders")
    .select(
      "id, amount, status, payment_method, created_at, package:packages(name), invitation:invitations(groom_name, bride_name, customer_name), customer:profiles(full_name)"
    )
    .order("created_at", { ascending: false });

  const tableOrders: TableOrder[] = (rawOrders ?? []).map((o) => {
    const pkg = first(o.package);
    const invitation = first(o.invitation);
    const customer = first(o.customer);
    const couple =
      invitation?.groom_name && invitation?.bride_name
        ? `${invitation.groom_name} & ${invitation.bride_name}`
        : null;
    return {
      id: o.id,
      customerLabel:
        customer?.full_name ?? invitation?.customer_name ?? couple ?? "Guest",
      pkg: pkg?.name ?? "—",
      source: o.payment_method === "manual" ? "Manual" : "Self-Serve",
      amount: o.amount,
      status: o.status,
      statusLabel:
        o.status === "pending" && o.payment_method === "manual"
          ? "Pending Manual"
          : o.status === "pending"
          ? "Pending"
          : o.status === "paid"
          ? "Paid"
          : "Failed",
      payment_method: o.payment_method,
    };
  });

  const paidOrders = tableOrders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingManual = tableOrders.filter(
    (o) => o.status === "pending" && o.payment_method === "manual"
  ).length;
  const selfServe = tableOrders.filter(
    (o) => o.payment_method === "gateway"
  ).length;
  const adminAssisted = tableOrders.filter(
    (o) => o.payment_method === "manual"
  ).length;

  const stats = [
    {
      label: "Total Orders",
      value: tableOrders.length.toLocaleString("id-ID"),
      change: `${selfServe} self-serve · ${adminAssisted} admin`,
      icon: IconTrophy,
    },
    {
      label: "Revenue",
      value: formatIDR(revenue),
      change: `${paidOrders.length} order lunas`,
      icon: IconWallet,
    },
    {
      label: "Pending Manual",
      value: String(pendingManual),
      change: "Perlu konfirmasi WhatsApp",
      icon: IconPersonStat,
    },
  ];

  return (
    <div className="flex min-h-screen bg-linen-bg">
      <AdminSidebar active="orders" />

      {/* Content */}
      <main className="w-full flex-1 p-6 md:p-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-rosewood-ink">
              Order Management
            </h1>
            <p className="mt-1 text-body-md text-onsurface-variant">
              Track, manage, and process customer orders.
            </p>
          </div>
          <ManualOrderForm
            invitations={invitationOptions}
            packages={packageOptions}
          />
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative h-32 overflow-hidden rounded-lg border border-outline-variant bg-surface p-6"
            >
              <p className="text-label-sm uppercase tracking-widest text-onsurface-variant">
                {s.label}
              </p>
              <p className="mt-1 font-serif text-3xl font-medium text-rosewood-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-onsurface-variant/80">{s.change}</p>
              <s.icon className="absolute -bottom-3 -right-3 h-20 w-20 opacity-10 text-rosewood-ink" />
            </div>
          ))}
        </section>

        {/* Table */}
        <OrderTable orders={tableOrders} />
      </main>
    </div>
  );
}
