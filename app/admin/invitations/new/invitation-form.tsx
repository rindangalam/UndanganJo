"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminInvitation } from "@/lib/actions/admin";

type PackageOption = {
  id: string;
  name: string;
  price?: number;
};

export default function NewInvitationForm({
  packages,
}: {
  packages: PackageOption[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createAdminInvitation,
    { ok: false }
  );
  const succeeded = useRef(false);

  useEffect(() => {
    if (state.ok && state.id && !succeeded.current) {
      succeeded.current = true;
      router.push(`/admin/invitations/${state.id}/edit`);
    }
  }, [state, router]);

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-outline-variant bg-surface p-6">
      <h2 className="font-serif text-2xl font-medium text-rosewood-ink">
        Buat Undangan Manual
      </h2>
      <p className="mt-1 text-body-md text-onsurface-variant">
        Buat undangan atas nama customer WhatsApp (tanpa akun). Isi detail
        pasangan melalui builder setelah undangan dibuat.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">
            Nama Customer<span className="text-error">*</span>
          </span>
          <input
            name="customer_name"
            required
            placeholder="cth. Siti Nurhaliza"
            className="rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-onsurface outline-none focus:border-rosewood-ink"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">
            No. WhatsApp Customer
          </span>
          <input
            name="customer_phone"
            type="tel"
            placeholder="cth. 0812xxxxxxx"
            className="rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-onsurface outline-none focus:border-rosewood-ink"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">
            Paket<span className="text-error">*</span>
          </span>
          <select
            name="package_id"
            required
            defaultValue=""
            className="rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-onsurface outline-none focus:border-rosewood-ink"
          >
            <option value="" disabled>
              Pilih paket
            </option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.price != null ? ` — Rp ${p.price.toLocaleString("id-ID")}` : ""}
              </option>
            ))}
          </select>
        </label>

        {state.error && (
          <p className="rounded-lg bg-error-container px-4 py-2.5 text-sm text-onerror-container">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-rosewood-ink px-5 py-2.5 text-label-md font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface disabled:opacity-60"
          >
            {isPending ? "Membuat..." : "Buat & Lanjut Isi Undangan"}
          </button>
          <Link
            href="/admin"
            className="text-center text-sm font-medium text-onsurface-variant hover:text-rosewood-ink"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
