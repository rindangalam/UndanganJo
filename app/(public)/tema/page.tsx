import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { IconWhatsApp } from "@/components/icons";
import { waLink, waOrderMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tema Undangan — UndanganJo",
  description:
    "Jelajahi galeri tema undangan digital UndanganJo dan pesan lewat WhatsApp.",
};

function monogram(name: string) {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase()).join("");
}

export default async function TemaPage() {
  const supabase = await createClient();
  const { data: themes } = await supabase
    .from("themes")
    .select("*")
    .eq("is_active", true)
    .order("is_premium", { ascending: true })
    .order("name", { ascending: true });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-8 py-16">
        <div className="max-w-2xl">
          <span className="w-max rounded bg-champagne-surface/60 px-3 py-1 font-semibold text-label-sm uppercase tracking-wide text-rosewood-ink">
            Galeri Tema
          </span>
          <h1 className="mt-4 font-serif text-[40px] font-medium leading-tight text-rosewood-ink md:text-[52px]">
            Pilih gaya undangan kalian
          </h1>
          <p className="mt-3 max-w-md text-body-lg text-onsurface-variant">
            Setiap tema bisa dipesan sendiri (self-serve) atau dibantu tim kami
            lewat WhatsApp.
          </p>
        </div>

        <div className="mt-12">
          {!themes || themes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-16 text-center text-sm text-onsurface-variant">
              Belum ada tema tersedia. Silakan hubungi admin.
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => (
                <article
                  key={t.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-champagne-surface bg-white"
                >
                  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-rosewood-ink">
                    {t.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.thumbnail_url}
                        alt={t.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-7xl font-light text-linen-bg/80">
                        {monogram(t.name)}
                      </span>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-linen-bg/90 px-3 py-1 text-label-sm font-semibold uppercase tracking-wide text-rosewood-ink">
                      {t.is_premium ? "Premium" : "Standard"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <h2 className="font-serif text-2xl font-medium text-rosewood-ink">
                      {t.name}
                    </h2>
                    <div className="flex flex-col gap-2">
                      <a
                        href={waLink(waOrderMessage(t.name))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-rosewood-ink px-4 py-2.5 text-label-sm font-semibold uppercase tracking-wider text-linen-bg transition hover:bg-rosewood-ink/90"
                      >
                        <IconWhatsApp className="h-4 w-4" />
                        Pesan via WhatsApp
                      </a>
                      <Link
                        href="/dashboard/new"
                        className="w-full rounded-lg border border-champagne-surface px-4 py-2.5 text-center text-label-sm font-semibold uppercase tracking-wider text-rosewood-ink transition hover:bg-surface"
                      >
                        Buat Sendiri
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-champagne-surface bg-linen-bg p-8 text-center">
          <h3 className="font-serif text-2xl font-medium text-rosewood-ink">
            Butuh bantuan memilih?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-body-md text-onsurface-variant">
            Tim kami siap membantu lewat WhatsApp untuk membuat undangan impian
            kalian.
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
      </main>
      <SiteFooter />
    </>
  );
}
