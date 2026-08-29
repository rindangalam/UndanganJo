import Image from "next/image";
import type { Invitation } from "@/components/builder/types";
import { IconHeart, IconMusic } from "@/components/icons";

function formatDisplayDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function InvitationPage({ invitation }: { invitation: Invitation }) {
  const photo = (invitation.gallery_photos ?? [])[0];
  const couple = [invitation.groom_name, invitation.bride_name]
    .filter(Boolean)
    .join(" & ");
  const akadDate = formatDisplayDate(invitation.akad_date);
  const resepsiDate = formatDisplayDate(invitation.reception_date);
  const photos = invitation.gallery_photos ?? [];

  return (
    <main className="mx-auto w-full max-w-md overflow-hidden bg-surface">
      {/* Cover */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 text-center">
        {photo ? (
          <Image
            src={photo}
            alt="Cover undangan"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-rosewood-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-rosewood-ink/80 via-rosewood-ink/30 to-linen-bg" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="text-[11px] uppercase tracking-[0.35em] text-linen-bg/90">
            The Wedding Of
          </span>
          <h1 className="font-serif text-[40px] font-medium leading-tight text-white drop-shadow">
            {couple || "Nama & Pasangan"}
          </h1>
          {akadDate && (
            <p className="text-xs uppercase tracking-[0.25em] text-linen-bg/95">
              {akadDate}
            </p>
          )}
        </div>
        <div className="absolute bottom-10 z-10 flex gap-6">
          <span className="flex flex-col items-center text-linen-bg">
            <IconHeart className="h-6 w-6" />
            <span className="mt-1 text-label-sm font-semibold">RSVP</span>
          </span>
          {invitation.music_url && (
            <span className="flex flex-col items-center text-linen-bg">
              <IconMusic className="h-6 w-6" />
              <span className="mt-1 text-label-sm font-semibold">Musik</span>
            </span>
          )}
        </div>
      </section>

      {/* Details */}
      {(akadDate || resepsiDate) && (
        <section className="px-8 py-14 text-center">
          <h2 className="mb-8 font-serif text-3xl font-medium italic text-rosewood-ink">
            Detail Acara
          </h2>
          <div className="flex flex-col gap-8">
            {akadDate && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-rosewood-ink/60">
                  Akad Nikah
                </span>
                <p className="mt-1 font-serif text-2xl font-medium text-rosewood-ink">
                  {akadDate}
                  {invitation.akad_time ? ` · ${invitation.akad_time}` : ""}
                </p>
                {invitation.akad_location && (
                  <p className="text-body-md text-onsurface-variant">
                    {invitation.akad_location}
                  </p>
                )}
                {invitation.akad_maps_url && (
                  <a
                    href={invitation.akad_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-rosewood-ink px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-rosewood-ink/90"
                  >
                    Buka Maps
                  </a>
                )}
              </div>
            )}
            {resepsiDate && (
              <div className="flex flex-col items-center gap-1 border-t border-champagne-surface pt-8">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-rosewood-ink/60">
                  Resepsi
                </span>
                <p className="mt-1 font-serif text-2xl font-medium text-rosewood-ink">
                  {resepsiDate}
                  {invitation.reception_time
                    ? ` · ${invitation.reception_time}`
                    : ""}
                </p>
                {invitation.reception_location && (
                  <p className="text-body-md text-onsurface-variant">
                    {invitation.reception_location}
                  </p>
                )}
                {invitation.reception_maps_url && (
                  <a
                    href={invitation.reception_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-rosewood-ink px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-rosewood-ink/90"
                  >
                    Buka Maps
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Story */}
      {invitation.story && (
        <section className="border-y border-champagne-surface bg-linen-bg px-8 py-14 text-center">
          <h2 className="mb-4 font-serif text-3xl font-medium italic text-rosewood-ink">
            Cerita Kami
          </h2>
          <p className="mx-auto max-w-sm whitespace-pre-line text-body-md leading-relaxed text-onsurface-variant">
            {invitation.story}
          </p>
        </section>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <section className="px-8 py-14">
          <h2 className="mb-6 text-center font-serif text-3xl font-medium italic text-rosewood-ink">
            Galeri
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((url, i) => (
              <Image
                key={i}
                src={url}
                alt={`Galeri ${i + 1}`}
                width={400}
                height={500}
                className="aspect-[3/4] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* Gift */}
      {(invitation.gift_name || invitation.gift_account) && (
        <section className="border-t border-champagne-surface bg-linen-bg px-8 py-14 text-center">
          <h2 className="mb-3 font-serif text-3xl font-medium italic text-rosewood-ink">
            Hadiah Digital
          </h2>
          <p className="text-body-md text-onsurface-variant">
            Doa dan kehadiran adalah hadiah terbaik. Namun jika ingin
            mengirimkan tanda kasih:
          </p>
          <div className="mx-auto mt-5 inline-flex flex-col items-center gap-1 rounded-xl border border-champagne-surface bg-surface px-6 py-4">
            <span className="text-label-sm font-semibold uppercase tracking-widest text-rosewood-ink/60">
              {invitation.gift_name}
            </span>
            <span className="font-serif text-2xl font-medium text-rosewood-ink">
              {invitation.gift_account}
            </span>
            {invitation.gift_info && (
              <span className="text-sm text-onsurface-variant">
                a.n. {invitation.gift_info}
              </span>
            )}
          </div>
        </section>
      )}

      <footer className="px-8 py-10 text-center">
        <p className="font-serif text-xl italic text-rosewood-ink">
          {couple || "UndanganJo"}
        </p>
        <p className="mt-2 text-label-sm uppercase tracking-widest text-onsurface-variant">
          We Are Married
        </p>
        <p className="mt-4 text-xs text-onsurface-variant/70">
          Dibuat dengan <IconHeart className="inline h-3 w-3 text-rosewood-ink" /> oleh UndanganJo
        </p>
      </footer>
    </main>
  );
}
