---
name: UndanganJo
colors:
  rosewood-ink: '#4A2C2A'
  linen-bg: '#F9F6F1'
  champagne-surface: '#E5D3C0'
  charcoal-text: '#1A1A1B'
  surface: '#fcf8f9'
  surface-container-low: '#f6f3f4'
  surface-container: '#f0edee'
  surface-container-high: '#eae7e8'
  surface-container-highest: '#e5e2e3'
  on-surface: '#1b1b1c'
  on-surface-variant: '#504443'
  outline: '#827472'
  outline-variant: '#d4c3c1'
  primary: '#321716'
  on-primary: '#ffffff'
  primary-container: '#4a2c2a'
  secondary: '#695c4d'
  secondary-container: '#f2e0cc'
  tertiary: '#1f1f1c'
  error: '#ba1a1a'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  inverse-surface: '#303031'
  inverse-on-surface: '#f3f0f1'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  DEFAULT: 0.125rem
  lg: 0.25rem
  xl: 0.5rem
  full: 0.75rem
spacing:
  margin-page: 2rem
  gutter: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  section-gap: 5rem
---

# DESIGN.md — UndanganJo

> **Product:** UndanganJo — Platform Undangan Online
> **Design version:** 1.1 (Rosewood Manor)
> **Date:** 29 August 2026
> **Frontend:** Next.js App Router + TypeScript
> **Backend:** Supabase
> **Deployment:** Vercel
> **Design principle:** Premium, intimate, editorial, fast, intentional. No AI-slop UI.
> **Design source:** Stitch project "Custom Web Design Project" (ID `2858589458526247760`), tema **Rosewood Manor**.

---

## 1. Design Direction

UndanganJo bukan dashboard SaaS yang kebetulan menjual undangan.

Produk ini harus terasa seperti **studio undangan pernikahan digital premium**. Public website menjual rasa dan kepercayaan; invitation page menjadi pengalaman emosional; dashboard/admin menjadi alat kerja yang cepat dan jelas. Keseluruhan aplikasi mengikuti tema editorial **Rosewood Manor** — hangat, romantis, dan premium.

### Core adjectives

- Elegant
- Warm
- Editorial
- Romantic, tetapi tidak cheesy
- Calm
- Premium
- Human
- Photographic
- Intentional

### Avoid

- Glassmorphism
- Excessive gradients
- Neon colors
- Huge rounded cards everywhere
- Generic SaaS dashboard
- Excessive shadows
- Floating blobs
- Random decorative shapes
- Excessive animated text
- "AI-generated landing page" visual patterns
- Every section having a different visual language
- Animation yang hanya dibuat untuk terlihat ramai

---

## 2. Color System — Rosewood Manor

Palet resmi disetujui untuk seluruh aplikasi (menggantikan palet dasar Ink/Deep Rose sebelumnya).

```text
Rosewood Ink:      #4A2C2A   (aksen utama / teks judul / tombol CTA)
Linen Background:  #F9F6F1   (latar halaman utama)
Champagne Surface: #E5D3C0   (border halus / aksen permukaan hangat)
Charcoal Text:     #1A1A1B   (teks kontras)
```

Token tambahan (Material 3 surface/state):

| Konteks | Warna |
| --- | --- |
| Background halaman | `#fcf8f9` (surface) / `#F9F6F1` (linen-bg) |
| Card surface | `#f6f3f4` (surface-container-low) |
| Card surface lebih tinggi | `#eae7e8` / `#e5e2e3` |
| Teks utama | `#1b1b1c` (on-surface) / `#1A1A1B` (charcoal) |
| Teks sekunder | `#504443` (on-surface-variant) |
| Outline / border | `#827472` (outline), `#d4c3c1` (outline-variant), `#E5D3C0` (champagne) |
| Aksesoris champagne | `#E5D3C0` |
| Detail rosewood dalam | `#4A2C2A` (primary-container / rosewood-ink) |

---

## 3. Typography

### Sans
- **Geist** — body, label, navigasi (weight 400 / 500 / 600)

### Serif (display/headline)
- **EB Garamond** — judul besar, nama mempelai, elemen editorial (weight 500, italic untuk aksen)

### Scale

| Level | Font | Size | Weight | Line-height | LS |
| --- | --- | --- | --- | --- | --- |
| display-lg | EB Garamond | 48px | 500 | 1.1 | -0.02em |
| display-lg-mobile | EB Garamond | 36px | 500 | 1.2 | — |
| headline-md | EB Garamond | 32px | 500 | 1.2 | — |
| headline-sm | EB Garamond | 24px | 500 | 1.3 | — |
| title-lg | Geist | 20px | 600 | 1.5 | — |
| body-lg | Geist | 18px | 400 | 1.6 | — |
| body-md | Geist | 16px | 400 | 1.6 | — |
| label-md | Geist | 14px | 500 | 1.4 | 0.05em |
| label-sm | Geist | 12px | 600 | 1.2 | 0.02em |

---

## 4. Border Radius

- Small controls: 4px (`rounded`)
- Buttons: 4–8px (`rounded` / `rounded-lg`)
- Cards / mockup: 8px (`rounded-lg`)
- Avatar / pill: 12px (`rounded-xl`) / `rounded-full`

---

## 5. Sumber (Stitch Project)

Informasi di atas diambil dari project Stitch berikut, untuk direferensikan kembali saat mendesain:

- **Project:** Custom Web Design Project (ID: `2858589458526247760`)
- **Layar:** Home (Rosewood Manor), Paket & Harga, Dashboard, Builder, Undangan Sarah & Alexander, Admin Kelola Pesanan, Demo Modern Noir, Design System
- **Theme:** Light, EB Garamond headline / Geist body, roundness `ROUND_EIGHT`
- **Palet kunci:** `rosewood-ink #4A2C2A`, `linen-bg #F9F6F1`, `champagne-surface #E5D3C0`
