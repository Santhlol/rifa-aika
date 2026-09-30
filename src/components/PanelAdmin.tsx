"use client";

import { useMemo, useState, useTransition, type ComponentProps } from "react";
import { guardarNumero } from "@/app/admin/actions";
import { Tablero } from "@/components/Tablero";
import { RIFA, dosCifras, formatoPesos, type NumeroAdmin } from "@/lib/rifa";

type Filtro = "todos" | "disponibles" | "pendientes" | "pagados";

export function PanelAdmin({ numeros }: { numeros: NumeroAdmin[] }) {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [vista, setVista] = useState<"tablero" | "lista">("tablero");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const resumen = useMemo(() => {
    const tomados = numeros.filter((n) => n.tomado);
    const pagados = tomados.filter((n) => n.pagado);
    return {
      tomados: tomados.length,
      pagados: pagados.length,
      pendientes: tomados.length - pagados.length,
      recaudado: pagados.length * RIFA.valorNumero,
      porCobrar: (tomados.length - pagados.length) * RIFA.valorNumero,
    };
  }, [numeros]);

  const pendientes = useMemo(
    () => new Set(numeros.filter((n) => n.tomado && !n.pagado).map((n) => n.numero)),
    [numeros],
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return numeros.filter((n) => {
      if (filtro === "disponibles" && n.tomado) return false;
      if (filtro === "pendientes" && !(n.tomado && !n.pagado)) return false;
      if (filtro === "pagados" && !(n.tomado && n.pagado)) return false;
      if (!q) return true;
      return (
        dosCifras(n.numero).includes(q) ||
        n.nombre?.toLowerCase().includes(q) ||
        n.telefono?.includes(q) ||
        n.observacion?.toLowerCase().includes(q)
      );
    });
  }, [numeros, filtro, busqueda]);

  const actual = seleccionado === null ? null : numeros[seleccionado];

  return (
    <>
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato titulo="Tomados" valor={`${resumen.tomados} / 100`} />
        <Dato titulo="Pagados" valor={String(resumen.pagados)} />
        <Dato titulo="Sin pagar" valor={String(resumen.pendientes)} resaltar={resumen.pendientes > 0} />
        <Dato
          titulo="Recaudado"
          valor={formatoPesos(resumen.recaudado)}
          detalle={resumen.porCobrar ? `+ ${formatoPesos(resumen.porCobrar)} por cobrar` : undefined}
        />
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["tablero", "lista"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className={`rounded-xl px-4 py-2 text-sm font-bold capitalize ${
              vista === v ? "bg-cafe text-crema-claro" : "bg-rosa-suave hover:bg-rosa-claro"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {vista === "tablero" ? (
        <div className="max-w-2xl">
          <p className="mb-2 text-sm text-cafe-suave">
            Toca un número para editarlo. <span className="rounded bg-amber-100 px-1">Amarillo</span> = tomado
            sin pagar.
          </p>
          <Tablero
            inicial={numeros}
            enVivo={false}
            pendientes={pendientes}
            onSeleccionar={setSeleccionado}
          />
        </div>
      ) : (
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Buscar número, nombre, teléfono…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-cafe/30 bg-crema-claro px-3 py-2"
            />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as Filtro)}
              className="rounded-xl border border-cafe/30 bg-crema-claro px-3 py-2"
            >
              <option value="todos">Todos</option>
              <option value="disponibles">Disponibles</option>
              <option value="pendientes">Sin pagar</option>
              <option value="pagados">Pagados</option>
            </select>
          </div>
          <ul className="divide-y divide-cafe/15 overflow-hidden rounded-2xl bg-crema-claro">
            {filtrados.map((n) => (
              <li key={n.numero}>
                <button
                  onClick={() => setSeleccionado(n.numero)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-rosa-suave"
                >
                  <span className="w-10 font-marker text-xl">{dosCifras(n.numero)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {n.tomado ? n.nombre || "Sin nombre" : <span className="text-cafe/50">Disponible</span>}
                    </span>
                    {(n.telefono || n.observacion) && (
                      <span className="block truncate text-sm text-cafe-suave">
                        {[n.telefono, n.observacion].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                  {n.tomado && <Estado pagado={n.pagado} />}
                </button>
              </li>
            ))}
            {filtrados.length === 0 && (
              <li className="px-4 py-6 text-center text-cafe-suave">No hay resultados.</li>
            )}
          </ul>
        </div>
      )}

      {actual && (
        <FormularioNumero
          key={actual.numero}
          numero={actual}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </>
  );
}

function Dato({
  titulo,
  valor,
  detalle,
  resaltar,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  resaltar?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 ${resaltar ? "bg-amber-100" : "bg-rosa-suave"}`}>
      <p className="text-sm font-semibold text-cafe-suave">{titulo}</p>
      <p className="font-marker text-2xl sm:text-3xl">{valor}</p>
      {detalle && <p className="text-xs text-cafe-suave">{detalle}</p>}
    </div>
  );
}

function Estado({ pagado }: { pagado: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
        pagado ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {pagado ? "Pagado" : "Sin pagar"}
    </span>
  );
}

function FormularioNumero({ numero, onCerrar }: { numero: NumeroAdmin; onCerrar: () => void }) {
  const [tomado, setTomado] = useState(numero.tomado);
  const [error, setError] = useState<string | null>(null);
  const [confirmarLiberar, setConfirmarLiberar] = useState(false);
  const [guardando, startTransition] = useTransition();

  function enviar(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await guardarNumero(formData);
      if (r.ok) onCerrar();
      else setError(r.error);
    });
  }

  function liberar() {
    if (!confirmarLiberar) {
      setConfirmarLiberar(true);
      return;
    }
    const fd = new FormData();
    fd.set("numero", String(numero.numero));
    enviar(fd);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cafe/40 p-0 sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <form
        action={enviar}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-crema-claro p-5 shadow-xl sm:max-w-md sm:rounded-3xl"
      >
        <input type="hidden" name="numero" value={numero.numero} />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-marker text-3xl">
            Número <span className="text-rosa">{dosCifras(numero.numero)}</span>
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-2xl leading-none">
            ×
          </button>
        </div>

        <Interruptor
          name="tomado"
          label="Número tomado"
          checked={tomado}
          onChange={setTomado}
        />

        <fieldset disabled={!tomado} className="mt-4 space-y-3 disabled:opacity-50">
          <Campo label="Nombre" name="nombre" defaultValue={numero.nombre} autoComplete="off" />
          <Campo label="Teléfono" name="telefono" type="tel" defaultValue={numero.telefono} autoComplete="off" />
          <Interruptor name="pagado" label="Ya pagó" defaultChecked={numero.pagado} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Observación</span>
            <textarea
              name="observacion"
              rows={3}
              maxLength={500}
              defaultValue={numero.observacion ?? ""}
              className="w-full rounded-xl border border-cafe/30 bg-white px-3 py-2"
            />
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            disabled={guardando}
            className="flex-1 rounded-xl bg-cafe py-2.5 font-bold text-crema-claro hover:bg-cafe-suave disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
          {numero.tomado && (
            <button
              type="button"
              disabled={guardando}
              onClick={liberar}
              className="rounded-xl border border-red-300 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-50"
            >
              {confirmarLiberar ? "¿Seguro? Borra los datos" : "Liberar número"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Campo({
  label,
  defaultValue,
  ...props
}: { label: string; defaultValue: string | null } & Omit<ComponentProps<"input">, "defaultValue">) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input
        {...props}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-cafe/30 bg-white px-3 py-2"
      />
    </label>
  );
}

function Interruptor({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
}: {
  name: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-rosa-suave px-4 py-3">
      <span className="font-semibold">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange && ((e) => onChange(e.target.checked))}
        className="size-5 accent-rosa"
      />
    </label>
  );
}
