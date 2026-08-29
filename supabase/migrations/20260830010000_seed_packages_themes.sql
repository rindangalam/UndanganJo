-- Sprint 2: dukung filter tema sesuai paket + seed awal paket & tema.
-- Akses tema premium ditentukan per paket (FR-C6).
alter table public.packages
  add column premium_themes boolean not null default false;

-- Seed paket (contoh draft dari PRD Bagian 10 — sesuaikan/dikelola via admin panel nanti)
insert into public.packages (name, price, description, max_photos, has_music, has_video, premium_themes, is_active)
values
  ('Basic',   150000, '1 tema standar, RSVP & ucapan, maks. 20 foto, tanpa musik', 20, false, false, false, true),
  ('Premium', 300000, 'Pilihan beberapa tema, RSVP unlimited, musik latar, maks. 50 foto', 50, true, false, true, true),
  ('Deluxe',  500000, 'Semua fitur Premium + galeri video, prioritas dukungan', 50, true, true, true, true);

-- Seed tema awal (thumbnail diisi dari dashboard/admin saat tersedia)
insert into public.themes (name, is_premium, is_active)
values
  ('Modern Noir', false, true),
  ('Rosewood Manor', true, true),
  ('Garden Élégant', false, true);
