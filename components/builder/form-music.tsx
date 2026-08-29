"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Invitation } from "@/components/builder/types";

export interface FormMusicTabProps {
  invitation: Invitation;
  hasMusic: boolean;
  onSet: (url: string | null) => Promise<void>;
}

const MAX_MB = 10;

export default function FormMusicTab({
  invitation,
  hasMusic,
  onSet,
}: FormMusicTabProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!hasMusic) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center text-sm text-onsurface-variant">
        Paket kamu tidak mendukung musik latar. Upgrade paket untuk
        menambahkannya.
      </div>
    );
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("audio/")) {
      setError("File harus berupa audio.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran maksimal ${MAX_MB} MB.`);
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
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const clean = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${user.id}/${invitation.id}/music_${clean}`;

      const { error: upErr } = await supabase.storage
        .from("music")
        .upload(path, file, { upsert: false });

      if (upErr) {
        setError(`Gagal mengunggah: ${upErr.message}`);
        return;
      }

      const { data: pub } = supabase.storage.from("music").getPublicUrl(path);
      await onSet(pub.publicUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg bg-error-container px-3 py-2 text-sm text-onerror-container">
          {error}
        </p>
      )}

      {invitation.music_url ? (
        <div className="rounded-2xl border border-outline-variant bg-white p-5">
          <p className="text-sm font-medium text-onsurface">Musik saat ini</p>
          <audio
            controls
            src={invitation.music_url}
            className="mt-3 w-full"
            preload="none"
          />
          <div className="mt-3 flex gap-3">
            <label className="cursor-pointer rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-medium text-onsurface transition hover:bg-surface-low">
              Ganti
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                disabled={uploading}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <button
              onClick={() => onSet(null)}
              disabled={uploading}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-error hover:bg-error-container"
            >
              Hapus musik
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
          <p className="text-sm text-onsurface-variant">
            Unggah musik latar (maks. {MAX_MB} MB).
          </p>
          <label className="mt-4 inline-block cursor-pointer rounded-lg bg-rosewood-ink px-4 py-2 text-sm font-semibold text-surface transition hover:bg-inverse-surface disabled:opacity-60">
            {uploading ? "Mengunggah..." : "Pilih musik"}
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              disabled={uploading}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
