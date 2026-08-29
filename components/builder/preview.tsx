"use client";

import type { Invitation } from "@/components/builder/types";

export interface PreviewTabProps {
  invitation: Invitation;
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rosewood-ink">
        {label}
      </dt>
      <dd className="mt-0.5 text-[15px] text-onsurface">{value}</dd>
    </div>
  );
}

export default function PreviewTab({ invitation }: PreviewTabProps) {
  const photos = invitation.gallery_photos ?? [];

  return (
    <div className="rounded-2xl border border-outline-variant bg-white">
      <div className="px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rosewood-ink">
          The Wedding Of
        </p>
        <h2 className="mt-3 font-serif text-4xl font-medium text-onsurface">
          {invitation.groom_name || "Nama Pria"} <span className="text-rosewood-ink">&</span>{" "}
          {invitation.bride_name || "Nama Wanita"}
        </h2>
      </div>

      <div className="mx-auto max-w-md border-t border-outline-variant px-6 py-6">
        <div className="grid grid-cols-2 gap-6">
          <Field
            label="Akad"
            value={
              invitation.akad_date
                ? [invitation.akad_date, invitation.akad_time]
                    .filter(Boolean)
                    .join(" · ")
                : null
            }
          />
          <Field
            label="Resepsi"
            value={
              invitation.reception_date
                ? [invitation.reception_date, invitation.reception_time]
                    .filter(Boolean)
                    .join(" · ")
                : null
            }
          />
        </div>
        <Field label="Lokasi Akad" value={invitation.akad_location} />
        <Field label="Lokasi Resepsi" value={invitation.reception_location} />
      </div>

      {invitation.story && (
        <div className="border-t border-outline-variant px-6 py-6">
          <h3 className="text-center font-serif text-2xl font-medium text-onsurface">
            Cerita Kami
          </h3>
          <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-[15px] leading-relaxed text-onsurface-variant">
            {invitation.story}
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="border-t border-outline-variant px-6 py-6">
          <h3 className="text-center font-serif text-2xl font-medium text-onsurface">
            Galeri
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Galeri ${i + 1}`}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {(invitation.gift_name || invitation.gift_account) && (
        <div className="border-t border-outline-variant px-6 py-6 text-center">
          <h3 className="font-serif text-2xl font-medium text-onsurface">
            Hadiah
          </h3>
          <p className="mt-2 text-[15px] text-onsurface">
            {invitation.gift_name} {invitation.gift_account}
            {invitation.gift_info ? ` · ${invitation.gift_info}` : ""}
          </p>
        </div>
      )}

      <p className="border-t border-outline-variant px-6 py-4 text-center text-xs text-onsurface-variant">
        Preview sementara · halaman publik live disiapkan di tahap berikutnya
      </p>
    </div>
  );
}
