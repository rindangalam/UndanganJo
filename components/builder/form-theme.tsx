"use client";

import type { Invitation, Package, Theme } from "@/components/builder/types";

export interface FormThemeTabProps {
  invitation: Invitation;
  themes: Theme[];
  pkg: Package | null;
  onSelect: (themeId: string | null) => Promise<void>;
}

export default function FormThemeTab({
  invitation,
  themes,
  pkg,
  onSelect,
}: FormThemeTabProps) {
  const canUsePremium = pkg?.premium_themes ?? false;

  const available = themes.filter(
    (t) => !t.is_premium || canUsePremium
  );

  if (available.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center text-sm text-onsurface-variant">
        Belum ada tema tersedia untuk paket kamu.
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {available.map((theme) => {
          const selected = invitation.theme_id === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={`group rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-rosewood-ink bg-secondary-container"
                  : "border-outline-variant bg-white hover:border-outline"
              }`}
            >
              {theme.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={theme.thumbnail_url}
                  alt={theme.name}
                  className="h-32 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-lg bg-surface-container font-serif text-2xl text-rosewood-ink">
                  {theme.name}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-medium text-onsurface">{theme.name}</span>
                {theme.is_premium && (
                  <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-rosewood-ink">
                    Premium
                  </span>
                )}
              </div>
              {selected && (
                <p className="mt-1 text-xs font-semibold text-rosewood-ink">
                  ✓ Dipilih
                </p>
              )}
            </button>
          );
        })}
      </div>
      {invitation.theme_id && (
        <button
          onClick={() => onSelect(null)}
          className="mt-4 text-sm font-medium text-onsurface-variant hover:underline"
        >
          Hapus pilihan tema
        </button>
      )}
    </div>
  );
}
