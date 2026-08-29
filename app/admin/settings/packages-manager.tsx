"use client";

import { useActionState, useState } from "react";
import {
  createPackage,
  updatePackage,
  deletePackage,
} from "@/lib/actions/admin";

type PackageRow = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  max_photos: number;
  has_music: boolean;
  has_video: boolean;
  premium_themes: boolean;
  is_active: boolean;
};

const INPUT =
  "rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none focus:border-rosewood-ink";
const CHECK = "h-4 w-4 accent-rosewood-ink";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function PkgForm({
  editing,
  action,
  pending,
  error,
  onCancel,
}: {
  editing: PackageRow | null;
  action: (formData: FormData) => void | Promise<void>;
  pending: boolean;
  error?: string;
  onCancel?: () => void;
}) {
  return (
    <form
      action={action}
      className="mt-5 flex flex-col gap-3 rounded-lg border border-outline-variant p-4"
    >
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Nama</span>
          <input name="name" required defaultValue={editing?.name} placeholder="cth. Premium" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Harga (Rp)</span>
          <input name="price" type="number" min="0" required defaultValue={editing?.price} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Maks. Foto</span>
          <input name="max_photos" type="number" min="0" required defaultValue={editing?.max_photos} className={INPUT} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Deskripsi</span>
        <input name="description" defaultValue={editing?.description ?? ""} placeholder="Deskripsi singkat paket" className={INPUT} />
      </label>
      <div className="flex flex-wrap gap-5 text-sm text-onsurface">
        <label className="flex items-center gap-2">
          <input name="has_music" type="checkbox" defaultChecked={editing?.has_music} className={CHECK} />
          Musik
        </label>
        <label className="flex items-center gap-2">
          <input name="has_video" type="checkbox" defaultChecked={editing?.has_video} className={CHECK} />
          Video
        </label>
        <label className="flex items-center gap-2">
          <input name="premium_themes" type="checkbox" defaultChecked={editing?.premium_themes} className={CHECK} />
          Akses tema premium
        </label>
        <label className="flex items-center gap-2">
          <input name="is_active" type="checkbox" defaultChecked={editing?.is_active ?? true} className={CHECK} />
          Aktif
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-onsurface-variant hover:text-rosewood-ink"
          >
            Batal
          </button>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </form>
  );
}

export default function PackagesManager({
  packages,
}: {
  packages: PackageRow[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [createState, createAction, createPending] = useActionState(
    createPackage,
    { ok: false }
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updatePackage,
    { ok: false }
  );

  async function handleDelete(id: string) {
    if (!confirm("Hapus paket ini?")) return;
    setDeleteError(null);
    const res = await deletePackage(id);
    if (!res.ok) setDeleteError(res.error ?? "Gagal menghapus.");
  }

  const active = packages.filter((p) => p.is_active);
  const inactive = packages.filter((p) => !p.is_active);

  const editingPkg = editingId
    ? packages.find((x) => x.id === editingId) ?? null
    : null;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-rosewood-ink">Paket</h2>
          <p className="mt-1 text-body-md text-onsurface-variant">
            Kelola daftar paket &amp; harga (FR-G5).
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate((v) => !v);
            setEditingId(null);
          }}
          className="rounded-lg bg-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface"
        >
          {showCreate ? "Batal" : "New Package"}
        </button>
      </div>

      {showCreate && !editingPkg && (
        <PkgForm
          editing={null}
          action={createAction}
          pending={createPending}
          error={createState.error}
        />
      )}
      {editingPkg && (
        <PkgForm
          editing={editingPkg}
          action={updateAction}
          pending={updatePending}
          error={updateState.error}
          onCancel={() => setEditingId(null)}
        />
      )}

      {deleteError && (
        <p className="mt-4 rounded-lg bg-error-container px-4 py-2.5 text-sm text-onerror-container">
          {deleteError}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-lg border border-outline-variant">
        <table className="w-full text-left text-body-md">
          <thead>
            <tr className="border-b border-outline-variant text-label-sm uppercase tracking-widest text-onsurface-variant">
              <th className="px-4 py-3 font-semibold">Paket</th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">Fitur</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-onsurface-variant">
                  Belum ada paket.
                </td>
              </tr>
            ) : (
              [...active, ...inactive].map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium text-onsurface">{p.name}</span>
                    {p.description && (
                      <span className="block max-w-[260px] truncate text-xs text-onsurface-variant">
                        {p.description}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-onsurface">{formatIDR(p.price)}</td>
                  <td className="px-4 py-3 text-xs text-onsurface-variant">
                    {[p.max_photos && `${p.max_photos} foto`, p.has_music && "musik", p.has_video && "video", p.premium_themes && "tema premium"]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="rounded-full bg-[#dae8d6] px-2.5 py-1 text-xs font-semibold text-[#2f4a2e]">Aktif</span>
                    ) : (
                      <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold text-onsurface-variant">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                        className="text-sm font-medium text-rosewood-ink hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-sm font-medium text-error hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {inactive.length > 0 && active.length > 0 && (
          <p className="border-t border-outline-variant px-4 py-2 text-xs text-onsurface-variant">
            Paket nonaktif tidak tampil di pricing &amp; builder.
          </p>
        )}
      </div>
    </div>
  );
}