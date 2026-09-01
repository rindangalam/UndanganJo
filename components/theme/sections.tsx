import type { Invitation } from "@/components/builder/types";

export function formatDisplayDate(value: string | null): string | null {
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

export function coupleName(invitation: Invitation): string {
  return [invitation.groom_name, invitation.bride_name]
    .filter(Boolean)
    .join(" & ");
}

export interface VideoSectionProps {
  invitation: Invitation;
  headlineClass?: string;
  bodyClass?: string;
  accentClass?: string;
  surfaceClass?: string;
  hairlineClass?: string;
}

export function VideoSection({
  invitation,
  headlineClass = "text-sastra-ink",
  bodyClass = "text-sastra-dim",
  accentClass = "bg-sastra-ink-soft text-sastra-surface",
  surfaceClass = "bg-sastra-surface",
  hairlineClass = "border-sastra-hairline",
}: VideoSectionProps) {
  const hasVideo = Boolean(invitation.video_url);
  const hasLive = Boolean(invitation.livestream_url);
  if (!hasVideo && !hasLive) return null;

  return (
    <section
      className={`border-t ${hairlineClass} ${surfaceClass} px-8 py-14 text-center`}
    >
      <h2
        className={`mb-6 font-serif text-3xl font-medium italic ${headlineClass}`}
      >
        Video &amp; Live
      </h2>
      {hasVideo && (
        <video
          src={invitation.video_url ?? undefined}
          controls
          preload="metadata"
          className="mx-auto w-full max-w-sm rounded-md bg-black/5"
        />
      )}
      {hasLive && (
        <a
          href={invitation.livestream_url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-label-md font-semibold uppercase tracking-wider transition ${accentClass}`}
        >
          Lihat Live Streaming
        </a>
      )}
      <p className={`mt-4 text-body-md ${bodyClass}`}>
        Ikuti momen spesial kami secara langsung.
      </p>
    </section>
  );
}
