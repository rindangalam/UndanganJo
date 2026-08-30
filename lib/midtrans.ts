import crypto from "crypto";

/**
 * Server-only helper untuk integrasi Midtrans (Snap API + webhook signature).
 * JANGAN import dari komponen client — hanya dipakai di route handler / server action.
 */

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const SNAP_BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY ?? "";

export function midtransConfigured(): boolean {
  return Boolean(SERVER_KEY && CLIENT_KEY);
}

export function midtransIsProduction(): boolean {
  return IS_PRODUCTION;
}

export function getMidtransClientKey(): string | null {
  return CLIENT_KEY || null;
}

function authHeader(): string {
  // Midtrans Basic auth: username = server key, password kosong.
  const token = Buffer.from(`${SERVER_KEY}:`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export type SnapTransactionRequest = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details?: { id: string; price: number; quantity: number; name: string }[];
  customer_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  credit_card?: { secure: boolean };
  enabled_payments?: string[];
  expiry?: { start_time?: string; unit: "minutes" | "hours" | "days"; duration: number };
};

export type SnapTransactionResponse = {
  token: string;
  redirect_url: string;
};

/**
 * Membuat transaksi Snap dan mengembalikan token + redirect URL.
 */
export async function createSnapTransaction(
  request: SnapTransactionRequest
): Promise<SnapTransactionResponse> {
  const res = await fetch(SNAP_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(request),
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(
      `Midtrans Snap ${res.status}: ${JSON.stringify(body) || "unknown error"}`
    );
  }

  return {
    token: String(body.token ?? ""),
    redirect_url: String(body.redirect_url ?? ""),
  };
}

/**
 * Refund/status lainnya bisa ditambah di sini saat dibutuhkan.
 */

/**
 * Midtrans webhook payload (notification). Kolom utama yang kita butuhkan.
 */
export interface MidtransNotification {
  order_id?: string;
  status_code?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_id?: string;
}

/**
 * Memverifikasi signature_key webhook Midtrans:
 *   sha512(order_id + status_code + gross_amount + ServerKey)
 * Rujukan: https://docs.midtrans.com/en/after-payment/http-notification
 */
export function verifyMidtransSignature(
  notification: MidtransNotification,
  serverKey: string = SERVER_KEY
): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notification;
  if (
    !order_id ||
    !status_code ||
    !gross_amount ||
    !signature_key ||
    !serverKey
  ) {
    return false;
  }
  const expected = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");
  return expected === signature_key;
}

/**
 * Status transaksi yang menandakan pembayaran berhasil (auto-publish).
 */
export function isSuccessStatus(transactionStatus?: string): boolean {
  return (
    transactionStatus === "capture" ||
    transactionStatus === "settlement" ||
    transactionStatus === "accept"
  );
}

/**
 * Status transaksi yang menandakan pembayaran gagal / dibatalkan / kedaluwarsa.
 */
export function isFailureStatus(transactionStatus?: string): boolean {
  return (
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire" ||
    transactionStatus === "failure"
  );
}

/**
 * Respon dari endpoint status transaksi Midtrans (GET /v2/{order_id}/status).
 * Dipakai sebagai lapisan rekonsiliasi saat webhook tidak datang (lazy-check).
 */
export interface MidtransStatusResponse {
  order_id?: string;
  status_code?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  gross_amount?: string;
}

const STATUS_API_BASE_URL = IS_PRODUCTION
  ? "https://api.midtrans.com/v2"
  : "https://api.sandbox.midtrans.com/v2";

/**
 * Menanyakan status transaksi ke Midtrans secara langsung (server-side).
 * Dipakai untuk rekonsiliasi order pending saat webhook tidak datang.
 * JANGAN dipanggil dari kode client (memakai server key).
 */
export async function getMidtransTransactionStatus(
  orderId: string
): Promise<MidtransStatusResponse> {
  const res = await fetch(
    `${STATUS_API_BASE_URL}/${encodeURIComponent(orderId)}/status`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader(),
      },
    }
  );
  const body = (await res.json().catch(() => ({}))) as MidtransStatusResponse;
  if (!res.ok) {
    throw new Error(
      `Midtrans status ${res.status}: ${JSON.stringify(body) || "unknown error"}`
    );
  }
  return body;
}
