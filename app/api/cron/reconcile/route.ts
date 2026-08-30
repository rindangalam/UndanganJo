import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reconcilePendingOrder } from "@/lib/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Order yang berumur di bawah ini (menit) masih wajar pending, tidak perlu dicek.
const STALE_MINUTES = 15;
// Batas maksimal order yang diproses per run (hindari burst ke API Midtrans).
const MAX_PER_RUN = 50;

/**
 * Endpoint cron rekonsiliasi (server-only). Dipanggil berkala oleh Supabase
 * pg_cron + pg_net sebagai jaring pengaman backend saat webhook Midtrans tak
 * datang dan user belum membuka dashboard. Memproses SEMUA order gateway
 * pending yang sudah lewat batas umur, tanpa filter user.
 *
 * Keamanan: dilindungi header `x-cron-secret` yang dibandingkan dengan
 * `CRON_SECRET` di server. Jangan diekspos ke publik.
 */
export async function POST(request: Request) {
  const CRON_SECRET = process.env.CRON_SECRET ?? "";
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "cron secret not configured" },
      { status: 500 }
    );
  }
  const auth = request.headers.get("x-cron-secret");
  if (auth !== CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

  const { data: orders, error: qErr } = await admin
    .from("orders")
    .select("id, amount, gateway_order_id")
    .eq("payment_method", "gateway")
    .eq("status", "pending")
    .not("gateway_order_id", "is", null)
    .lt("updated_at", cutoff)
    .limit(MAX_PER_RUN);

  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  let processed = 0;
  let paid = 0;
  let failed = 0;
  let error = 0;
  let amountMismatch = 0;

  for (const order of orders ?? []) {
    processed++;
    const result = await reconcilePendingOrder(
      admin,
      order.gateway_order_id,
      order.amount
    );
    if (result.status === "paid") paid++;
    else if (result.status === "failed") failed++;
    else if (result.status === "amount_mismatch") amountMismatch++;
    else if (result.status === "error") error++;
  }

  return NextResponse.json({
    ok: true,
    processed,
    paid,
    failed,
    amountMismatch,
    error,
  });
}
