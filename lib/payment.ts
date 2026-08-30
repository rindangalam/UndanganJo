import type { SupabaseClient } from "@supabase/supabase-js";
import { asArray } from "@/lib/utils";
import {
  getMidtransTransactionStatus,
  isSuccessStatus,
  isFailureStatus,
} from "@/lib/midtrans";

/**
 * Logika settlement bersama yang dipakai BAIK oleh webhook Midtrans maupun
 * lapisan rekonsiliasi (lazy-check / polling) supaya tidak terjadi divergensi.
 * Fungsi ini menerapkan status gateway + auto-publish undangan jika sukses.
 * Fokus pada penerapan; validasi signature/amount dilakukan oleh pemanggil.
 */

export type SettlementDetail = {
  transactionId?: string | null;
  transactionStatus?: string | null;
};

export type SettlementResult = {
  status: string;
  already?: boolean;
  error?: string;
};

export async function settleOrderByGatewayId(
  admin: SupabaseClient,
  gatewayOrderId: string,
  detail: SettlementDetail
): Promise<SettlementResult> {
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, amount, status, invitation_id, invitation:invitations(id, status)"
    )
    .eq("gateway_order_id", gatewayOrderId)
    .maybeSingle();

  if (!order) {
    return { status: "not_found", error: "order not found" };
  }

  const invitation = asArray(order.invitation)[0] ?? null;
  const txId = detail.transactionId ?? null;
  const txStatus = detail.transactionStatus ?? null;

  // 1) Update jejak rekonsiliasi gateway (selalu ditulis, sebagai audit trail).
  await admin
    .from("orders")
    .update({
      gateway_name: "midtrans",
      gateway_transaction_id: txId,
      payment_status_gateway: txStatus ?? null,
    })
    .eq("id", order.id);

  // 2) Idempotency: order sudah lunas -> jangan diproses ulang / downgrade.
  if (order.status === "paid") {
    return { status: "paid", already: true };
  }

  // 3) Status sukses -> tandai lunas & auto-publish undangan (FR-G9).
  if (txStatus && isSuccessStatus(txStatus)) {
    const { error } = await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);
    if (error) {
      return { status: "error", error: error.message };
    }
    if (invitation && invitation.status !== "published") {
      await admin
        .from("invitations")
        .update({ status: "published" })
        .eq("id", invitation.id);
    }
    return { status: "paid" };
  }

  // 4) Status gagal -> tandai failed.
  if (txStatus && isFailureStatus(txStatus)) {
    await admin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return { status: "failed" };
  }

  // 5) Status lain (pending/challenge/authorize) -> biarkan pending.
  return { status: txStatus ?? "pending" };
}

/**
 * Rekonsiliasi satu order pending: tanya status ke Midtrans, validasi nominal,
 * lalu terapkan settlement via logika bersama. Dipakai oleh dashboard (lazy-check)
 * dan route /api/payment/status (polling). Kode server-only.
 */
export async function reconcilePendingOrder(
  admin: SupabaseClient,
  gatewayOrderId: string,
  expectedAmount: number
): Promise<SettlementResult> {
  let txStatus: string | undefined;
  let txId: string | undefined;
  let gross: number | null = null;
  try {
    const res = await getMidtransTransactionStatus(gatewayOrderId);
    txStatus = res.transaction_status;
    txId = res.transaction_id;
    if (res.gross_amount) {
      const n = Number(res.gross_amount.replace(/[^0-9.]/g, ""));
      gross = Number.isFinite(n) ? Math.floor(n) : null;
    }
  } catch (e) {
    return {
      status: "error",
      error: e instanceof Error ? e.message : "Gagal memeriksa status pembayaran.",
    };
  }

  // Anti-tamper: pastikan nominal dari Midtrans sesuai dengan order.
  if (gross !== null && gross !== expectedAmount) {
    return { status: "amount_mismatch", error: "amount mismatch" };
  }

  return settleOrderByGatewayId(admin, gatewayOrderId, {
    transactionId: txId,
    transactionStatus: txStatus,
  });
}
