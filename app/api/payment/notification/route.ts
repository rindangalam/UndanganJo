import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { asArray } from "@/lib/utils";
import {
  verifyMidtransSignature,
  isSuccessStatus,
  isFailureStatus,
  type MidtransNotification,
} from "@/lib/midtrans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAmount(value?: string): number | null {
  if (!value) return null;
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.floor(n) : null;
}

export async function POST(request: Request) {
  let payload: MidtransNotification;
  try {
    payload = (await request.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // 1) Verifikasi signature — JANGAN percaya payload mentah (AGENTS.md).
  if (!verifyMidtransSignature(payload)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const orderId = payload.order_id;
  const transactionId = payload.transaction_id ?? null;
  const transactionStatus = payload.transaction_status;

  if (!orderId) {
    return NextResponse.json({ error: "missing order_id" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(
      "id, amount, status, invitation_id, invitation:invitations(id, status)"
    )
    .eq("gateway_order_id", orderId)
    .maybeSingle();

  if (!order) {
    // Order tidak dikenal — jangan proses.
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  // 2) Kantongi amount dari notifikasi & bandingkan dengan nominal order (anti-tamper).
  const gross = parseAmount(payload.gross_amount);
  if (gross === null || gross !== order.amount) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  const invitation = asArray(order.invitation)[0] ?? null;

  // 3) Update informasi gateway (selalu, sebagai jejak rekonsiliasi).
  await admin.from("orders").update({
    gateway_name: "midtrans",
    gateway_transaction_id: transactionId,
    payment_status_gateway: transactionStatus ?? null,
  }).eq("id", order.id);

  // 4) Idempotency: order sudah lunas -> jangan diproses ulang / downgrade.
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, already: true });
  }

  if (isSuccessStatus(transactionStatus)) {
    const { error: updErr } = await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    // 5) Auto-publish undangan terkait (FR-G9 berlaku sama untuk jalur gateway).
    if (invitation && invitation.status !== "published") {
      await admin
        .from("invitations")
        .update({ status: "published" })
        .eq("id", invitation.id);
    }
    return NextResponse.json({ ok: true, status: "paid" });
  }

  if (isFailureStatus(transactionStatus)) {
    await admin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return NextResponse.json({ ok: true, status: "failed" });
  }

  // Status lain (pending/challenge/authorize) — biarkan order pending.
  return NextResponse.json({ ok: true, status: transactionStatus ?? "pending" });
}
