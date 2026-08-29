"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Invitation } from "@/components/builder/types";

export interface FormPhotosTabProps {
  invitation: Invitation;
  maxPhotos: number;
  onAdd: (url: string) => Promise<void>;
  onRemove: (url: string) => Promise<void>;
}

export default function FormPhotosTab({
  invitation,
  maxPhotos,
  onAdd,
  onRemove,
}: FormPhotosTabProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const photos = invitation.gallery_photos ?? [];
  const remaining = Math.max(0, maxPhotos - photos.length);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    if (photos.length + files.length > maxPhotos) {
      setError(`Maksimal ${maxPhotos} foto untuk paket ini.`);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Tidak terautentikasi.");
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" bukan file gambar.`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const clean = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const path = `${user.id}/${invitation.id}/${clean}`;

        const { error: upErr } = await supabase.storage
          .from("gallery-photos")
          .upload(path, file, { upsert: false });

        if (upErr) {
          setError(`Gagal mengunggah "${file.name}": ${upErr.message}`);
          continue;
        }

        const { data: pub } = supabase.storage
          .from("gallery-photos")
          .getPublicUrl(path);
        await onAdd(pub.publicUrl);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-onsurface-variant">
          {photos.length}/{maxPhotos} foto
        </p>
        <label className="cursor-pointer rounded-lg bg-rosewood-ink px-4 py-2 text-sm font-semibold text-surface transition hover:bg-inverse-surface disabled:opacity-60">
          {uploading ? "Mengunggah..." : "Tambah Foto"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || remaining <= 0}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-error-container px-3 py-2 text-sm text-onerror-container">
          {error}
        </p>
      )}

      {photos.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center text-sm text-onsurface-variant">
          Belum ada foto galeri.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                aria-label="Hapus foto"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
