import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { IconCheck, IconWhatsApp } from "@/components/icons";
import { waLink, waOrderMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Paket & Harga",
  description:
    "Pilih paket undangan digital yang sesuai: Basic, Premium, atau Deluxe.",
};

const plans = [
  {
    name: "Basic",
    price: "Rp 150.000",
    popular: false,
    features: [
      "Standard Theme",
      "RSVP Integration",
      "Up to 20 Photos",
    ],
  },
  {
    name: "Premium",
    price: "Rp 300.000",
    popular: true,
    features: [
      "Multiple Themes Access",
      "Background Music",
      "Up to 50 Photos",
      "Custom Domain Integration",
    ],
  },
  {
    name: "Deluxe",
    price: "Rp 500.000",
    popular: false,
    features: [
      "All Premium Features",
      "Video Gallery Integration",
      "Priority Support",
      "Unlimited Revisions",
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
      className={`relative flex flex-col justify-between rounded-xl border bg-white p-8 ${
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
        <ul className="mt-6 space-y-3">
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
        className={`mt-8 w-full rounded-lg px-4 py-3 text-center text-label-sm font-semibold uppercase tracking-wider transition ${
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

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[80px]">
        <section className="mx-auto max-w-[1440px] px-8 py-20 text-center">
          <h1 className="font-serif text-[36px] font-medium text-rosewood-ink md:text-[48px]">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body-md text-onsurface-variant">
            Choose the perfect plan for your special day. No hidden fees, just
            beautiful digital invitations crafted with love.
          </p>
        </section>
        <section className="mx-auto max-w-[1440px] px-8 pb-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <PricingCard key={p.name} {...p} />
            ))}
          </div>
          <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-champagne-surface bg-linen-bg p-8 text-center">
            <h3 className="font-serif text-2xl font-medium text-rosewood-ink">
              Need help deciding?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-body-md text-onsurface-variant">
              Prefer to order with the help of our team? We are ready to assist
              you via WhatsApp to create your perfect invitation.
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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
