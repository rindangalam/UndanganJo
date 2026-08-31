import Image from "next/image";
import type { Invitation } from "@/components/builder/types";
import { IconHeart, IconMusic } from "@/components/icons";
import { formatDisplayDate, coupleName } from "../sections";
import Countdown from "@/components/invitation/countdown";
import MusicPlayer from "@/components/invitation/music-player";
import RsvpGuestbook from "@/components/invitation/rsvp-guestbook";

export default function Sastra({
  invitation,
  preview = false,
}: {
  invitation: Invitation;
  preview?: boolean;
}) {
  const photo = (invitation.gallery_photos ?? [])[0];
  const couple = coupleName(invitation);
  const akadDate = formatDisplayDate(invitation.akad_date);
  const resepsiDate = formatDisplayDate(invitation.reception_date);
  const photos = invitation.gallery_photos ?? [];
  const countdownTarget = invitation.akad_date ?? invitation.reception_date;

  return (
    <main className="mx-auto w-full max-w-md overflow-hidden bg-sastra-paper">
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
          <div className="absolute inset-0 bg-sastra-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-sastra-ink/90 via-sastra-ink/40 to-sastra-paper" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="text-[11px] uppercase tracking-[0.35em] text-linen-bg/90">
            The Wedding Of
          </span>
          <h1 className="font-serif text-[40px] font-medium leading-tight text-white drop-shadow">
            {couple || "Nama & Pasangan"}
          </h1>
          {akadDate && (
            <p className="text-xs uppercase tracking-[0.25em] text-sastra-surface/95">
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
          <h2 className="mb-8 font-serif text-3xl font-medium italic text-sastra-ink">
            Detail Acara
          </h2>
          <div className="flex flex-col gap-8">
            {akadDate && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-sastra-dim">
                  Akad Nikah
                </span>
                <p className="mt-1 font-serif text-2xl font-medium text-sastra-ink">
                  {akadDate}
                  {invitation.akad_time ? ` · ${invitation.akad_time}` : ""}
                </p>
                {invitation.akad_location && (
                  <p className="text-body-md text-sastra-dim">
                    {invitation.akad_location}
                  </p>
                )}
                {invitation.akad_maps_url && (
                  <a
                    href={invitation.akad_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-sastra-ink-soft px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
                  >
                    Buka Maps
                  </a>
                )}
              </div>
            )}
            {resepsiDate && (
              <div className="flex flex-col items-center gap-1 border-t border-sastra-hairline pt-8">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-sastra-dim">
                  Resepsi
                </span>
                <p className="mt-1 font-serif text-2xl font-medium text-sastra-ink">
                  {resepsiDate}
                  {invitation.reception_time
                    ? ` · ${invitation.reception_time}`
                    : ""}
                </p>
                {invitation.reception_location && (
                  <p className="text-body-md text-sastra-dim">
                    {invitation.reception_location}
                  </p>
                )}
                {invitation.reception_maps_url && (
                  <a
                    href={invitation.reception_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-sastra-ink-soft px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
                  >
                    Buka Maps
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {!preview && (
        <Countdown
          targetDate={countdownTarget}
          ink="text-sastra-ink"
          dim="text-sastra-dim"
          surface="bg-sastra-paper"
          hairline="border-sastra-hairline"
        />
      )}

      {/* Story */}
      {invitation.story && (
        <section className="border-y border-sastra-hairline bg-sastra-paper px-8 py-14 text-center">
          <h2 className="mb-4 font-serif text-3xl font-medium italic text-sastra-ink">
            Cerita Kami
          </h2>
          <p className="mx-auto max-w-sm whitespace-pre-line text-body-md leading-relaxed text-sastra-dim">
            {invitation.story}
          </p>
        </section>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <section className="px-8 py-14">
          <h2 className="mb-6 text-center font-serif text-3xl font-medium italic text-sastra-ink">
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
                className="aspect-[3/4] w-full rounded-md object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* Gift */}
      {(invitation.gift_name || invitation.gift_account) && (
        <section className="border-t border-sastra-hairline bg-sastra-paper px-8 py-14 text-center">
          <h2 className="mb-3 font-serif text-3xl font-medium italic text-sastra-ink">
            Hadiah Digital
          </h2>
          <p className="text-body-md text-sastra-dim">
            Doa dan kehadiran adalah hadiah terbaik. Namun jika ingin
            mengirimkan tanda kasih:
          </p>
          <div className="mx-auto mt-5 inline-flex flex-col items-center gap-1 rounded-xl border border-sastra-hairline bg-sastra-surface px-6 py-4">
            <span className="text-label-sm font-semibold uppercase tracking-widest text-sastra-dim">
              {invitation.gift_name}
            </span>
            <span className="font-serif text-2xl font-medium text-sastra-ink">
              {invitation.gift_account}
            </span>
            {invitation.gift_info && (
              <span className="text-sm text-sastra-dim">
                a.n. {invitation.gift_info}
              </span>
            )}
          </div>
        </section>
      )}

      {!preview && (
        <RsvpGuestbook
          invitationId={invitation.id}
          palette={{
            accent: "bg-sastra-ink-soft text-sastra-surface",
            ink: "text-sastra-ink",
            dim: "text-sastra-dim",
            surface: "bg-sastra-surface",
            hairline: "border-sastra-hairline",
          }}
        />
      )}

      <footer className="px-8 py-10 text-center">
        <p className="font-serif text-xl italic text-sastra-ink">
          {couple || "UndanganJo"}
        </p>
        <p className="mt-2 text-label-sm uppercase tracking-widest text-sastra-dim">
          We Are Married
        </p>
        <p className="mt-4 text-xs text-sastra-dim/70">
          Dibuat dengan <IconHeart className="inline h-3 w-3 text-sastra-ink-soft" /> oleh UndanganJo
        </p>
      </footer>

      {!preview && (
        <MusicPlayer
          src={invitation.music_url ?? null}
          accent="bg-sastra-ink-soft"
          ink="text-sastra-surface"
          surface="hover:bg-sastra-ink"
        />
      )}
    </main>
  );
}
