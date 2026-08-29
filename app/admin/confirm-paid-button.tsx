"use client";

import { useState, useTransition } from "react";
import { confirmOrderPaid } from "@/lib/actions/admin";

export default function ConfirmPaidButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await confirmOrderPaid(orderId);
      if (!result.ok) setError(result.error ?? "Gagal mengonfirmasi.");
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="rounded-lg bg-rosewood-ink px-3 py-1.5 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Tandai Lunas"}
      </button>
      {error && <p className="mt-1 text-xs text-onerror-container">{error}</p>}
    </div>
  );
}
