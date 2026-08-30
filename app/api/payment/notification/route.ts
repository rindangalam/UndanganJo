import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { settleOrderByGatewayId } from "@/lib/payment";
import {
  verifyMidtransSignature,
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

  if (!orderId) {
    return NextResponse.json({ error: "missing order_id" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 2) Ambil order & bandingkan nominal (anti-tamper) SEBELUM menerapkan settlement.
  const { data: order } = await admin
    .from("orders")
    .select("amount")
    .eq("gateway_order_id", orderId)
    .maybeSingle();

  if (!order) {
    // Order tidak dikenal — jangan proses.
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const gross = parseAmount(payload.gross_amount);
  if (gross === null || gross !== order.amount) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  // 3) Terapkan settlement via logika bersama (idempotent + auto-publish).
  const result = await settleOrderByGatewayId(admin, orderId, {
    transactionId: payload.transaction_id,
    transactionStatus: payload.transaction_status,
  });

  if (result.status === "not_found") {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }
  if (result.status === "error") {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  if (result.already) {
    return NextResponse.json({ ok: true, already: true, status: "paid" });
  }
  return NextResponse.json({ ok: true, status: result.status });
}
