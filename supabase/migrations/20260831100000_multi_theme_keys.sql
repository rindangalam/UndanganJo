-- Multi-theme system: add unique machine key so [slug] can select the renderer.
alter table public.themes add column key text;

-- Backfill existing rows with a deterministic key from their name.
update public.themes
set key = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where key is null or key = '';

-- Assign canonical keys where names match known themes.
update public.themes set key = 'noir'      where name = 'Modern Noir';
update public.themes set key = 'garden'    where name = 'Garden Élégant';
update public.themes set key = 'romantic'  where name = 'Rosewood Manor';

alter table public.themes alter column key set not null;
create unique index themes_key_unique on public.themes (key);

-- Upsert the 5 registry themes by key (idempotent).
insert into public.themes (name, key, is_premium, is_active)
values
  ('Sastra',         'sastra',      false, true),
  ('Modern Noir',    'noir',        false, true),
  ('Garden Élégant', 'garden',      false, true),
  ('Terracotta',     'terracotta',  true,  true),
  ('Rosewood Manor', 'romantic',    true,  true)
on conflict (key) do update
  set name = excluded.name,
      is_premium = excluded.is_premium,
      is_active = true;
