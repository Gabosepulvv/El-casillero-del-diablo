-- ════════════════════════════════════════════════════════════════
--  El Casillero del Diablo — esquema de base de datos
--  Pega TODO esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- Productos
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  price       numeric(12,2) not null check (price >= 0),
  condition   smallint not null check (condition between 1 and 10),
  category    text not null default 'Otros',
  images      text[] not null default '{}',
  sold        boolean not null default false,
  sold_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists products_created_idx on public.products (created_at desc);

-- Ofertas
create table if not exists public.offers (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  amount       numeric(12,2) not null check (amount > 0),
  contact_type text not null check (contact_type in ('phone', 'instagram')),
  contact      text not null,
  name         text,
  message      text,
  seen         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists offers_product_idx on public.offers (product_id);
create index if not exists offers_created_idx on public.offers (created_at desc);

-- Seguridad: RLS activado SIN políticas públicas.
-- Solo el servidor (con la service_role key) puede leer/escribir.
alter table public.products enable row level security;
alter table public.offers   enable row level security;

-- Bucket público para las fotos de productos
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;
