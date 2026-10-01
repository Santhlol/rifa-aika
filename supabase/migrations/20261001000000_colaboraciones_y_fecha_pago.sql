-- Colaboraciones (donaciones sin número) y fecha supuesta de pago por número

-- 1. Fecha en que el comprador dijo que pagaría
alter table public.numeros_detalle
  add column fecha_pago_esperada date;

-- guardar_numero ahora recibe la fecha (se reemplaza la versión anterior)
drop function if exists public.guardar_numero(smallint, boolean, text, text, boolean, text);

create or replace function public.guardar_numero(
  p_numero smallint,
  p_tomado boolean,
  p_nombre text,
  p_telefono text,
  p_pagado boolean,
  p_observacion text,
  p_fecha_pago_esperada date default null
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
         fecha_pago_esperada = p_fecha_pago_esperada,
         updated_at = now()
   where numero = p_numero;
end;
$$;

revoke execute on function public.guardar_numero from public, anon;
grant execute on function public.guardar_numero to authenticated;

-- 2. Colaboraciones: aportes de personas que no compran número
create table public.colaboraciones (
  id bigint generated always as identity primary key,
  nombre text,                       -- null = anónimo
  monto integer not null check (monto > 0),
  fecha date not null default current_date,
  medio text,                        -- Nequi, Bre-B, efectivo…
  observacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.colaboraciones enable row level security;

create policy "colaboraciones: solo admin lee"
  on public.colaboraciones for select to authenticated
  using (public.is_admin());

create policy "colaboraciones: solo admin crea"
  on public.colaboraciones for insert to authenticated
  with check (public.is_admin());

create policy "colaboraciones: solo admin actualiza"
  on public.colaboraciones for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "colaboraciones: solo admin borra"
  on public.colaboraciones for delete to authenticated
  using (public.is_admin());

revoke all on public.colaboraciones from anon;
