-- Sprint 5: Feature Tier 1 + restrukturisasi paket jadi 2 tier berbayar.
-- 1) Nonaktifkan 3 paket lama (Basic/Premium/Deluxe) -> 2 paket baru: Standar & Premium.
-- 2) Tambah kolom konten baru di invitations: livestream_url, video_url.
-- 3) Tabel invitation_views untuk pelacak tamu yang membuka undangan.

-- ============================================================
-- 1. Restrukturisasi paket menjadi 2 tier (semua berbayar)
-- ============================================================
-- Paket lama tidak dihapus (anti-putus FK package_id yang sudah terpakai),
-- hanya dinonaktifkan supaya tidak tampil di /pricing & /dashboard/new.
update public.packages set is_active = false where is_active = true;

-- Standar: fitur inti, 1 tema (non-premium), tanpa musik/video.
insert into public.packages (name, price, description, max_photos, has_music, has_video, premium_themes, is_active)
values
  ('Standar', 50000, '1 tema standar, data acara, Google Maps, cerita, galeri foto, musik, countdown, RSVP & buku ucapan, amplop digital', 20, true, false, false, true),
  ('Premium', 100000, 'Semua fitur Standar + semua tema, galeri video, livestream, QR check-in, export RSVP, pelacak buka undangan, wishlist kado, kirim undangan via WhatsApp, custom link nama tamu', 50, true, true, true, true);

-- ============================================================
-- 2. Kolom konten baru di invitations
-- ============================================================
alter table public.invitations
  add column livestream_url text,
  add column video_url text;

-- ============================================================
-- 3. Pelacak buka undangan (invitation_views)
-- ============================================================
create table public.invitation_views (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  viewed_at timestamptz not null default now()
);

alter table public.invitation_views enable row level security;

-- Publik boleh mencatat view (tanpa auth) saat membuka undangan.
create policy "Insert invitation view (public)"
  on public.invitation_views for insert
  with check (true);

-- Owner & admin melihat rekap view.
create policy "Viewer can select own invitation views"
  on public.invitation_views for select
  using (
    auth.uid() = (select customer_id from public.invitations where id = invitation_id)
  );
