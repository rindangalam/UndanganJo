-- ============================================================
-- UndanganJo — Sprint 0: Initial schema
-- Menyiapkan seluruh tabel inti + RLS (aktif sejak migration pertama)
-- Portal: tetap portable ke Supabase self-hosted (tidak ada fitur eksklusif cloud)
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- auto-create profile saat user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS profiles
create policy "Read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- packages
-- ============================================================
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price bigint not null,              -- harga dalam Rupiah
  description text,
  max_photos integer not null default 20,
  has_music boolean not null default false,
  has_video boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.packages enable row level security;

create policy "Read packages (public)"
  on public.packages for select
  using (true);

create policy "Admin manage packages"
  on public.packages for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- themes
-- ============================================================
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  thumbnail_url text,
  is_premium boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.themes enable row level security;

create policy "Read themes (public)"
  on public.themes for select
  using (true);

create policy "Admin manage themes"
  on public.themes for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- invitations
-- customer_id boleh NULL jika dibuat admin (jalur WhatsApp/admin-assisted)
-- ============================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  package_id uuid references public.packages (id),
  theme_id uuid references public.themes (id),
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'menunggu_bayar', 'published')),

  -- data acara (FR-C1)
  groom_name text,
  bride_name text,
  akad_date date,
  akad_time time,
  akad_location text,
  akad_maps_url text,
  reception_date date,
  reception_time time,
  reception_location text,
  reception_maps_url text,

  -- konten
  story text,                          -- FR-C4 cerita pasangan
  gift_name text,                      -- FR-C5 info hadiah digital
  gift_account text,
  gift_info text,
  music_url text,                      -- FR-C3 musik latar

  -- jalur admin-assisted (PRD Bagian 8 / FR-C8, FR-G7)
  created_by_admin boolean not null default false,
  customer_name text,
  customer_phone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

-- updated_at trigger helper
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.invitations
  for each row execute function public.handle_updated_at();

-- RLS invitations
-- Publik hanya melihat yang published (FR-D4); owner melihat & mengelola miliknya
create policy "Read published invitations (public)"
  on public.invitations for select
  using (status = 'published');

create policy "Own invitations: select"
  on public.invitations for select
  using (auth.uid() = customer_id);

create policy "Own invitations: insert"
  on public.invitations for insert
  with check (auth.uid() = customer_id);

create policy "Own invitations: update"
  on public.invitations for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- ============================================================
-- guests (RSVP, FR-E1)
-- ============================================================
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null,
  attending boolean,
  guest_count integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.guests enable row level security;

-- tamu RSVP tanpa login
create policy "Insert RSVP (public)"
  on public.guests for insert
  with check (true);

-- owner undangan melihat rekap RSVP (FR-E3)
create policy "Owner view RSVP"
  on public.guests for select
  using (
    auth.uid() = (
      select customer_id from public.invitations where id = invitation_id
    )
  );

-- ============================================================
-- wishes (guestbook, FR-E2)
-- ============================================================
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null,
  message text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

-- publik memberi ucapan (termasuk select, tampil di halaman publik FR-E2)
create policy "Insert wish (public)"
  on public.wishes for insert
  with check (true);

create policy "Read wishes (public)"
  on public.wishes for select
  using (true);

-- owner/owner undangan menghapus ucapan tidak pantas (FR-E4)
create policy "Owner delete wish"
  on public.wishes for delete
  using (
    auth.uid() = (
      select customer_id from public.invitations where id = invitation_id
    )
  );

-- ============================================================
-- orders
-- ------------------------------------------------------------
-- payment_method: 'gateway' | 'manual' (FR-F5)
-- confirmed_by & payment_proof_url mendukung jalur admin-assisted (PRD Bagian 8)
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations (id) on delete set null,
  customer_id uuid references public.profiles (id) on delete set null,
  package_id uuid references public.packages (id),
  amount bigint not null,               -- nominal dalam Rupiah
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  payment_method text not null default 'gateway'
    check (payment_method in ('gateway', 'manual')),
  gateway_name text,                    -- 'midtrans' | 'xendit' (diisi Sprint 4)
  gateway_transaction_id text,
  confirmed_by uuid references public.profiles (id),
  payment_proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create trigger set_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- RLS orders: owner melihat order miliknya; pembuatan order handled by service role / gateway webhook
create policy "Owner view orders"
  on public.orders for select
  using (auth.uid() = customer_id);

-- ============================================================
-- Storage buckets (foto galeri & musik — Sprint 2)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('music', 'music', true)
on conflict (id) do nothing;

-- RLS storage: siapa pun boleh baca; tulis dibatasi (detail upload di Sprint 2)
create policy "Public read storage"
  on storage.objects for select
  using (bucket_id in ('gallery-photos', 'music'));

create policy "Authenticated upload storage"
  on storage.objects for insert
  with check (bucket_id in ('gallery-photos', 'music') and auth.role() = 'authenticated');
