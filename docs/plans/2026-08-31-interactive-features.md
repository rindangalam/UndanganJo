# Interactive Invitation Features — RSVP, Guestbook, Music, Countdown

> **Status: DONE** — implemented, lint + build pass, browser-verified on a full-size theme QA route.

**Goal:** Close the 3 functional gaps against the PRD MVP:
1. RSVP + Buku Ucapan (FR-E1–E4)
2. Musik autoplay + tombol mute di template (FR-D2)
3. Countdown acara (FR-D3)

**Architecture:** Shared, theme-consistent **client components** (`components/invitation/*`) that accept Tailwind class-string props per theme, wired into all 5 templates (`components/theme/templates/*`). Previews (edit gallery + editor) render in a lightweight `preview` mode that skips the interactive sections. Owner/admin rekap + moderasi pages added under `/dashboard/[id]/guests` and `/admin/guests`.

---

## Files Created

- **`components/invitation/rsvp-guestbook.tsx`** (client)
  - RSVP form (nama, Hadir/Tidak Hadir, jumlah orang) → inserts into `public.guests`.
  - Guestbook (nama + ucapan) → reads `public.wishes` filtered `is_approved = true`, inserts new wish.
  - Skips wishes fetch when `invitationId` is not a valid UUID (prevents failed queries on mock preview ids).
  - Accepts `palette` (accent/ink/dim/surface/hairline class strings) for per-theme styling.
- **`components/invitation/music-player.tsx`** (client)
  - Floating, fixed bottom-right button; `src = invitation.music_url`; autoplay begins on first tap (browsers block true autoplay); toggle play/pause; revealed after 600ms.
- **`components/invitation/countdown.tsx`** (client)
  - Ticks every second to `akad_date ?? reception_date`; renders `--` placeholders until mounted to avoid server/client hydration mismatch.
- **`app/(customer)/dashboard/[id]/guests/page.tsx`** (server) + `delete-wish-button.tsx` (client)
  - Owner-only rekap: RSVP table + guestbook list with per-wish delete (owner RLS delete; FR-E4). Linked from each dashboard card.
- **`app/admin/guests/page.tsx`** (server) + `delete-wish-button.tsx` (client)
  - Admin rekap RSVP per invitation + global wish moderation with delete (admin RLS select/delete).

## Files Modified

- **`components/theme/registry.tsx`** — `ThemeTemplateProps` gains optional `preview?: boolean`; `renderTheme(key, invitation, preview=false)`.
- **`components/theme/templates/{sastra,noir,garden,terracotta,romantic}.tsx`** — accept `preview`, wrap `Countdown`/`RsvpGuestbook`/`MusicPlayer` in `{!preview && ...}`; import the 3 client components; compute `countdownTarget`.
- **`app/(public)/tema/page.tsx`** & **`app/(customer)/dashboard/[id]/edit/invitation-editor.tsx`** — pass `preview=true` to `renderTheme` so galleries/editor stay lightweight.
- **`app/(customer)/dashboard/page.tsx`** — add "RSVP & Ucapan" link (`IconGroup`) to each invitation card.
- **`app/admin/admin-sidebar.tsx`** — add `guests` nav item ("RSVP & Ucapan").

## RLS / Schema Note (no migration required)

Existing schema already supports the features (confirmed from `20260829000000_init.sql` + `20260830100000_admin_rls.sql`):
- `guests`: public insert (`with check true`), owner select, admin select.
- `wishes`: public insert, public select (unfiltered — public page filters `is_approved = true` in the query), **owner delete**, **admin select + delete**. Moderasi berbasis **hapus** (tidak ada update policy untuk `is_approved`).

## Theme Palettes Wired

| theme | accent | ink | dim | surface | hairline |
|---|---|---|---|---|---|
| sastra | `sastra-ink-soft` / `sastra-surface` | `sastra-ink` | `sastra-dim` | `sastra-surface` | `sastra-hairline` |
| noir | `#d4af37` / `#111` | `#e8e6e1` | `#9a9a94` | `#161616` | `#2a2a2a` |
| garden | `#3f5a3a` / white | `#26331f` | `#5f6f55` | `#f6faf2` | `#dbe6d2` |
| terracotta | `#b4552d` / white | `#3a2419` | `#8a6a52` | `#faf3e8` | `#e5d2ba` |
| romantic | `#c26b78` / white | `#4a2229` | `#9a6a72` | `#fdf3f4` | `#ecd6da` |

## Verification Performed

- `npm run lint` — PASS (0 errors).
- `npm run build` — PASS (18/18 routes; `/admin/guests` + `/dashboard/[id]/guests` present).
- Browser QA (temp `/theme-qa` route, Sastra, lalu dihapus):
  - Countdown renders dan berdetak (102 Hari / 12 Jam / 16 Menit / 42 Detik → update live).
  - RSVP form + "Hadir/Tidak Hadir" reveal + "JUMLAH ORANG" select render.
  - Guestbook render dengan empty state; fetch UUID asli tanpa error console.
  - Submit RSVP manual → DB merespons **409** (FK): RLS `with check(true)` **lolos**; satu-satunya blocker adalah id invitation mock yang tidak ada di tabel `invitations` — tidak mungkin terjadi di `/[slug]` asli yang memakai id asli. Ini memverifikasi jalur insert + RLS.
  - Perbaiki hydration mismatch (countdown `--` placeholder) + a11y (tambah `name` attrs).

## Notes / Follow-ups

- Dev DB (`xxhowlom...`) belum punya **invitations**, jadi render penuh `/[slug]` dengan undangan asli belum diuji langsung; diverifikasi lewat QA route ukuran penuh.
- Moderasi `is_approved` bersifat delete-only mengingat RLS saat ini; jika ingin UI approve/reject, perlu update policy `wishes` (owner/admin) + migration kecil.
