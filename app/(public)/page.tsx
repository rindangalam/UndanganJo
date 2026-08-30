import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { IconCheck, IconWhatsApp } from "@/components/icons";
import { waLink, waOrderMessage } from "@/lib/whatsapp";

const themes = [
  {
    name: "Botanical Romance",
    desc: "Ethereal, organic, timeless.",
    img: "/images/theme-botanical.jpg",
  },
  {
    name: "Modern Noir",
    desc: "Bold, editorial, striking.",
    img: "/images/theme-noir.jpg",
  },
  {
    name: "Terracotta Dream",
    desc: "Warm, earthy, intimate.",
    img: "/images/theme-terracotta.jpg",
  },
];

const features = [
  {
    title: "Tema Premium",
    desc: "Desain editorial yang elegan, dirancang khusus untuk perayaan kalian.",
  },
  {
    title: "RSVP & Buku Ucapan",
    desc: "Tamu konfirmasi kehadiran dan menulis ucapan langsung di undangan.",
  },
  {
    title: "Galeri Foto & Musik",
    desc: "Abadikan momen dengan galeri foto dan iringan musik latar pilihan.",
  },
  {
    title: "Hadiah Digital",
    desc: "Bagikan nomor rekening dan e-wallet untuk hadiah dari jarak jauh.",
  },
];

const plans = [
  {
    name: "Basic",
    price: "Rp 150.000",
    popular: false,
    features: ["Standard Theme", "RSVP & Buku Ucapan", "Hingga 20 Foto"],
  },
  {
    name: "Premium",
    price: "Rp 300.000",
    popular: true,
    features: [
      "Akses Banyak Tema",
      "Musik Latar",
      "Hingga 50 Foto",
      "Domain Custom",
    ],
  },
  {
    name: "Deluxe",
    price: "Rp 500.000",
    popular: false,
    features: [
      "Semua Fitur Premium",
      "Galeri Video",
      "Dukungan Prioritas",
      "Revisi Tanpa Batas",
    ],
  },
];

function PricingCard({
  name,
  price,
  popular,
  features,
}: (typeof plans)[number]) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border bg-white p-7 ${
        popular ? "border-rosewood-ink shadow-sm" : "border-champagne-surface"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rosewood-ink px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-linen-bg">
          Most Popular
        </span>
      )}
      <div>
        <h3 className="font-serif text-2xl font-medium text-rosewood-ink">
          {name}
        </h3>
        <p className="mt-2 text-3xl font-semibold text-rosewood-ink">
          {price}
        </p>
        <ul className="mt-6 space-y-2.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2.5 text-body-md text-onsurface-variant"
            >
              <IconCheck className="h-4 w-4 text-rosewood-ink" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/dashboard/new"
        className={`mt-7 w-full rounded-lg px-4 py-2.5 text-center text-label-sm font-semibold uppercase tracking-wider transition ${
          popular
            ? "bg-rosewood-ink text-linen-bg hover:bg-rosewood-ink/90"
            : "border border-rosewood-ink text-rosewood-ink hover:bg-champagne-surface"
        }`}
      >
        Select {name}
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-8 py-20 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-5">
            <h1 className="font-serif text-[40px] font-medium leading-[1.05] text-sastra-ink md:text-[56px]">
              Crafting{" "}
              <span className="italic text-sastra-ink-soft">Timeless</span>{" "}
              Digital Invitations
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-sastra-dim">
              Elevate your celebration with premium, editorial-style digital
              invitations designed for the modern couple. Intimate, beautiful,
              and effortless.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/new"
                className="rounded-full bg-sastra-ink-soft px-7 py-3 text-center text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
              >
                Buat Undangan
              </Link>
              <Link
                href="/#themes"
                className="rounded-full border border-sastra-ink px-7 py-3 text-center text-label-sm font-semibold uppercase tracking-wider text-sastra-ink transition hover:bg-sastra-paper"
              >
                Lihat Tema
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="overflow-hidden">
              <Image
                src="/images/hero-couple.jpg"
                alt="Pasangan elegan"
                width={1280}
                height={1024}
                className="h-[420px] w-full object-cover lg:h-[560px]"
              />
            </div>
          </div>
        </section>

        {/* Theme Showcase */}
        <section id="themes" className="border-y border-sastra-hairline bg-sastra-surface px-8 py-24">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-md font-serif text-4xl font-medium leading-tight text-sastra-ink md:text-[44px]">
                Temukan tema yang berbicara
              </h2>
              <Link
                href="/pricing"
                className="border-b border-sastra-ink pb-1 text-body-md text-sastra-ink transition hover:border-sastra-ink-soft hover:text-sastra-ink-soft"
              >
                Lihat Semua Tema
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {themes.map((t, i) => (
                <div
                  key={t.name}
                  className={`group cursor-pointer overflow-hidden ${
                    i === 0
                      ? "md:col-span-3 md:row-span-2"
                      : "md:col-span-2"
                  }`}
                >
                  <div className="mb-3 overflow-hidden">
                    <Image
                      src={t.img}
                      alt={t.name}
                      width={600}
                      height={800}
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                        i === 0 ? "h-[560px]" : "h-[270px]"
                      }`}
                    />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-sastra-ink">
                    {t.name}
                  </h3>
                  <p className="text-body-md text-sastra-dim">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-[1440px] px-8 py-20"
        >
          <div className="mb-12 max-w-2xl">
            <span className="mb-2 block text-label-sm uppercase tracking-widest text-rosewood-ink/60">
              Why UndanganJo
            </span>
            <h2 className="font-serif text-3xl font-medium text-rosewood-ink md:text-[32px]">
              Everything you need for a beautiful invitation
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-champagne-surface bg-linen-bg p-6"
              >
                <h3 className="font-serif text-xl font-medium text-rosewood-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-body-md text-onsurface-variant">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="border-y border-champagne-surface bg-linen-bg px-8 py-20"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-medium text-rosewood-ink md:text-[32px]">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-body-md text-onsurface-variant">
                Choose the perfect plan for your special day. No hidden fees,
                just beautiful digital invitations crafted with love.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((p) => (
                <PricingCard key={p.name} {...p} />
              ))}
            </div>
            <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-champagne-surface bg-white p-8 text-center">
              <h3 className="font-serif text-2xl font-medium text-rosewood-ink">
                Need help deciding?
              </h3>
              <p className="mx-auto mt-2 max-w-md text-body-md text-onsurface-variant">
                Prefer to order with the help of our team? We are ready to
                assist you via WhatsApp to create your perfect invitation.
              </p>
              <a
                href={waLink(waOrderMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rosewood-ink px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-rosewood-ink/90"
              >
                <IconWhatsApp className="h-4 w-4" />
                Pesan via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
