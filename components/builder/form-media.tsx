"use client";

import { useState } from "react";
import type { Invitation } from "@/components/builder/types";

export interface FormMediaTabProps {
  invitation: Invitation;
  hasVideo: boolean;
  onSave: (data: { livestream_url?: string | null; video_url?: string | null }) => Promise<void>;
}

function inputCls(className = "") {
  return `rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none transition focus:border-rosewood-ink ${className}`;
}

export default function FormMediaTab({
  invitation,
  hasVideo,
  onSave,
}: FormMediaTabProps) {
  const [livestream, setLivestream] = useState(invitation.livestream_url ?? "");
  const [video, setVideo] = useState(invitation.video_url ?? "");
  const [saving, setSaving] = useState(false);

  if (!hasVideo) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center text-sm text-onsurface-variant">
        Paket kamu tidak mendukung galeri video &amp; live streaming. Upgrade ke
        paket Premium untuk mengaktifkannya.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ livestream_url: livestream, video_url: video });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-rosewood-ink">
          Video &amp; Live Streaming
        </h2>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
          Link Live Streaming (opsional)
          <input
            type="url"
            value={livestream}
            onChange={(e) => setLivestream(e.target.value)}
            placeholder="https://youtube.com/live/..."
            className={inputCls()}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
          Link Video galeri (opsional)
          <input
            type="url"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://.../video.mp4"
            className={inputCls()}
          />
        </label>
        <p className="text-xs text-onsurface-variant">
          Tempel tautan video (mis. YouTube, Google Drive) dan tautan live
          streaming acara untuk ditampilkan di undangan.
        </p>
      </section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-rosewood-ink px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-inverse-surface disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Media"}
        </button>
        <p className="text-xs text-onsurface-variant">
          Kosongkan untuk menghapus tautan.
        </p>
      </div>
    </form>
  );
}
