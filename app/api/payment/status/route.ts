import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reconcilePendingOrder } from "@/lib/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint status pembayaran (server-only) untuk polling setelah Snap.
 * Memverifikasi kepemilikan order oleh user yang login, merekonsiliasi order
 * pending terhadap Midtrans bila ditemukan settlement (webhook tak datang),
 * lalu mengembalikan status terkini.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invitationId = searchParams.get("invitation_id");

  if (!invitationId) {
    return NextResponse.json({ error: "missing invitation_id" }, { status: 400 });
  }

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, amount, status, gateway_order_id, payment_status_gateway")
    .eq("invitation_id", invitationId)
    .eq("customer_id", user.id)
    .eq("payment_method", "gateway")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ status: "none" });
  }

  if (order.status !== "pending" || !order.gateway_order_id) {
    // Sudah settle (paid/failed) — kembalikan status terkini dari DB.
    return NextResponse.json({
      status: order.status,
      payment_status_gateway: order.payment_status_gateway,
    });
  }

  // Masih pending — rekonsiliasi terhadap Midtrans (webhook mungkin tak datang).
  const result = await reconcilePendingOrder(
    admin,
    order.gateway_order_id,
    order.amount
  );

  if (result.status === "error") {
    // Gagal kueri status (mis. jaringan) — laporkan status DB, jangan gagal total.
    return NextResponse.json({
      status: "pending",
      payment_status_gateway: order.payment_status_gateway,
      reconciled: false,
    });
  }

  const finalStatus =
    result.status === "paid" || result.status === "failed"
      ? result.status
      : "pending";

  return NextResponse.json({
    status: finalStatus,
    payment_status_gateway: result.status === "paid" ? "settlement" : order.payment_status_gateway,
  });
}
