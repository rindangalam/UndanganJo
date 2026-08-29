"use client";

import { useState } from "react";
import Link from "next/link";
import type { Invitation, Package, Theme } from "@/components/builder/types";
import {
  saveInvitationData,
  setTheme,
  addPhoto,
  removePhoto,
  setMusic,
} from "@/lib/actions/invitation";
import FormDataTab from "@/components/builder/form-data";
import FormThemeTab from "@/components/builder/form-theme";
import FormPhotosTab from "@/components/builder/form-photos";
import FormMusicTab from "@/components/builder/form-music";
import { IconHeart, IconMusic, IconEdit } from "@/components/icons";

type Step = "pasangan" | "acara" | "galeri" | "cerita" | "pengaturan";

const STEPS: { id: Step; label: string }[] = [
  { id: "pasangan", label: "Pasangan" },
  { id: "acara", label: "Acara" },
  { id: "galeri", label: "Galeri" },
  { id: "cerita", label: "Cerita" },
  { id: "pengaturan", label: "Pengaturan" },
];

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function InvitationEditor({
  invitation: initial,
  pkg,
  themes,
  backHref = "/dashboard",
  backLabel = "Kembali ke Dashboard",
}: {
  invitation: Invitation;
  pkg: Package | null;
  themes: Theme[];
  backHref?: string;
  backLabel?: string;
}) {
  const [invitation, setInvitation] = useState(initial);
  const [step, setStep] = useState<Step>("pasangan");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  function flash(kind: "success" | "error", message: string) {
    setNotice({ kind, message });
    setTimeout(() => setNotice(null), 4000);
  }

  async function handleSaveData(
    data: Parameters<typeof saveInvitationData>[1]
  ) {
    setSaving(true);
    try {
      const res = await saveInvitationData(invitation.id, data);
      if (res.ok) {
        setInvitation((prev) => ({ ...prev, ...structuredClone(data) }));
        flash("success", "Data tersimpan.");
      } else {
        flash("error", res.error ?? "Gagal menyimpan.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectTheme(themeId: string | null) {
    const res = await setTheme(invitation.id, themeId);
    if (res.ok) {
      setInvitation((prev) => ({ ...prev, theme_id: themeId }));
      flash("success", "Tema dipilih.");
    } else {
      flash("error", res.error ?? "Gagal memilih tema.");
    }
  }

  async function handleAddPhoto(url: string) {
    const res = await addPhoto(invitation.id, url);
    if (res.ok) {
      setInvitation((prev) => ({
        ...prev,
        gallery_photos: [...(prev.gallery_photos ?? []), url],
      }));
      flash("success", "Foto ditambahkan.");
    } else {
      flash("error", res.error ?? "Gagal menambahkan foto.");
    }
  }

  async function handleRemovePhoto(url: string) {
    const res = await removePhoto(invitation.id, url);
    if (res.ok) {
      setInvitation((prev) => ({
        ...prev,
        gallery_photos: (prev.gallery_photos ?? []).filter((p) => p !== url),
      }));
      flash("success", "Foto dihapus.");
    } else {
      flash("error", res.error ?? "Gagal menghapus foto.");
    }
  }

  async function handleSetMusic(url: string | null) {
    const res = await setMusic(invitation.id, url);
    if (res.ok) {
      setInvitation((prev) => ({ ...prev, music_url: url }));
      flash("success", url ? "Musik disimpan." : "Musik dihapus.");
    } else {
      flash("error", res.error ?? "Gagal menyimpan musik.");
    }
  }

  const couple = [invitation.groom_name, invitation.bride_name]
    .filter(Boolean)
    .join(" & ");
  const akadDate = formatDate(invitation.akad_date);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-champagne-surface bg-linen-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <Link
            href={backHref}
            className="font-serif text-2xl font-medium text-rosewood-ink"
          >
            UndanganJo
          </Link>
          <nav className="hidden items-center gap-6 text-label-md uppercase tracking-wider md:flex">
            <Link href="/#themes" className="text-rosewood-ink/70">
              Themes
            </Link>
            <Link href="/#features" className="text-rosewood-ink/70">
              Features
            </Link>
            <Link href="/pricing" className="text-rosewood-ink/70">
              Pricing
            </Link>
            <Link href="#" className="border-b border-rosewood-ink pb-1 text-rosewood-ink">
              Studio
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-onsurface-variant sm:block">
              {saving ? "Menyimpan..." : "Tersimpan"}
            </span>
            <Link
              href={backHref}
              className="rounded-lg bg-rosewood-ink px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-rosewood-ink/90"
            >
              Selesai
            </Link>
          </div>
        </div>
      </header>

      {notice && (
        <div
          className={`mx-auto mt-4 w-full max-w-[1600px] rounded-lg px-4 py-2.5 text-sm ${
            notice.kind === "success"
              ? "bg-[#dae8d6] text-[#2f4a2e]"
              : "bg-error-container text-onerror-container"
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* 3-column layout */}
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[220px_1fr_360px]">
        {/* Stepper */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-4 font-serif text-2xl font-medium text-rosewood-ink">
            Builder
          </h2>
          <ol className="flex flex-col gap-1">
            {STEPS.map((s, idx) => {
              const activeStep = s.id === step;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setStep(s.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                      activeStep
                        ? "bg-rosewood-ink text-linen-bg"
                        : "text-onsurface-variant hover:bg-surface-variant"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        activeStep
                          ? "bg-linen-bg/20 text-linen-bg"
                          : "bg-surface-container text-onsurface-variant"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-body-md">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <Link
            href={backHref}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-onsurface-variant hover:text-rosewood-ink"
          >
            <span>←</span> {backLabel}
          </Link>
        </aside>

        {/* Form pane */}
        <div className="min-w-0 rounded-xl border border-outline-variant bg-white p-6">
          {step === "pasangan" && (
            <FormDataTab invitation={invitation} onSave={handleSaveData} mode="pasangan" />
          )}
          {step === "acara" && (
            <FormDataTab invitation={invitation} onSave={handleSaveData} mode="acara" />
          )}
          {step === "galeri" && (
            <FormPhotosTab
              invitation={invitation}
              maxPhotos={pkg?.max_photos ?? 0}
              onAdd={handleAddPhoto}
              onRemove={handleRemovePhoto}
            />
          )}
          {step === "cerita" && (
            <FormDataTab invitation={invitation} onSave={handleSaveData} mode="cerita" />
          )}
          {step === "pengaturan" && (
            <div className="flex flex-col gap-8">
              <FormThemeTab
                invitation={invitation}
                themes={themes}
                pkg={pkg}
                onSelect={handleSelectTheme}
              />
              <FormMusicTab
                invitation={invitation}
                hasMusic={pkg?.has_music ?? false}
                onSet={handleSetMusic}
              />
            </div>
          )}
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 text-center text-label-sm font-semibold uppercase tracking-widest text-onsurface-variant">
            Live Preview
          </p>
          <div className="mx-auto flex h-[640px] w-[300px] flex-col overflow-hidden rounded-[36px] border-8 border-rosewood-ink bg-cover bg-center shadow-[0_20px_40px_rgba(25,24,23,0.2)]">
            <div
              className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-rosewood-ink p-6 text-center"
              style={{
                backgroundImage:
                  (invitation.gallery_photos ?? []).length > 0
                    ? `url(${invitation.gallery_photos![0]})`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rosewood-ink/70 via-transparent to-rosewood-ink/90" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <span className="text-[11px] uppercase tracking-[0.3em] text-linen-bg/80">
                  The Wedding Of
                </span>
                <h3 className="font-serif text-3xl font-medium leading-tight text-linen-bg">
                  {couple || "Nama & Pasangan"}
                </h3>
                {akadDate && (
                  <p className="text-[11px] uppercase tracking-widest text-linen-bg/90">
                    {akadDate}
                  </p>
                )}
                <div className="my-1 h-px w-10 bg-champagne-surface" />
              </div>
            </div>
            <div className="flex items-center justify-around border-t border-outline-variant bg-linen-bg px-6 py-3">
              <span className="flex flex-col items-center text-rosewood-ink">
                <IconHeart className="h-5 w-5" />
                <span className="mt-1 text-label-sm font-semibold">RSVP</span>
              </span>
              <span className="flex flex-col items-center text-onsurface-variant">
                <IconMusic className="h-5 w-5" />
                <span className="mt-1 text-label-sm font-semibold">
                  {invitation.music_url ? "Music" : ""}
                </span>
              </span>
            </div>
          </div>
          <Link
            href="#"
            className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-rosewood-ink px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-rosewood-ink transition hover:bg-champagne-surface"
          >
            <IconEdit className="h-4 w-4" />
            Preview Lengkap
          </Link>
        </aside>
      </div>
    </div>
  );
}
