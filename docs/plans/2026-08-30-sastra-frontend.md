# Pass 1 "Sastra" — Redesign Frontend Publik (ink & ivory editorial) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Terapkan arah visual "Sastra" (palet ink & ivory + aksen hijau tua, serif editorial) ke seluruh halaman publik UndanganJo tanpa mengubah struktur data/route/konten produk.

**Architecture:** Perubahan dimurni visual. Tambah token Tailwind baru (`sastra-*`) di `app/globals.css` sehingga token lama Rosewood tetap utuh untuk dashboard/admin. Selanjutnya restyle per halaman publik: `components/site-header.tsx`, `components/site-footer.tsx`, `app/(public)/page.tsx`, `app/(public)/tema/page.tsx`, `app/(public)/pricing/page.tsx`, `components/invitation/invitation-page.tsx`. Font tetap EB Garamond (display serif) + Geist (UI). Tanpa penambahan dependency.

**Tech Stack:** Next.js 16 (App Router, RSC), Tailwind CSS v4, TypeScript.

---

## File Structure

| File | Tindakan | Tanggung jawab |
|---|---|---|
| `app/globals.css` | Modify | Token Sastra baru (`--color-sastra-*`) |
| `components/site-header.tsx` | Modify | Header publik restyle + fix nav "Studio" |
| `components/site-footer.tsx` | Modify | Footer publik restyle |
| `app/(public)/page.tsx` | Modify | Landing: hero split, themes bento, features hairline, pricing Sastra |
| `app/(public)/tema/page.tsx` | Modify | Galeri tema restyle |
| `app/(public)/pricing/page.tsx` | Modify | Halaman pricing restyle |
| `components/invitation/invitation-page.tsx` | Modify | Halaman tamu `/[slug]` restyle (konten tetap) |

Verifikasi tanpa unit test (perubahan murni visual): `npm run lint` + `npm run build` wajib lolos + cek visual di browser.

---

## Task Outlines

- Task 1: Tambah token Sastra di `globals.css`
- Task 2: Restyle `components/site-header.tsx` (+ fix nav Studio → `/#features`)
- Task 3: Restyle `components/site-footer.tsx`
- Task 4: Restyle hero landing (`app/(public)/page.tsx`) — split editorial
- Task 5: Restyle themes showcase landing — bento editorial
- Task 6: Restyle features landing — hairline/asimetris, kurangi eyebrow
- Task 7: Restyle pricing landing — Sastra (konten tidak berubah)
- Task 8: Restyle `app/(public)/tema/page.tsx`
- Task 9: Restyle `app/(public)/pricing/page.tsx`
- Task 10: Restyle `components/invitation/invitation-page.tsx`
- Task 11: Verifikasi akhir: lint, build, cek browser tiap halaman publik

---
## Task 1: Tambah token Sastra di `globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Tambah token Sastra**

Tambah blok token Sastra ke dalam `@theme inline` di `app/globals.css`, tepat setelah blok Rosewood dan sebelum `--font-serif`:

```css
  /* Sastra palette (ink & ivory editorial) */
  --color-sastra-paper: #f7f5f0;
  --color-sastra-surface: #fbfaf7;
  --color-sastra-ink: #161612;
  --color-sastra-ink-soft: #4a5b4f;
  --color-sastra-hairline: #e4e0d6;
  --color-sastra-dim: #8d8a80;
```

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS (tanpa error terkait CSS).

```bash
git add app/globals.css
git commit -m "style: tambah palet Sastra (ink & ivory editorial) di globals.css"
```

---
## Task 2: Restyle `components/site-header.tsx` (+ fix nav Studio)

**Files:**
- Modify: `components/site-header.tsx`

- [ ] **Step 1: Terapkan token Sastra & fix nav "Studio"**

Ganti seluruh isi file dengan versi berpalet Sastra. Kata "Studio" tetap ada di nav tapi tujuannya diubah dari `/pricing` menjadi `/#features`:

```tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-sastra-hairline bg-sastra-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight text-sastra-ink"
        >
          UndanganJo
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/tema"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Themes
          </Link>
          <Link
            href="/#features"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Pricing
          </Link>
          <Link
            href="/#features"
            className="text-body-md text-sastra-dim transition-colors hover:text-sastra-ink"
          >
            Studio
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-body-md text-sastra-ink transition-colors hover:text-sastra-ink/80 md:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard/new"
            className="rounded-lg bg-sastra-ink-soft px-5 py-2.5 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
          >
            Create Invitation
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add components/site-header.tsx
git commit -m "style: restyle header publik ke palet Sastra + fix nav Studio"
```

---
## Task 3: Restyle `components/site-footer.tsx`

**Files:**
- Modify: `components/site-footer.tsx`

- [ ] **Step 1: Terapkan token Sastra**

Ganti seluruh isi file dengan versi berpalet Sastra (struktur & label tetap):

```tsx
export default function SiteFooter() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-4 border-t border-sastra-hairline bg-sastra-paper px-8 py-10 text-center">
      <h2 className="font-serif text-2xl font-medium italic text-sastra-ink">
        UndanganJo
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {["Privacy Policy", "Terms of Service", "Contact Us", "Instagram"].map(
          (label) => (
            <a
              key={label}
              href="#"
              className="text-body-md text-sastra-dim transition-colors underline-offset-4 hover:text-sastra-ink hover:underline"
            >
              {label}
            </a>
          )
        )}
      </div>
      <p className="mt-2 text-body-md text-sastra-dim">
        © 2026 UndanganJo Digital Studio. Crafted for love.
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add components/site-footer.tsx
git commit -m "style: restyle footer publik ke palet Sastra"
```

---
## Task 4: Restyle hero landing (`app/(public)/page.tsx`) — split editorial

**Files:**
- Modify: `app/(public)/page.tsx` (bagian `<main>` hero saja)

- [ ] **Step 1: Ganti hero ke layout split editorial**

Di `app/(public)/page.tsx`, ganti seluruh blok `<section>` hero (dari `{/* Hero */}` sampai penutup `</section>` sebelum `{/* Theme Showcase */}`) dengan versi berikut. Tujuan: teks kiri + foto kanan full-bleed, hapus kartu "The Details" miring yang generik, pakai token Sastra:

```tsx
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
```

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add "app/(public)/page.tsx"
git commit -m "style: hero landing ke split editorial Sastra"
```

---
## Task 5: Restyle themes showcase landing — bento editorial

**Files:**
- Modify: `app/(public)/page.tsx` (blok `{/* Theme Showcase */}`)

- [ ] **Step 1: Ubah theme showcase ke bento editorial**

Ganti seluruh blok `{/* Theme Showcase */}` (dari komentar sampai penutup `</section>` sebelum `{/* Features */}`) dengan layout bento asimetris berpalet Sastra. Section `id="themes"` tetap dan background hapus (pakai `bg-sastra-paper` agar kontras dengan section pricing berikutnya), eyebrow dikurangi:

```tsx
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
```

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add "app/(public)/page.tsx"
git commit -m "style: theme showcase landing ke bento editorial Sastra"
```

---
## Task 6: Restyle features landing — hairline/asimetris, kurangi eyebrow

**Files:**
- Modify: `app/(public)/page.tsx` (blok `{/* Features */}`)

- [ ] **Step 1: Ubah features ke grid hairline asimetris tanpa card seragam**

Ganti seluruh blok `{/* Features */}` dengan versi berikut: hapus eyebrow "Why UndanganJo" (aturan taste: max ~1 per 3 section), header langsung ke judul, dan gunakan grid 2 kolom dengan divider hairline alih-alih 4 kartu seragam:

```tsx
        {/* Features */}
        <section id="features" className="mx-auto max-w-[1440px] px-8 py-24">
          <div className="mb-14 max-w-2xl">
            <h2 className="font-serif text-4xl font-medium leading-tight text-sastra-ink md:text-[44px]">
              Everything you need for a beautiful invitation
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-12 divide-y divide-sastra-hairline border-y border-sastra-hairline md:grid-cols-2 md:divide-x">
            {features.map((f) => (
              <div key={f.title} className="py-8 pr-6">
                <h3 className="font-serif text-2xl font-medium text-sastra-ink">
                  {f.title}
                </h3>
                <p className="mt-2 max-w-sm text-body-md leading-relaxed text-sastra-dim">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
```

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add "app/(public)/page.tsx"
git commit -m "style: features landing ke grid hairline Sastra"
```

---
## Task 7: Restyle pricing landing — Sastra (konten tidak berubah)

**Files:**
- Modify: `app/(public)/page.tsx` — fungsi `PricingCard` (baris 76-124) + blok `{/* Pricing */}`

- [ ] **Step 1: Restyle fungsi `PricingCard`**

Ganti seluruh fungsi `PricingCard` (di `page.tsx`) dengan versi berpalet Sastra. Struktur, data, harga, dan nama paket **tidak diubah** — hanya token styling:

```tsx
function PricingCard({
  name,
  price,
  popular,
  features,
}: (typeof plans)[number]) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border bg-sastra-surface p-8 ${
        popular ? "border-sastra-ink-soft" : "border-sastra-hairline"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sastra-ink-soft px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface">
          Most Popular
        </span>
      )}
      <div>
        <h3 className="font-serif text-2xl font-medium text-sastra-ink">
          {name}
        </h3>
        <p className="mt-2 text-3xl font-semibold text-sastra-ink">
          {price}
        </p>
        <ul className="mt-6 space-y-2.5">
          {features.map((f) => (
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
        className={`mt-7 w-full rounded-full px-4 py-2.5 text-center text-label-sm font-semibold uppercase tracking-wider transition ${
          popular
            ? "bg-sastra-ink-soft text-sastra-surface hover:bg-sastra-ink"
            : "border border-sastra-ink text-sastra-ink hover:bg-sastra-paper"
        }`}
      >
        Select {name}
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Restyle blok `{/* Pricing */}`**

Ganti seluruh blok `{/* Pricing */}` (dari komentar sampai penutup `</section>` sebelum `</main>`) dengan versi berpalet Sastra. Promo WhatsApp tetap, background section jadi `bg-sastra-paper`, kartu promo border hairline:

```tsx
        {/* Pricing */}
        <section
          id="pricing"
          className="border-t border-sastra-hairline bg-sastra-paper px-8 py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="font-serif text-4xl font-medium leading-tight text-sastra-ink md:text-[44px]">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-body-md leading-relaxed text-sastra-dim">
                Choose the perfect plan for your special day. No hidden fees,
                just beautiful digital invitations crafted with love.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((p) => (
                <PricingCard key={p.name} {...p} />
              ))}
            </div>
            <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-sastra-hairline bg-sastra-surface p-8 text-center">
              <h3 className="font-serif text-2xl font-medium text-sastra-ink">
                Need help deciding?
              </h3>
              <p className="mx-auto mt-2 max-w-md text-body-md text-sastra-dim">
                Prefer to order with the help of our team? We are ready to
                assist you via WhatsApp to create your perfect invitation.
              </p>
              <a
                href={waLink(waOrderMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-sastra-ink-soft px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-sastra-surface transition hover:bg-sastra-ink"
              >
                <IconWhatsApp className="h-4 w-4" />
                Pesan via WhatsApp
              </a>
            </div>
          </div>
        </section>
```

- [ ] **Step 3: Verifikasi + commit**

Run: `npm run lint && npm run build`
Expected: PASS.

```bash
git add "app/(public)/page.tsx"
git commit -m "style: pricing landing ke palet Sastra"
```

---
## Task 8: Restyle `app/(public)/tema/page.tsx`

**Files:**
- Modify: `app/(public)/tema/page.tsx`

- [ ] **Step 1: Terapkan palet Sastra pada galeri tema**

Ubah token Rosewood → Sastra dengan **edits terarah** di file ini (jangan ubah struktur/logika data):
- Baris 34: badge `bg-champagne-surface/60 ... text-rosewood-ink` → `bg-sastra-surface border border-sastra-hairline px-3 py-1 ... text-sastra-ink`
- Baris 37: `text-rosewood-ink` → `text-sastra-ink`
- Baris 40: `text-onsurface-variant` → `text-sastra-dim`
- Baris 48: empty-state `border-dashed border-outline-variant bg-surface text-onsurface-variant` → `border-dashed border-sastra-hairline bg-sastra-surface text-sastra-dim` (pertahankan `border-dashed`)
- Baris 56: kartu `border-champagne-surface bg-white` → `border-sastra-hairline bg-sastra-surface`
- Baris 58: latar monogram `bg-rosewood-ink` → `bg-sastra-ink`
- Baris 67: `text-linen-bg/80` → `text-sastra-surface/80`
- Baris 71: badge `bg-linen-bg/90 ... text-rosewood-ink` → `bg-sastra-paper/95 text-sastra-ink`
- Baris 77: `text-rosewood-ink` → `text-sastra-ink`
- Baris 85: tombol WA `bg-rosewood-ink ... text-linen-bg hover:bg-rosewood-ink/90` → `bg-sastra-ink-soft ... text-sastra-surface hover:bg-sastra-ink`
- Baris 92: tombol "Buat Sendiri" `border-champagne-surface ... text-rosewood-ink hover:bg-surface` → `border-sastra-hairline ... text-sastra-ink hover:bg-sastra-paper`
- Baris 104: kartu promo `border-champagne-surface bg-linen-bg` → `border-sastra-hairline bg-sastra-paper`
- Baris 106: `text-rosewood-ink` → `text-sastra-ink`
- Baris 108: `text-onsurface-variant` → `text-sastra-dim`
- Baris 116: tombol WA promo `bg-rosewood-ink ... text-linen-bg` → `bg-sastra-ink-soft ... text-sastra-surface`
- Baris 37 heading: pertahankan `font-serif` EB Garamond, ganti `text-rosewood-ink` → `text-sastra-ink`.

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add "app/(public)/tema/page.tsx"
git commit -m "style: restyle galeri tema ke palet Sastra"
```

---
## Task 9: Restyle `app/(public)/pricing/page.tsx`

**Files:**
- Modify: `app/(public)/pricing/page.tsx`

- [ ] **Step 1: Terapkan palet Sastra**

Ubah token Rosewood → Sastra via edits terarah (struktur/harga/nama paket **tidak** diubah):
- Baris 57-59: `PricingCard` container — `border-rosewood-ink ... :border-champagne-surface` → `border-sastra-ink-soft ... :border-sastra-hairline`; `bg-white` → `bg-sastra-surface`
- Baris 62: badge `bg-rosewood-ink ... text-linen-bg` → `bg-sastra-ink-soft ... text-sastra-surface`
- Baris 67: `text-rosewood-ink` → `text-sastra-ink`
- Baris 70: `text-rosewood-ink` → `text-sastra-ink`
- Baris 77: `text-onsurface-variant` → `text-sastra-dim`
- Baris 79: `text-rosewood-ink` → `text-sastra-ink-soft`
- Baris 89-90: tombol popular `bg-rosewood-ink text-linen-bg hover:bg-rosewood-ink/90` → `bg-sastra-ink-soft text-sastra-surface hover:bg-sastra-ink`
- Baris 90: tombol non-popular `border-rosewood-ink text-rosewood-ink hover:bg-champagne-surface` → `border-sastra-ink text-sastra-ink hover:bg-sastra-paper`
- Baris 105: heading `text-rosewood-ink` → `text-sastra-ink`
- Baris 108: `text-onsurface-variant` → `text-sastra-dim`
- Baris 119: kartu promo `border-champagne-surface bg-linen-bg` → `border-sastra-hairline bg-sastra-paper`
- Baris 120: `text-rosewood-ink` → `text-sastra-ink`
- Baris 123: `text-onsurface-variant` → `text-sastra-dim`
- Baris 131: tombol WA `bg-rosewood-ink ... text-linen-bg` → `bg-sastra-ink-soft ... text-sastra-surface`
- Ganti semua `rounded-xl` (container, CTA) menjadi `rounded-2xl`/`rounded-full` agar konsisten dengan Task 7 bila tidak mengubah perilaku.

- [ ] **Step 2: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add "app/(public)/pricing/page.tsx"
git commit -m "style: restyle halaman pricing ke palet Sastra"
```

---
## Task 10: Restyle `components/invitation/invitation-page.tsx` (halaman tamu `/[slug]`)

**Files:**
- Modify: `components/invitation/invitation-page.tsx`

> Konten & section (cover, detail acara, cerita, galeri, hadiah, footer) **tidak boleh berubah** — ini visual murni. Terapkan token Sastra via edits terarah.

- [ ] **Step 1: Cover** (baris 26-66)
- Baris 27: `bg-surface` → `bg-sastra-paper`
- Baris 38: placeholder `bg-rosewood-ink` → `bg-sastra-ink`
- Baris 40: gradien `from-rosewood-ink/80 via-rosewood-ink/30 to-linen-bg` → `from-sastra-ink/90 via-sastra-ink/40 to-sastra-paper`
- Baris 42: `text-linen-bg/90` tetap (putih di atas foto) — tidak perlu diubah
- Baris 45: `text-white` tetap; biarkan serif
- Baris 49: `text-linen-bg/95` → `text-sastra-surface/95`

- [ ] **Step 2: Detail Acara** (baris 68-131)
- Baris 71: `text-rosewood-ink` → `text-sastra-ink`
- Baris 77: `text-rosewood-ink/60` → `text-sastra-dim`
- Baris 80: `text-rosewood-ink` → `text-sastra-ink`
- Baris 85: `text-onsurface-variant` → `text-sastra-dim`
- Baris 94, 103, 106, 122: `text-rosewood-ink` → `text-sastra-ink`
- Baris 102: divider `border-champagne-surface` → `border-sastra-hairline`
- Tombol Maps (baris 94 & 122): `bg-rosewood-ink ... text-linen-bg hover:bg-rosewood-ink/90` → `bg-sastra-ink-soft ... text-sastra-surface hover:bg-sastra-ink`

- [ ] **Step 3: Story, Gallery, Gift, Footer** (baris 133-202)
- Baris 135: section `border-champagne-surface bg-linen-bg` → `border-sastra-hairline bg-sastra-paper`
- Baris 136, 148, 169, 180, 193: `text-rosewood-ink` → `text-sastra-ink`
- Baris 139: `text-onsurface-variant` → `text-sastra-dim`
- Baris 159: gambar galeri `rounded-lg` → `rounded-md` (opsional); biarkan object-cover
- Baris 168: section gift `border-t border-champagne-surface bg-linen-bg` → `border-t border-sastra-hairline bg-sastra-paper`
- Baris 172: `text-onsurface-variant` → `text-sastra-dim`
- Baris 176: kartu `border-champagne-surface bg-surface` → `border-sastra-hairline bg-sastra-surface`
- Baris 177: `text-rosewood-ink/60` → `text-sastra-dim`
- Baris 184: `text-onsurface-variant` → `text-sastra-dim`
- Baris 196, 199: `text-onsurface-variant` → `text-sastra-dim`
- Baris 200: `text-rosewood-ink` (ikon heart) → `text-sastra-ink-soft`

- [ ] **Step 4: Verifikasi + commit**

Run: `npm run lint`
Expected: PASS.

```bash
git add components/invitation/invitation-page.tsx
git commit -m "style: restyle halaman tamu publik ke palet Sastra (visual murni)"
```

---
## Task 11: Verifikasi akhir & cek visual browser

**Files:**
- Semua file yang diubah pada Task 1-10

- [ ] **Step 1: Lint + build produksi**

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: build sukses tanpa error (wajib lolos sesuai AGENTS.md).

- [ ] **Step 2: Cek visual tiap halaman publik di browser**

Jalankan `npm run dev`, lalu buka di browser:
1. `/` — hero split editorial, themes bento, features hairline, pricing Sastra
2. `/tema` — galeri tema Sastra
3. `/pricing` — pricing Sastra
4. `/[slug]` (undangan uji/published) — halaman tamu Sastra, mobile-first `max-w-md`

Periksa: kontras (WCAG AA), tidak ada kartu seragam Rosewood tersisa di halaman publik,
header/footer konsisten, href nav Studio sudah `/#features`.

- [ ] **Step 3: Commit final (bila ada perbaikan dari cek visual)**

```bash
git add -A
git commit -m "fix: penyempurnaan visual pass 1 Sastra berdasarkan cek browser"
```

---