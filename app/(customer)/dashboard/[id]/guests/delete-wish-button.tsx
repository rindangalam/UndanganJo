"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteWishButton({ wishId }: { wishId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus ucapan ini?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("wishes").delete().eq("id", wishId);
    setBusy(false);
    if (error) {
      alert("Gagal menghapus ucapan. Coba lagi.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="rounded-md border border-error/40 px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-error transition hover:bg-error-container disabled:opacity-60"
    >
      {busy ? "..." : "Hapus"}
    </button>
  );
}
