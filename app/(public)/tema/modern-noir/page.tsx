import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { IconCheck, IconHeart } from "@/components/icons";

export const metadata: Metadata = {
  title: "Modern Noir — Preview Tema",
  description:
    "A sophisticated, moody aesthetic blending deep charcoal tones with delicate gold accents.",
};

export default function ModernNoirDemo() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-8 py-16 md:flex-row md:items-start md:gap-8">
        {/* Details */}
        <div className="flex w-full flex-col gap-6 md:sticky md:top-32 md:w-1/3">
          <span className="w-max rounded bg-champagne-surface/60 px-3 py-1 font-semibold text-label-sm uppercase tracking-wide text-rosewood-ink">
            Theme Preview
          </span>
          <h1 className="font-serif text-[36px] font-medium leading-tight text-rosewood-ink md:mt-4 md:text-[48px]">
            Modern Noir
          </h1>
          <p className="max-w-md text-body-lg text-onsurface-variant">
            A sophisticated, moody aesthetic blending deep charcoal tones with
            delicate gold accents. Perfect for elegant evening affairs and
            minimalist romances.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <Link
              href="/dashboard/new"
              className="w-full rounded px-8 py-4 text-center text-label-md font-semibold uppercase tracking-wider text-linen-bg shadow-[0_4px_14px_rgba(92,57,52,0.39)] transition hover:-translate-y-0.5 hover:bg-rosewood-ink/90 hover:shadow-[0_6px_20px_rgba(92,57,52,0.23)]"
            >
              Use This Theme
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded border border-champagne-surface px-8 py-4 text-center text-label-md font-semibold uppercase tracking-wider text-rosewood-ink transition hover:bg-surface"
            >
              View Pricing
            </Link>
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t border-champagne-surface pt-8">
            <h3 className="text-label-md font-semibold uppercase tracking-wider text-rosewood-ink/70">
              Features Included
            </h3>
            <ul className="flex flex-col gap-3 text-body-md text-onsurface-variant">
              {[
                "Custom Monogram",
                "RSVP Management",
                "Photo Gallery",
                "Background Music",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <IconCheck className="h-5 w-5 text-rosewood-ink" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex w-full justify-center py-6 md:w-2/3">
          <div className="relative h-[812px] w-[375px] overflow-hidden rounded-[40px] border-8 border-rosewood-ink bg-[#111] shadow-[0_20px_40px_rgba(25,24,23,0.2)]">
            <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto bg-cover bg-center p-8 text-center">
              <Image
                src="/images/noir-cover.jpg"
                alt="Cover Modern Noir"
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-transparent to-[#111]" />
              <div className="relative z-10 mt-16 flex flex-col items-center gap-6">
                <span className="text-sm uppercase tracking-[0.3em] text-white/70">
                  The Wedding Of
                </span>
                <h2 className="text-5xl font-light leading-none tracking-tight text-white">
                  Alexander
                  <span className="my-2 block font-serif text-2xl italic text-white/50">
                    &amp;
                  </span>
                  Isabella
                </h2>
                <div className="my-2 h-px w-12 bg-[#d4af37]" />
                <p className="text-xs uppercase tracking-widest text-white/80">
                  October 24, 2025
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/50">
                  New York City
                </p>
              </div>
            </div>
            <button
              type="button"
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center rounded-full bg-linen-bg/90 px-6 py-2 text-rosewood-ink"
            >
              <IconHeart className="h-5 w-5" />
              <span className="mt-1 text-label-sm font-semibold">RSVP</span>
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
