"use client";

import { useState } from "react";
import type { Invitation } from "@/components/builder/types";
import type { InvitationDataInput } from "@/lib/actions/invitation";

export interface FormDataTabProps {
  invitation: Invitation;
  onSave: (data: InvitationDataInput) => Promise<void>;
  mode?: "pasangan" | "acara" | "cerita" | "all";
}

function inputCls(
  className = ""
) {
  return `rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-onsurface outline-none transition focus:border-rosewood-ink ${className}`;
}

export default function FormDataTab({
  invitation,
  onSave,
  mode = "all",
}: FormDataTabProps) {
  const [form, setForm] = useState<InvitationDataInput>({
    groom_name: invitation.groom_name ?? "",
    bride_name: invitation.bride_name ?? "",
    akad_date: invitation.akad_date ?? "",
    akad_time: invitation.akad_time ?? "",
    akad_location: invitation.akad_location ?? "",
    akad_maps_url: invitation.akad_maps_url ?? "",
    reception_date: invitation.reception_date ?? "",
    reception_time: invitation.reception_time ?? "",
    reception_location: invitation.reception_location ?? "",
    reception_maps_url: invitation.reception_maps_url ?? "",
    story: invitation.story ?? "",
    gift_name: invitation.gift_name ?? "",
    gift_account: invitation.gift_account ?? "",
    gift_info: invitation.gift_info ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof InvitationDataInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {(mode === "pasangan" || mode === "all") && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-rosewood-ink">
            Nama Mempelai
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Nama mempelai pria
              <input
                type="text"
                value={form.groom_name}
                onChange={(e) => set("groom_name", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Nama mempelai wanita
              <input
                type="text"
                value={form.bride_name}
                onChange={(e) => set("bride_name", e.target.value)}
                className={inputCls()}
              />
            </label>
          </div>
        </section>
      )}

      {(mode === "acara" || mode === "all") && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-rosewood-ink">Akad Nikah</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Tanggal
              <input
                type="date"
                value={form.akad_date}
                onChange={(e) => set("akad_date", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Waktu
              <input
                type="time"
                value={form.akad_time}
                onChange={(e) => set("akad_time", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink sm:col-span-2">
              Lokasi
              <input
                type="text"
                value={form.akad_location}
                onChange={(e) => set("akad_location", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink sm:col-span-2">
              Link Google Maps
              <input
                type="url"
                value={form.akad_maps_url}
                onChange={(e) => set("akad_maps_url", e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputCls()}
              />
            </label>
          </div>
        </section>
      )}

      {(mode === "acara" || mode === "all") && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-rosewood-ink">Resepsi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Tanggal
              <input
                type="date"
                value={form.reception_date}
                onChange={(e) => set("reception_date", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Waktu
              <input
                type="time"
                value={form.reception_time}
                onChange={(e) => set("reception_time", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink sm:col-span-2">
              Lokasi
              <input
                type="text"
                value={form.reception_location}
                onChange={(e) => set("reception_location", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink sm:col-span-2">
              Link Google Maps
              <input
                type="url"
                value={form.reception_maps_url}
                onChange={(e) => set("reception_maps_url", e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputCls()}
              />
            </label>
          </div>
        </section>
      )}

      {(mode === "cerita" || mode === "all") && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-rosewood-ink">
            Cerita Pasangan
          </h2>
          <textarea
            value={form.story}
            onChange={(e) => set("story", e.target.value)}
            rows={4}
            placeholder="Tulis kisah kalian..."
            className={inputCls()}
          />
        </section>
      )}

      {(mode === "cerita" || mode === "all") && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-rosewood-ink">
            Hadiah Digital
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Nama (mis. Bank BCA)
              <input
                type="text"
                value={form.gift_name}
                onChange={(e) => set("gift_name", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Nomor rekening/e-wallet
              <input
                type="text"
                value={form.gift_account}
                onChange={(e) => set("gift_account", e.target.value)}
                className={inputCls()}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-rosewood-ink">
              Atas nama
              <input
                type="text"
                value={form.gift_info}
                onChange={(e) => set("gift_info", e.target.value)}
                className={inputCls()}
              />
            </label>
          </div>
        </section>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-rosewood-ink px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-inverse-surface disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Data"}
        </button>
        <p className="text-xs text-onsurface-variant">
          Data disimpan sebagian setiap kamu menekan Simpan.
        </p>
      </div>
    </form>
  );
}
