"use client";

import { useActionState, useState } from "react";
import { IconAdd, IconWhatsApp } from "@/components/icons";
import { createManualOrder } from "@/lib/actions/admin";

interface InvitationOption {
  id: string;
  label: string;
}

interface PackageOption {
  id: string;
  name: string;
  price: number;
}

interface ManualOrderFormProps {
  invitations: InvitationOption[];
  packages: PackageOption[];
}

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ManualOrderForm({
  invitations,
  packages,
}: ManualOrderFormProps) {
  const [state, action, pending] = useActionState(createManualOrder, {
    ok: false,
  });
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-2 rounded bg-rosewood-ink px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface"
      >
        <IconAdd className="h-4 w-4" />
        Create Manual Order
      </button>

      {open && (
        <div className="mt-4 rounded-lg border border-outline-variant bg-surface p-6">
          {state.ok ? (
            <div>
              <p className="rounded-lg bg-[#dae8d6] px-3 py-2 text-sm text-[#2f4a2e]">
                Order manual berhasil dibuat. Kirim info rekening ke customer
                lewat WhatsApp untuk konfirmasi pembayaran.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-onsurface transition hover:bg-surface-container"
              >
                Tutup
              </button>
            </div>
          ) : (
            <form action={action} className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-onsurface">
                Undangan
                <select
                  name="invitation_id"
                  required
                  defaultValue=""
                  className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none transition focus:border-rosewood-ink"
                >
                  <option value="" disabled>
                    Pilih undangan
                  </option>
                  {invitations.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-onsurface">
                Paket
                <select
                  name="package_id"
                  defaultValue=""
                  className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none transition focus:border-rosewood-ink"
                >
                  <option value="">Tanpa paket</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} · {formatIDR(pkg.price)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-onsurface md:col-span-2">
                Nominal order (Rp)
                <input
                  name="amount"
                  type="number"
                  min={1}
                  required
                  placeholder="contoh: 250000"
                  className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none transition focus:border-rosewood-ink"
                />
              </label>

              <div className="md:col-span-2">
                {state.error ? (
                  <p className="mb-3 rounded-lg bg-error-container px-3 py-2 text-sm text-onerror-container">
                    {state.error}
                  </p>
                ) : null}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={pending || invitations.length === 0}
                    className="rounded-lg bg-rosewood-ink px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-inverse-surface disabled:opacity-60"
                  >
                    {pending ? "Menyimpan..." : "Buat Order"}
                  </button>
                  <p className="flex items-center gap-1.5 text-xs text-onsurface-variant">
                    <IconWhatsApp className="h-4 w-4" />
                    Konfirmasi pembayaran manual lewat WhatsApp setelah buat.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
