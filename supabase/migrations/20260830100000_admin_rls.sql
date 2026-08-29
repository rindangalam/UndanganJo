-- ============================================================
-- UndanganJo — Sprint 3: Admin Role & RLS (Opsi A)
-- Otorisasi admin dicek via kolom `profiles.role` (bukan JWT claim),
-- agar tetap portable ke Supabase self-hosted (prinsip AGENTS.md Bagian 6).
-- Catatan: role inisial admin di-set manual via SQL operator:
--   update public.profiles set role = 'admin' where email = '<email-admin>';
-- ============================================================

-- Helper: apakah user yang sedang login adalah admin?
-- Membaca dari kolom profiles.role milik dirinya sendiri (RLS tetap berlaku).
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- profiles — admin boleh melihat semua profil (verifikasi identitas)
-- ============================================================
create policy "Admin read profiles"
  on public.profiles for select
  using (public.is_admin());

-- ============================================================
-- orders — admin kelola semua order (FR-G2, FR-G8)
-- select: daftar semua; insert: buat order manual; update: tandai lunas
-- ============================================================
create policy "Admin select orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admin insert orders"
  on public.orders for insert
  with check (public.is_admin());

create policy "Admin update orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- invitations — admin kelola undangan lintas customer (FR-G3, FR-G7)
-- insert: boleh membuat undangan dengan customer_id kosong (jalur manual)
-- ============================================================
create policy "Admin select invitations"
  on public.invitations for select
  using (public.is_admin());

create policy "Admin insert invitations"
  on public.invitations for insert
  with check (public.is_admin());

create policy "Admin update invitations"
  on public.invitations for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- guests — admin lihat rekap RSVP semua undangan (FR-E3)
-- ============================================================
create policy "Admin select guests"
  on public.guests for select
  using (public.is_admin());

-- ============================================================
-- wishes — admin lihat & moderasi ucapan (FR-E4)
-- ============================================================
create policy "Admin select wishes"
  on public.wishes for select
  using (public.is_admin());

create policy "Admin delete wishes"
  on public.wishes for delete
  using (public.is_admin());

-- ============================================================
-- Perbaikan konsistensi: packages & themes memakai profil.role
-- (sebelumnya salah pakai `auth.jwt() ->> 'role'` yang bukan sumber kebenaran)
-- ============================================================
drop policy if exists "Admin manage packages" on public.packages;
create policy "Admin manage packages"
  on public.packages for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin manage themes" on public.themes;
create policy "Admin manage themes"
  on public.themes for all
  using (public.is_admin())
  with check (public.is_admin());
