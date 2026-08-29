-- ============================================================
-- UndanganJo — Sprint 3 (fix): Cegah self-escalation role admin
-- -----------------------------------------------------------------
-- Kerentanan: policy "Update own profile" lama hanya cek auth.uid()=id,
-- sehingga user yang login bisa `update ... set role='admin'` pada barisnya
-- sendiri, lalu menjadi admin. Karena seluruh RLS admin kini bergantung
-- pada profiles.role, lubang ini HARUS ditutup.
--
-- Perbaikan: user hanya boleh menyimpan role='customer'; role='admin' hanya
-- boleh di-set oleh admin (is_admin) / service role / operator via SQL.
-- ============================================================

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (role = 'customer' or public.is_admin())
  );

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and (role = 'customer' or public.is_admin())
  );
