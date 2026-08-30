# Design — Pass 1 "Sastra" (ink & ivory editorial) pada Frontend Publik

- Tanggal: 2026-08-30
- Status: Draft, menunggu review user
- Lingkup: Halaman publik saja (`/`, `/tema`, `/pricing`, `/[slug]`, header, footer). Dashboard customer, admin panel, dan halaman preview tema (`/tema/modern-noir`) **tidak disetuh** pada pass ini.

## 1. Konteks & Motivasi

Frontend saat ini terasa "biasa" (palet Rosewood krem+brass yang generik; banyak section
duplikat berupa kartu-kartu seragam). User ingin kesan **premium & berkarakter**.

Arah visual yang dipilih user (via mockup): **Sastra — ink & ivory editorial**:
kertas ivory, tinta hampir-hitam, satu aksen hijau tua, serif editorial untuk display,
banyak whitespace, hairline tipis alih-alih kartu/kotak tebal, layout asimetris.

Prinsip yang dijaga (dari taste skill):
- Maksimal 1 accent color. Hindari klise "AI-tell" (gradient ungu, glassmorphism generik,
  kartu seragam, eyebrow di setiap section).
- Landing halaman publik & halaman tamu mobile-first.
- Semua perubahan semurni visual + 1 fix kecil pada nav; tidak ada perubahan schema/route/data.
- Tetap RSC aman dan `npm run build`/`npm run lint` lolos.

## 2. Palet & Token (globals.css)

Token Rosewood lama **tetap** (dipakai dashboard/admin). Tambahkan token baru untuk Sastra:

| Token CSS | Nilai | Pemakaian |
|---|---|---|
| `--color-sastra-paper` | `#f7f5f0` | latar halaman utama |
| `--color-sastra-surface` | `#fbfaf7` | permukaan kartu/panel |
| `--color-sastra-ink` | `#161612` | teks utama / judul |
| `--color-sastra-ink-soft` | `#4a5b4f` | aksen hijau tua (satu-satunya accent) |
| `--color-sastra-hairline` | `#e4e0d6` | border/garis tipis |
| `--color-sastra-dim` | `#8d8a80` | teks sekunder / deskripsi |

Font: tetap pakai `EB Garamond` (display serif) + `Geist` (UI sans) yang sudah ada di
`app/layout.tsx` & `--font-serif`/`--font-sans`. Tidak menambah font/dependency baru.

Rules visual:
- Tombol solid → `bg-sastra-ink-soft text-sastra-surface`; outline → `border-sastra-ink text-sastra-ink`.
- Border antar-section → `border-t/border-y hairline` alih-alih kartu border tebal.
- Jarak section rapat utuh `py-20`/`py-24`, grid gap lebar, headline serif + kontras kuat.

## 3. Halaman yang Disentuh

### 3.1 Header & Footer (`components/site-header.tsx`, `components/site-footer.tsx`)
- Header: hairline border, background ivory dengan blur (`bg-sastra-paper/90 backdrop-blur`),
  wordmark dalam serif (font brand), item nav kanan dalam sans kecil, CTA hijau. **Fix kecil:**
  item nav "Studio" yang semula salah arah ke `/pricing` → ubah tujuan ke `/#features`.
- Footer: teks & link memakai token Sastra, hairline atas, tetap 1 baris (tidak ubah struktur).

### 3.2 Landing (`app/(public)/page.tsx`)
- **Hero**: layout split editorial — teks kiri (label kecil + h1 serif + deskripsi + 2 CTA),
  kanan foto full-bleed (tanpa kartu "The Details" miring yang generik; boleh diganti
  elemen caption editorial kecil bila perlu). Mobile: stack.
- **Themes showcase**: layout bento editorial (variasi ukuran) bukan 3 kartu identik; judul
  serif; item dapat tetap pakai data statis yang ada.
- **Features**: hapus eyebrow berlebihan (aturan max 1 per 3 section); ubah 4 kartu seragam
  menjadi grid dengan aksen hairline / layout asimetris.
- **Pricing**: paket & harga **tidak diubah** (keputusan produk); hanya styling ulang
  (kartu border hairline, badge populer tetap, CTA hijau). CTA WhatsApp memakai palet baru.
- Eyebrows total di landing dikurangi sesuai aturan taste (maks ~1 per 3 section).

### 3.3 Galeri Tema (`app/(public)/tema/page.tsx`)
- Header section besar serif editorial; badge kecil; kartu tema border hairline,
  latar monogram `sastra-ink`, tombol WhatsApp hijau, tombol "Buat Sendiri" outline.
- Struktur grid & data tema (dari DB) tidak diubah.

### 3.4 Pricing (`app/(public)/pricing/page.tsx`)
- Polish visual sejalan (token Sastra, hairline, CTA hijau). Harga, nama paket, dan struktur
  konten **tidak diubah**.

### 3.5 Halaman Tamu (`components/invitation/invitation-page.tsx` dipakai oleh `/[slug]`)
- Visual murni; **tidak ada perubahan konten/section** (cover, detail acara, cerita, galeri,
  hadiah, footer bawah yang ada dipertahankan).
- Cover: overlay gradien ink→ivory, judul serif putih; feather tipis; tombol Maps hijau.
- Detail acara / story / galeri / hadiah / footer: ikut palet & hierarki Sastra.
- Tetap `max-w-md` mobile-first, `min-h-[100svh]` (sudah ada).

## 4. Non-Lingkup Pass Ini (untuk pass berikutnya)

- Dashboard customer (`/(customer)/dashboard*`) & seluruh admin (`/admin*`).
- Halaman `/tema/modern-noir` (preview tema lengkap).
- Perubahan konten/copy produk (harga, nama paket, fitur); semua keputusan produk tetap
  di tangan user.
- Migrasi skema / RLS / route / API.

## 5. Evaluasi & Penerimaan

- `npm run build` dan `npm run lint` wajib lolos.
- Kontras teks memenuhi WCAG AA (ink/hairline pada paper/surface, aksen hijau dgn teks ivory).
- Semua halaman publik tetap RSC-safe (mockup ini statis; tidak tambah `"use client"` kecuali
  benar-benar perlu untuk interaksi yang sudah ada).
- Cek visual di browser untuk tiap halaman publik setelah implementasi.