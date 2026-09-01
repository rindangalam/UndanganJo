import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { IconCheck, IconWhatsApp } from "@/components/icons";
import { waLink, waOrderMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Paket & Harga",
  description: "Pilih paket undangan digital: Standar atau Premium.",
};

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function featuresFor(pkg: {
  name: string;
  max_photos: number;
  has_music: boolean;
  has_video: boolean;
  premium_themes: boolean;
}): string[] {
  const isPremium = pkg.name.toLowerCase() === "premium";
  const base = [
    "Semua tema premium",
    "Galeri video & livestream",
    `Hingga ${pkg.max_photos} foto`,
    "Musik latar",
    "RSVP & buku ucapan",
    "Countdown acara",
    "Amplop digital",
    "Export RSVP (CSV)",
    "Pelacak buka undangan",
  ];
  if (isPremium) return base;
  return [
    "1 tema standar",
    `Hingga ${pkg.max_photos} foto`,
    "Musik latar",
    "Data acara & Google Maps",
    "Cerita & galeri foto",
    "RSVP & buku ucapan",
    "Countdown acara",
    "Amplop digital",
  ];
}

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("packages")
    .select("id, name, price, max_photos, has_music, has_video, premium_themes")
    .eq("is_active", true)
    .order("price", { ascending: true });

  const plans = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: formatIDR(p.price),
    popular: p.name.toLowerCase() === "premium",
    features: featuresFor(p),
  }));

  return (
    <>
      <SiteHeader />
      <main className="bg-sastra-paper pt-[80px]">
        <section className="mx-auto max-w-[1440px] px-8 py-20 text-center">
          <h1 className="font-serif text-[36px] font-medium text-sastra-ink md:text-[48px]">
            Paket &amp; Harga
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body-md text-sastra-dim">
            Pilih paket yang sesuai untuk hari spesialmu. Tanpa biaya
            tersembunyi, undangan digital yang indah penuh cinta.
          </p>
        </section>
        <section className="mx-auto max-w-[1440px] px-8 pb-20">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-sastra-surface p-8 ${
                  p.popular
                    ? "border-sastra-ink-soft shadow-sm"
                    : "border-sastra-hairline"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-sastra-ink-soft px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface">
                    Paling Laris
                  </span>
                )}
                <div>
                  <h3 className="font-serif text-2xl font-medium text-sastra-ink">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-3xl font-semibold text-sastra-ink">
                    {p.price}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2.5 text-body-md text-sastra-dim"
                      >
                        <IconCheck className="h-4 w-4 text-sastra-ink-soft" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/dashboard/new"
                  className={`mt-8 w-full rounded-2xl px-4 py-3 text-center text-label-sm font-semibold uppercase tracking-wider transition ${
                    p.popular
                      ? "bg-sastra-ink-soft text-sastra-surface hover:bg-sastra-ink"
                      : "border border-sastra-ink text-sastra-ink hover:bg-sastra-paper"
                  }`}
                >
                  Pilih {p.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-sastra-hairline bg-sastra-paper p-8 text-center">
            <h3 className="font-serif text-2xl font-medium text-sastra-ink">
              Butuh bantuan memilih?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-body-md text-sastra-dim">
              Lebih suka dibantu tim kami? Kami siap membantu membuat undangan
              impianmu lewat WhatsApp.
            </p>
            <a
              href={waLink(waOrderMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sastra-ink-soft px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
            >
              <IconWhatsApp className="h-4 w-4" />
              Pesan via WhatsApp
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
