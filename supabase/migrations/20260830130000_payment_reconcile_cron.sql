-- Jaring pengaman rekonsiliasi pembayaran (pg_cron + pg_net)
-- Memanggil endpoint /api/cron/reconcile secara berkala untuk memproses
-- order gateway pending yang webhook-nya tidak datang.
--
-- KONFIGURASI:
--  1. public.cron_settings key 'reconcile_url'    -> endpoint base (tanpa secret)
--  2. public.cron_settings key 'reconcile_secret' -> header x-cron-secret (isi manual via editor, JANGAN di git)
--
-- Secret sengaja TIDAK di-seed di migration agar tidak bocor ke repo.
-- Isi 'reconcile_secret' setelah migration di-apply (lihat langkah di file ini).

-- 1) Aktifkan ekstensi (idempotent).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Tabel konfigurasi internal cron.
create table if not exists public.cron_settings (
  key   text primary key,
  value text not null
);

-- Seed URL endpoint rekonsiliasi (nilai publik/host, tidak sensitif).
insert into public.cron_settings (key, value)
values ('reconcile_url', 'https://undangan-jo.vercel.app/api/cron/reconcile')
on conflict (key) do nothing;

-- Batasi akses tabel konfigurasi: hanya boleh dibaca/ditulis via fungsi definer,
-- bukan oleh peran public/anonymous.
revoke all on public.cron_settings from public, anon, authenticated, service_role;

-- 3) Fungsi yang memanggil endpoint reconcile via pg_net.
create or replace function public.cron_reconcile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _url    text;
  _secret text;
  _headers jsonb;
begin
  select value into _url    from public.cron_settings where key = 'reconcile_url'    limit 1;
  select value into _secret from public.cron_settings where key = 'reconcile_secret' limit 1;

  if _url is null or _secret is null or _secret = '' or _secret = 'CHANGE_ME' then
    -- Belum dikonfigurasi — jangan panggil endpoint.
    return;
  end if;

  _headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-cron-secret', _secret
  );

  perform net.http_post(
    url     := _url,
    body    := '{}'::jsonb,
    headers := _headers
  );
end;
$$;

grant execute on function public.cron_reconcile() to postgres;

-- 4) Jadwalkan job tiap 5 menit (ha-pus job lama lalu buat ulang => idempotent).
do $$
begin
  perform cron.unschedule('reconcile-orders') where exists (
    select 1 from cron.job where jobname = 'reconcile-orders'
  );
end;
$$;

select cron.schedule(
  'reconcile-orders',
  '*/5 * * * *',
  'select public.cron_reconcile();'
);

-- ============================================================================
-- LANGKAH SETELAH MIGRATION DI-APPLY (isi secret, jangan lewat git):
--   update public.cron_settings
--   set value = '<CRON_SECRET>'
--   where key = 'reconcile_secret';
-- ============================================================================
