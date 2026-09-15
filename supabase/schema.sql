create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text,
  half_price numeric(10,2),
  full_price numeric(10,2),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists items_category_id_idx on public.items(category_id);
create index if not exists items_active_idx on public.items(is_active);
create index if not exists banners_active_idx on public.banners(is_active);

alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.banners enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
on public.categories for select using (true);

drop policy if exists "public read active items" on public.items;
create policy "public read active items"
on public.items for select using (is_active = true);

drop policy if exists "public read active banners" on public.banners;
create policy "public read active banners"
on public.banners for select using (is_active = true);

insert into public.categories (name, sort_order) values
('Momos',1), ('Spl. Momos',2), ('Veg. Chowmein',3), ('Non-Veg. Chowmein',4),
('Potato',5), ('Chinese Veg Dry/Gravy',6), ('Maggi',7), ('Roll',8),
('Veg Fried Rice',9), ('Non-Veg Fried Rice',10), ('Beverages',11)
on conflict (name) do nothing;

-- Storage:
-- In Supabase Dashboard -> Storage, create a PUBLIC bucket named:
-- restaurant-images
-- Then the app can upload banner/item images there using the service role key.

























-- Restaurant settings
create table if not exists public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  address text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default now()
);

-- Create the default settings row
insert into public.restaurant_settings (address, phone)
select
  'Rawata Mor Chowk, New Delhi - 110073',
  '9625346361'
where not exists (
  select 1 from public.restaurant_settings
);

-- Public website can read restaurant settings
alter table public.restaurant_settings enable row level security;

drop policy if exists "public read restaurant settings"
on public.restaurant_settings;

create policy "public read restaurant settings"
on public.restaurant_settings
for select
using (true);