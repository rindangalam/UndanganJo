import Image from "next/image";
import type { Invitation } from "@/components/builder/types";
import { IconHeart, IconMusic } from "@/components/icons";
import { formatDisplayDate, coupleName, VideoSection } from "../sections";
import Countdown from "@/components/invitation/countdown";
import MusicPlayer from "@/components/invitation/music-player";
import RsvpGuestbook from "@/components/invitation/rsvp-guestbook";

export default function Terracotta({
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
    <main className="mx-auto w-full max-w-md overflow-hidden bg-[#faf3e8]">
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
          <div className="absolute inset-0 bg-[#f2e3cf]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#b4552d]/85 via-[#b4552d]/35 to-[#faf3e8]" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#fff4ea]">
            The Wedding Of
          </span>
          <h1 className="font-serif text-[40px] font-medium leading-tight text-white drop-shadow">
            {couple || "Nama & Pasangan"}
          </h1>
          {akadDate && (
            <p className="text-xs uppercase tracking-[0.25em] text-[#fdeee2]">
              {akadDate}
            </p>
          )}
        </div>
        <div className="absolute bottom-10 z-10 flex gap-6">
          <span className="flex flex-col items-center text-[#fff4ea]">
            <IconHeart className="h-6 w-6" />
            <span className="mt-1 text-label-sm font-semibold">RSVP</span>
          </span>
          {invitation.music_url && (
            <span className="flex flex-col items-center text-[#fff4ea]">
              <IconMusic className="h-6 w-6" />
              <span className="mt-1 text-label-sm font-semibold">Musik</span>
            </span>
          )}
        </div>
      </section>

      {/* Details */}
      {(akadDate || resepsiDate) && (
        <section className="px-8 py-14 text-center">
          <h2 className="mb-8 font-serif text-3xl font-medium italic text-[#b4552d]">
            Detail Acara
          </h2>
          <div className="flex flex-col gap-8">
            {akadDate && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-[#8a6a52]">
                  Akad Nikah
                </span>
                <p className="mt-1 font-serif text-2xl font-medium text-[#3a2419]">
                  {akadDate}
                  {invitation.akad_time ? ` · ${invitation.akad_time}` : ""}
                </p>
                {invitation.akad_location && (
                  <p className="text-body-md text-[#8a6a52]">
                    {invitation.akad_location}
                  </p>
                )}
                {invitation.akad_maps_url && (
                  <a
                    href={invitation.akad_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#b4552d] px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-white transition hover:bg-[#c96a3d]"
                  >
                    Buka Maps
                  </a>
                )}
              </div>
            )}
            {resepsiDate && (
              <div className="flex flex-col items-center gap-1 border-t border-[#e5d2ba] pt-8">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-[#8a6a52]">
                  Resepsi
                </span>
                <p className="mt-1 font-serif text-2xl font-medium text-[#3a2419]">
                  {resepsiDate}
                  {invitation.reception_time
                    ? ` · ${invitation.reception_time}`
                    : ""}
                </p>
                {invitation.reception_location && (
                  <p className="text-body-md text-[#8a6a52]">
                    {invitation.reception_location}
                  </p>
                )}
                {invitation.reception_maps_url && (
                  <a
                    href={invitation.reception_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#b4552d] px-5 py-2 text-label-md font-semibold uppercase tracking-wider text-white transition hover:bg-[#c96a3d]"
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
          ink="text-[#3a2419]"
          dim="text-[#8a6a52]"
          surface="bg-[#faf3e8]"
          hairline="border-[#e5d2ba]"
        />
      )}

      {/* Story */}
      {invitation.story && (
        <section className="border-y border-[#e5d2ba] bg-[#f2e3cf] px-8 py-14 text-center">
          <h2 className="mb-4 font-serif text-3xl font-medium italic text-[#b4552d]">
            Cerita Kami
          </h2>
          <p className="mx-auto max-w-sm whitespace-pre-line text-body-md leading-relaxed text-[#3a2419]">
            {invitation.story}
          </p>
        </section>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <section className="px-8 py-14">
          <h2 className="mb-6 text-center font-serif text-3xl font-medium italic text-[#b4552d]">
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
        <section className="border-t border-[#e5d2ba] bg-[#f2e3cf] px-8 py-14 text-center">
          <h2 className="mb-3 font-serif text-3xl font-medium italic text-[#b4552d]">
            Hadiah Digital
          </h2>
          <p className="text-body-md text-[#3a2419]">
            Doa dan kehadiran adalah hadiah terbaik. Namun jika ingin
            mengirimkan tanda kasih:
          </p>
          <div className="mx-auto mt-5 inline-flex flex-col items-center gap-1 rounded-xl border border-[#e5d2ba] bg-[#faf3e8] px-6 py-4">
            <span className="text-label-sm font-semibold uppercase tracking-widest text-[#8a6a52]">
              {invitation.gift_name}
            </span>
            <span className="font-serif text-2xl font-medium text-[#b4552d]">
              {invitation.gift_account}
            </span>
            {invitation.gift_info && (
              <span className="text-sm text-[#8a6a52]">
                a.n. {invitation.gift_info}
              </span>
            )}
          </div>
        </section>
      )}

      <VideoSection
        invitation={invitation}
        headlineClass="text-[#b4552d]"
        bodyClass="text-[#8a6a52]"
        accentClass="bg-[#b4552d] text-white"
        surfaceClass="bg-[#faf3e8]"
        hairlineClass="border-[#e5d2ba]"
      />

      {!preview && (
        <RsvpGuestbook
          invitationId={invitation.id}
          palette={{
            accent: "bg-[#b4552d] text-white",
            ink: "text-[#3a2419]",
            dim: "text-[#8a6a52]",
            surface: "bg-[#faf3e8]",
            hairline: "border-[#e5d2ba]",
          }}
        />
      )}

      <footer className="px-8 py-10 text-center">
        <p className="font-serif text-xl italic text-[#3a2419]">
          {couple || "UndanganJo"}
        </p>
        <p className="mt-2 text-label-sm uppercase tracking-widest text-[#8a6a52]">
          We Are Married
        </p>
        <p className="mt-4 text-xs text-[#8a6a52]/70">
          Dibuat dengan <IconHeart className="inline h-3 w-3 text-[#b4552d]" /> oleh UndanganJo
        </p>
      </footer>

      {!preview && (
        <MusicPlayer
          src={invitation.music_url ?? null}
          accent="bg-[#b4552d]"
          ink="text-white"
          surface="hover:bg-[#c96a3d]"
        />
      )}
    </main>
  );
}
