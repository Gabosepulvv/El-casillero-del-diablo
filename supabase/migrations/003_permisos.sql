-- Arregla el error "permission denied for table products".
-- Algunos proyectos nuevos de Supabase no dan permisos automáticos a las tablas
-- creadas por SQL. Esto le da acceso SOLO al servidor (service_role / secret key).
-- El público sigue sin acceso directo (RLS activado y sin políticas).
-- Pega esto en Supabase → SQL Editor → New query → Run (solo una vez).
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
