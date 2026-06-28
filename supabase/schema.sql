-- =========================================================================
-- VITACORA — Supabase schema
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Tabla de entradas
-- -------------------------------------------------------------------------
create table if not exists public.entradas (
  id          text        primary key,          -- "0001", "0002", …
  fecha       date        not null,
  tema        text        not null,
  titulo      text        not null,
  resumen     text        not null,
  imagen      text        default null,
  imagen_alt  text        default null,
  contenido_html text     not null default '',
  publicado   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_entradas_updated_at on public.entradas;
create trigger trg_entradas_updated_at
  before update on public.entradas
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------------------------
-- 2. Tabla de temas (catálogo)
-- -------------------------------------------------------------------------
create table if not exists public.temas (
  slug   text primary key,
  label  text not null,
  color  text not null default '#555555'
);

-- Temas por defecto
insert into public.temas (slug, label, color) values
  ('tecnologia',  'Tecnología',          '#5B7065'),
  ('desarrollo',  'Desarrollo Personal',  '#8B3A2B'),
  ('lecturas',    'Lecturas',             '#4A5D7A'),
  ('cuerpo',      'Cuerpo y Movimiento',  '#9C6B30'),
  ('reflexiones', 'Reflexiones',          '#6B5B7A')
on conflict (slug) do nothing;

-- -------------------------------------------------------------------------
-- 3. RLS — Row Level Security
-- -------------------------------------------------------------------------
alter table public.entradas enable row level security;
alter table public.temas    enable row level security;

-- Cualquiera puede LEER entradas publicadas (visitantes sin login)
create policy "entradas_public_read"
  on public.entradas for select
  using (publicado = true);

-- Solo el admin puede INSERT / UPDATE / DELETE
-- Cambia 'tu@email.com' por tu email real de Google
create policy "entradas_admin_write"
  on public.entradas for all
  using (
    auth.jwt() ->> 'email' = 'tu@email.com'
  )
  with check (
    auth.jwt() ->> 'email' = 'tu@email.com'
  );

-- Temas: lectura pública, escritura solo admin
create policy "temas_public_read"
  on public.temas for select
  using (true);

create policy "temas_admin_write"
  on public.temas for all
  using  (auth.jwt() ->> 'email' = 'tu@email.com')
  with check (auth.jwt() ->> 'email' = 'tu@email.com');

-- -------------------------------------------------------------------------
-- 4. Migrar las entradas de data.js (opcional, borra si ya no las quieres)
-- -------------------------------------------------------------------------
insert into public.entradas
  (id, fecha, tema, titulo, resumen, imagen, imagen_alt, contenido_html)
values
(
  '0001',
  '2026-05-03',
  'lecturas',
  'Lo que "Antifragile" me enseñó sobre el desorden y el oficio de vivir',
  'Taleb me dejó una pregunta incómoda: ¿qué le pasaría a esto si el mundo lo golpeara más fuerte de lo previsto? Notas sobre fragilidad, azar y la diferencia entre resistir y crecer con el caos.',
  'https://images.unsplash.com/photo-1775229106888-dca42d0c9f4f?auto=format&fit=crop&w=1200&h=675&q=80',
  'Estanterías de libros antiguos en una biblioteca',
  '<p>Terminé de releer <em>Antifragile</em>...</p>'
),
(
  '0002',
  '2026-06-25',
  'tecnologia',
  'Migrar de hexágonos a geohash: una lección de Ockham aplicada al código',
  'Cambiar de H3 a geohash no fue solo una decisión técnica: fue notar, una vez más, que la solución más elegante en apariencia no siempre es la más honesta con lo que de verdad hay que mantener.',
  'https://images.unsplash.com/photo-1759210358926-4673cc44d35f?auto=format&fit=crop&w=1200&h=675&q=80',
  'Fondo abstracto de cuadrícula azul oscuro',
  '<p>Después de varias semanas trabajando con celdas hexagonales...</p>'
)
on conflict (id) do nothing;
