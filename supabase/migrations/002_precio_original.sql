-- Agrega "precio original en tienda" a los productos.
-- Pega esto en Supabase → SQL Editor → New query → Run (solo una vez).
alter table public.products add column if not exists original_url text;
alter table public.products add column if not exists original_price numeric(12,2);
