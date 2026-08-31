import type { Metadata } from "next";
import Link from "next/link";
import type { Invitation } from "@/components/builder/types";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { IconWhatsApp } from "@/components/icons";
import { renderTheme, themeKeyOf } from "@/components/theme/registry";
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

const SAMPLE: Invitation = {
  id: "sample",
  customer_id: null,
  package_id: null,
  theme_id: null,
  slug: "sample",
  status: "published",
  groom_name: "Raka",
  bride_name: "Annisa",
  akad_date: "2026-12-12",
  akad_time: "09:00",
  akad_location: "Masjid Agung, Semarang",
  akad_maps_url: null,
  reception_date: "2026-12-13",
  reception_time: "11:00",
  reception_location: "Hotel Gumaya, Semarang",
  reception_maps_url: null,
  story:
    "Kami bertemu di sebuah pagi hujan di kampus — dan kini kami menulis bab yang paling indah bersama.",
  gift_name: "BCA",
  gift_account: "1234567890",
  gift_info: "Raka & Annisa",
  music_url: null,
  gallery_photos: [],
  created_by_admin: false,
  customer_name: null,
  customer_phone: null,
  updated_at: null,
};

function ThemePreview({ themeKey }: { themeKey: string | null }) {
  const key = themeKeyOf(themeKey);
  return (
    <div
      className="mx-auto h-[520px] w-[280px] overflow-x-hidden overflow-y-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="w-[448px]" style={{ zoom: 280 / 448 }}>
        {renderTheme(key, SAMPLE)}
      </div>
    </div>
  );
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
      <main className="bg-sastra-paper mx-auto w-full max-w-[1280px] flex-1 px-8 py-16">
        <div className="max-w-2xl">
          <span className="w-max rounded border border-sastra-hairline bg-sastra-surface px-3 py-1 font-semibold text-label-sm uppercase tracking-wide text-sastra-ink">
            Galeri Tema
          </span>
          <h1 className="mt-4 font-serif text-[40px] font-medium leading-tight text-sastra-ink md:text-[52px]">
            Pilih gaya undangan kalian
          </h1>
          <p className="mt-3 max-w-md text-body-lg text-sastra-dim">
            Setiap tema bisa dipesan sendiri (self-serve) atau dibantu tim kami
            lewat WhatsApp.
          </p>
        </div>

        <div className="mt-12">
          {!themes || themes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sastra-hairline bg-sastra-surface px-6 py-16 text-center text-sm text-sastra-dim">
              Belum ada tema tersedia. Silakan hubungi admin.
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => (
                <article
                  key={t.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-sastra-hairline bg-sastra-surface"
                >
                  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-sastra-ink">
                    {t.key ? (
                      <ThemePreview themeKey={t.key} />
                    ) : t.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.thumbnail_url}
                        alt={t.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-7xl font-light text-sastra-surface/80">
                        {monogram(t.name)}
                      </span>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-sastra-paper/95 px-3 py-1 text-label-sm font-semibold uppercase tracking-wide text-sastra-ink">
                      {t.is_premium ? "Premium" : "Standard"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <h2 className="font-serif text-2xl font-medium text-sastra-ink">
                      {t.name}
                    </h2>
                    <div className="flex flex-col gap-2">
                      <a
                        href={waLink(waOrderMessage(t.name))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-sastra-ink-soft px-4 py-2.5 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
                      >
                        <IconWhatsApp className="h-4 w-4" />
                        Pesan via WhatsApp
                      </a>
                      <Link
                        href="/dashboard/new"
                        className="w-full rounded-lg border border-sastra-hairline px-4 py-2.5 text-center text-label-sm font-semibold uppercase tracking-wider text-sastra-ink transition hover:bg-sastra-paper"
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

        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-sastra-hairline bg-sastra-paper p-8 text-center">
          <h3 className="font-serif text-2xl font-medium text-sastra-ink">
            Butuh bantuan memilih?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-body-md text-sastra-dim">
            Tim kami siap membantu lewat WhatsApp untuk membuat undangan impian
            kalian.
          </p>
          <a
            href={waLink(waOrderMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sastra-ink-soft px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
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
