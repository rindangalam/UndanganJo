-- Sprint 2: tambah penyimpanan galeri foto pada undangan.
-- Foto disimpan di Supabase Storage; daftar URL-nya disimpan di sini.
alter table public.invitations
  add column gallery_photos text[] not null default '{}';
