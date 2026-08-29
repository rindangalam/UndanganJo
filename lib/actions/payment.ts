"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createSnapTransaction,
  midtransConfigured,
} from "@/lib/midtrans";

export type CheckoutResult =
  | { ok: true; token: string; redirectUrl: string }
  | { ok: false; error: string };

/**
 * Memulai checkout self-serve untuk sebuah undangan milik user yang login.
 * Membuat (atau memakai ulang) order gateway pending, lalu meminta Snap token.
 */
export async function createCheckout(
  invitationId: string
): Promise<CheckoutResult> {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: "Silakan login terlebih dahulu." };

  if (!midtransConfigured()) {
    return {
      ok: false,
      error: "Payment gateway belum dikonfigurasi di server.",
    };
  }

  const { data: invitation } = await userClient
    .from("invitations")
    .select(
      "id, customer_id, status, package_id, customer_phone, package:packages(id, name, price)"
    )
    .eq("id", invitationId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!invitation || invitation.customer_id !== user.id) {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  const pkg =
    Array.isArray(invitation.package) && invitation.package.length > 0
      ? invitation.package[0]
      : null;
  if (!invitation.package_id || !pkg) {
    return { ok: false, error: "Undangan belum memilih paket." };
  }

  if (invitation.status === "published") {
    return { ok: false, error: "Undangan sudah aktif dan berbayar." };
  }

  const admin = createAdminClient();

  // Pastikan belum ada order lunas untuk undangan ini.
  const { data: paidOrder } = await admin
    .from("orders")
    .select("id")
    .eq("invitation_id", invitationId)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  if (paidOrder) {
    return { ok: false, error: "Undangan ini sudah berbayar." };
  }

  // Ada order gateway pending? Pakai ulang order_id-nya (token Snap baru tetap di-request).
  const { data: pendingOrder } = await admin
    .from("orders")
    .select("id, gateway_order_id")
    .eq("invitation_id", invitationId)
    .eq("payment_method", "gateway")
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  let orderId: string;
  if (pendingOrder?.gateway_order_id) {
    orderId = pendingOrder.gateway_order_id;
  } else {
    if (pendingOrder) {
      await admin.from("orders").delete().eq("id", pendingOrder.id);
    }
    orderId = `UJO-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
    const { error: insertErr } = await admin.from("orders").insert({
      invitation_id: invitationId,
      customer_id: user.id,
      package_id: invitation.package_id,
      amount: pkg.price,
      status: "pending",
      payment_method: "gateway",
      gateway_name: "midtrans",
      gateway_order_id: orderId,
    });
    if (insertErr) {
      return { ok: false, error: `Gagal membuat order: ${insertErr.message}` };
    }
  }

  // Ambil data customer untuk detail transaksi.
  const { data: profile } = await userClient
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name ?? null;
  const [first, ...rest] = (fullName ?? "").split(" ");

  // Perbarui status undangan menjadi menunggu_bayar (opsional penanda checkout dimulai).
  if (invitation.status === "draft") {
    await userClient
      .from("invitations")
      .update({ status: "menunggu_bayar" })
      .eq("id", invitationId);
  }

  try {
    const snap = await createSnapTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: pkg.price,
      },
      item_details: [
        {
          id: invitation.package_id,
          price: pkg.price,
          quantity: 1,
          name: pkg.name,
        },
      ],
      customer_details: {
        first_name: first || fullName || undefined,
        last_name: first ? rest.join(" ") || undefined : undefined,
        email: profile?.email ?? undefined,
        phone: invitation.customer_phone ?? undefined,
      },
      credit_card: { secure: true },
      expiry: { unit: "minutes", duration: 120 },
    });

    return {
      ok: true,
      token: snap.token,
      redirectUrl: snap.redirect_url,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal membuat pembayaran.",
    };
  }
}
