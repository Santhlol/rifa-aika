-- Rifa por Aika: esquema inicial
-- Público: solo ve qué números están tomados (tabla `numeros`).
-- Admin: ve y edita los datos del comprador (tabla `numeros_detalle`).

-- Administradoras autorizadas (se agrega el user_id desde el dashboard de Supabase)
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Tablero público
create table public.numeros (
  numero smallint primary key check (numero between 0 and 99),
  tomado boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Datos privados de cada número
create table public.numeros_detalle (
  numero smallint primary key references public.numeros (numero) on delete cascade,
  nombre text,
  telefono text,
  pagado boolean not null default false,
  observacion text,
  updated_at timestamptz not null default now()
);

insert into public.numeros (numero) select generate_series(0, 99);
insert into public.numeros_detalle (numero) select generate_series(0, 99);

-- RLS
alter table public.admins enable row level security;
alter table public.numeros enable row level security;
alter table public.numeros_detalle enable row level security;

create policy "admins: la admin ve su registro"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

create policy "numeros: lectura pública"
  on public.numeros for select to anon, authenticated
  using (true);

create policy "numeros: solo admin actualiza"
  on public.numeros for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "detalle: solo admin lee"
  on public.numeros_detalle for select to authenticated
  using (public.is_admin());

create policy "detalle: solo admin actualiza"
  on public.numeros_detalle for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Defensa extra: anon nunca toca la tabla privada ni admins
revoke all on public.numeros_detalle from anon;
revoke all on public.admins from anon;
revoke insert, delete on public.numeros from anon, authenticated;
revoke insert, delete on public.numeros_detalle from authenticated;

-- Guardado atómico de un número (estado público + datos privados)
create or replace function public.guardar_numero(
  p_numero smallint,
  p_tomado boolean,
  p_nombre text,
  p_telefono text,
  p_pagado boolean,
  p_observacion text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  update public.numeros
     set tomado = p_tomado, updated_at = now()
   where numero = p_numero;

  update public.numeros_detalle
     set nombre = nullif(trim(p_nombre), ''),
         telefono = nullif(trim(p_telefono), ''),
         pagado = p_pagado,
         observacion = nullif(trim(p_observacion), ''),
         updated_at = now()
   where numero = p_numero;
end;
$$;

revoke execute on function public.guardar_numero from public, anon;
grant execute on function public.guardar_numero to authenticated;

-- Tiempo real para el tablero público
alter publication supabase_realtime add table public.numeros;
