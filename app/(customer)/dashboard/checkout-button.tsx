"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCheckout } from "@/lib/actions/payment";
import {
  MIDTRANS_CLIENT_KEY,
  SNAP_SCRIPT_SRC,
} from "@/lib/midtrans-client";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type PollResult = "paid" | "pending" | "error";

/**
 * Polling status pembayaran (D): setelah Snap selesai, tanya route server
 * /api/payment/status yang sekaligus merekonsiliasi order terhadap Midtrans.
 * Mengembalikan "paid" begitu order terdeteksi lunas.
 */
async function pollPaymentStatus(
  invitationId: string,
  attempts = 10,
  intervalMs = 3000
): Promise<PollResult> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(
        `/api/payment/status?invitation_id=${encodeURIComponent(invitationId)}`
      );
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
      };
      if (data.status === "paid") return "paid";
      if (data.status === "failed") return "pending";
      if (data.error) return "pending";
    } catch {
      // Jaringan gagal — coba lagi pada iterasi berikutnya.
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return "pending";
}

function loadSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      `script[src="${SNAP_SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Gagal memuat SDK pembayaran.")));
      return;
    }
    const script = document.createElement("script");
    script.src = SNAP_SCRIPT_SRC;
    script.dataset.clientKey = MIDTRANS_CLIENT_KEY;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Gagal memuat SDK pembayaran. Periksa Client Key."));
    document.head.appendChild(script);
  });
}export default function CheckoutButton({
  invitationId,
  label = "Bayar Sekarang",
  className,
}: {
  invitationId: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    return () => {
      loadingRef.current = false;
    };
  }, []);

  function handleClick() {
    if (loadingRef.current || pending) return;
    loadingRef.current = true;
    setBusy(true);
    setError(null);
    startTransition(async () => {
      const res = await createCheckout(invitationId);
      loadingRef.current = false;
      if (!res.ok) {
        setBusy(false);
        setError(res.error);
        return;
      }
      try {
        await loadSnapScript();
        window.snap?.pay(res.token, {
          onSuccess: async () => {
            // Bayar berhasil ditandai Snap — konfirmasi via polling + rekonsiliasi.
            const result = await pollPaymentStatus(invitationId);
            setBusy(false);
            if (result === "paid") {
              setPaid(true);
            }
            router.refresh();
          },
          onPending: () => {
            void pollPaymentStatus(invitationId).then((result) => {
              setBusy(false);
              if (result === "paid") setPaid(true);
              router.refresh();
            });
          },
          onError: () => {
            setBusy(false);
            setError("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            setBusy(false);
            router.refresh();
          },
        });
      } catch (e) {
        setBusy(false);
        setError(e instanceof Error ? e.message : "Gagal membuka pembayaran.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || busy || paid}
        className={
          className ??
          "rounded bg-rosewood-ink px-5 py-2 text-label-sm font-semibold uppercase tracking-widest text-linen-bg transition hover:bg-inverse-surface disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {paid ? "Sudah Dibayar" : pending || busy ? "Memproses..." : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-[#8a2b1e]">{error}</p>
      )}
    </div>
  );
}
