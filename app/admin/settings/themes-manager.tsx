"use client";

import { useActionState, useState } from "react";
import {
  createTheme,
  updateTheme,
  deleteTheme,
} from "@/lib/actions/admin";

type ThemeRow = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  is_premium: boolean;
  is_active: boolean;
};

const INPUT =
  "rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none focus:border-rosewood-ink";
const CHECK =
  "h-4 w-4 accent-rosewood-ink";

export default function ThemesManager({ themes }: { themes: ThemeRow[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [createState, createAction, createPending] = useActionState(
    createTheme,
    { ok: false }
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateTheme,
    { ok: false }
  );

  async function handleDelete(id: string) {
    if (!confirm("Hapus tema ini?")) return;
    setDeleteError(null);
    const res = await deleteTheme(id);
    if (!res.ok) setDeleteError(res.error ?? "Gagal menghapus.");
  }

  const activeThemes = themes.filter((t) => t.is_active);
  const inactiveThemes = themes.filter((t) => !t.is_active);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-rosewood-ink">Tema</h2>
          <p className="mt-1 text-body-md text-onsurface-variant">
            Kelola daftar tema undangan (FR-G4).
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface"
        >
          {showCreate ? "Batal" : "New Theme"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form action={createAction} className="mt-5 flex flex-col gap-3 rounded-lg border border-outline-variant p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Nama</span>
              <input name="name" required placeholder="cth. Emerald Garden" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Thumbnail URL</span>
              <input name="thumbnail_url" placeholder="https://..." className={INPUT} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-onsurface">
            <input name="is_premium" type="checkbox" className={CHECK} />
            Tema premium
          </label>
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={createPending}
              className="rounded-lg bg-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface disabled:opacity-60"
            >
              {createPending ? "Menyimpan..." : "Simpan Tema"}
            </button>
            {createState.error && (
              <p className="text-sm text-error">{createState.error}</p>
            )}
          </div>
        </form>
      )}

      {/* Edit form */}
      {editingId &&
        (() => {
          const t = themes.find((x) => x.id === editingId);
          if (!t) return null;
          return (
            <form action={updateAction} className="mt-5 flex flex-col gap-3 rounded-lg border border-outline-variant p-4">
              <input type="hidden" name="id" value={t.id} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Nama</span>
                  <input name="name" required defaultValue={t.name} className={INPUT} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-label-sm font-semibold uppercase tracking-wider text-onsurface-variant">Thumbnail URL</span>
                  <input name="thumbnail_url" defaultValue={t.thumbnail_url ?? ""} className={INPUT} />
                </label>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-onsurface">
                <label className="flex items-center gap-2">
                  <input name="is_premium" type="checkbox" defaultChecked={t.is_premium} className={CHECK} />
                  Premium
                </label>
                <label className="flex items-center gap-2">
                  <input name="is_active" type="checkbox" defaultChecked={t.is_active} className={CHECK} />
                  Aktif
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={updatePending}
                  className="rounded-lg bg-rosewood-ink px-4 py-2 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-inverse-surface disabled:opacity-60"
                >
                  {updatePending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm font-medium text-onsurface-variant hover:text-rosewood-ink"
                >
                  Batal
                </button>
                {updateState.error && (
                  <p className="text-sm text-error">{updateState.error}</p>
                )}
              </div>
            </form>
          );
        })()}

      {deleteError && (
        <p className="mt-4 rounded-lg bg-error-container px-4 py-2.5 text-sm text-onerror-container">
          {deleteError}
        </p>
      )}

      {/* List */}
      <div className="mt-5 overflow-hidden rounded-lg border border-outline-variant">
        <table className="w-full text-left text-body-md">
          <thead>
            <tr className="border-b border-outline-variant text-label-sm uppercase tracking-widest text-onsurface-variant">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Tipe</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {themes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-onsurface-variant">
                  Belum ada tema.
                </td>
              </tr>
            ) : (
              [...activeThemes, ...inactiveThemes].map((t) => (
                <tr key={t.id} className="border-b border-outline-variant/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-onsurface">{t.name}</td>
                  <td className="px-4 py-3 text-onsurface-variant">
                    {t.is_premium ? "Premium" : "Standar"}
                  </td>
                  <td className="px-4 py-3 text-xs text-onsurface-variant">
                    {t.is_active ? (
                      <span className="rounded-full bg-[#dae8d6] px-2.5 py-1 font-semibold text-[#2f4a2e]">Aktif</span>
                    ) : (
                      <span className="rounded-full bg-surface-container px-2.5 py-1 font-semibold text-onsurface-variant">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                        className="text-sm font-medium text-rosewood-ink hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
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
        {inactiveThemes.length > 0 && activeThemes.length > 0 && (
          <p className="border-t border-outline-variant px-4 py-2 text-xs text-onsurface-variant">
            Tema nonaktif tidak tampil di builder &amp; publik.
          </p>
        )}
      </div>
    </div>
  );
}