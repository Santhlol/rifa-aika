"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { guardarNumero } from "@/app/admin/actions";
import { Colaboraciones } from "@/components/admin/Colaboraciones";
import {
  AreaTexto,
  BotonConfirmar,
  BotonGuardar,
  Campo,
  Dato,
  Interruptor,
  MensajeError,
  Modal,
  Pestanas,
} from "@/components/admin/ui";
import { Tablero } from "@/components/Tablero";
import {
  RIFA,
  dosCifras,
  formatoFecha,
  formatoPesos,
  hoyColombia,
  type Colaboracion,
  type NumeroAdmin,
} from "@/lib/rifa";

type Filtro = "todos" | "disponibles" | "pendientes" | "vencidos" | "pagados";

const SECCIONES = [
  { id: "numeros", label: "Números" },
  { id: "colaboraciones", label: "Colaboraciones" },
] as const;

const VISTAS = [
  { id: "tablero", label: "Tablero" },
  { id: "lista", label: "Lista" },
] as const;

const estaVencido = (n: NumeroAdmin, hoy: string) =>
  n.tomado && !n.pagado && !!n.fechaPagoEsperada && n.fechaPagoEsperada < hoy;

export function PanelAdmin({
  numeros,
  colaboraciones,
}: {
  numeros: NumeroAdmin[];
  colaboraciones: Colaboracion[];
}) {
  const [seccion, setSeccion] = useState<(typeof SECCIONES)[number]["id"]>("numeros");
  const [vista, setVista] = useState<(typeof VISTAS)[number]["id"]>("tablero");
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const hoy = hoyColombia();

  const resumen = useMemo(() => {
    const tomados = numeros.filter((n) => n.tomado);
    const pagados = tomados.filter((n) => n.pagado).length;
    const sinPagar = tomados.length - pagados;
    const totalColaboraciones = colaboraciones.reduce((s, c) => s + c.monto, 0);
    return {
      tomados: tomados.length,
      sinPagar,
      vencidos: numeros.filter((n) => estaVencido(n, hoy)).length,
      porCobrar: sinPagar * RIFA.valorNumero,
      totalColaboraciones,
      recaudado: pagados * RIFA.valorNumero + totalColaboraciones,
    };
  }, [numeros, colaboraciones, hoy]);

  const pendientes = useMemo(
    () => new Set(numeros.filter((n) => n.tomado && !n.pagado).map((n) => n.numero)),
    [numeros],
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return numeros.filter((n) => {
      if (filtro === "disponibles" && n.tomado) return false;
      if (filtro === "pendientes" && !(n.tomado && !n.pagado)) return false;
      if (filtro === "vencidos" && !estaVencido(n, hoy)) return false;
      if (filtro === "pagados" && !(n.tomado && n.pagado)) return false;
      if (!q) return true;
      return (
        dosCifras(n.numero).includes(q) ||
        n.nombre?.toLowerCase().includes(q) ||
        n.telefono?.includes(q) ||
        n.observacion?.toLowerCase().includes(q)
      );
    });
  }, [numeros, filtro, busqueda, hoy]);

  const actual = seleccionado === null ? null : numeros[seleccionado];

  return (
    <>
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato titulo="Tomados" valor={`${resumen.tomados} / 100`} />
        <Dato
          titulo="Sin pagar"
          valor={String(resumen.sinPagar)}
          detalle={resumen.vencidos ? `${resumen.vencidos} con fecha vencida` : undefined}
          resaltar={resumen.sinPagar > 0}
        />
        <Dato
          titulo="Colaboraciones"
          valor={formatoPesos(resumen.totalColaboraciones)}
          detalle={`${colaboraciones.length} ${colaboraciones.length === 1 ? "aporte" : "aportes"}`}
        />
        <Dato
          titulo="Total recaudado"
          valor={formatoPesos(resumen.recaudado)}
          detalle={resumen.porCobrar ? `+ ${formatoPesos(resumen.porCobrar)} por cobrar` : undefined}
        />
      </section>

      <div className="mb-5 border-b border-cafe/15 pb-4">
        <Pestanas opciones={SECCIONES} valor={seccion} onCambiar={setSeccion} />
      </div>

      {seccion === "colaboraciones" ? (
        <Colaboraciones colaboraciones={colaboraciones} />
      ) : (
        <>
          <div className="mb-4">
            <Pestanas opciones={VISTAS} valor={vista} onCambiar={setVista} />
          </div>

          {vista === "tablero" ? (
            <div className="max-w-2xl">
              <p className="mb-2 text-sm text-cafe-suave">
                Toca un número para editarlo.{" "}
                <span className="rounded bg-amber-100 px-1">Amarillo</span> = tomado sin pagar.
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
                  <option value="vencidos">Pago vencido</option>
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
                          {n.tomado ? (
                            n.nombre || "Sin nombre"
                          ) : (
                            <span className="text-cafe/50">Disponible</span>
                          )}
                        </span>
                        {(n.telefono || n.observacion) && (
                          <span className="block truncate text-sm text-cafe-suave">
                            {[n.telefono, n.observacion].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      {n.tomado && <Estado numero={n} hoy={hoy} />}
                    </button>
                  </li>
                ))}
                {filtrados.length === 0 && (
                  <li className="px-4 py-6 text-center text-cafe-suave">No hay resultados.</li>
                )}
              </ul>
            </div>
          )}
        </>
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

function Estado({ numero, hoy }: { numero: NumeroAdmin; hoy: string }) {
  if (numero.pagado) {
    return <Etiqueta clase="bg-emerald-100 text-emerald-800">Pagado</Etiqueta>;
  }
  if (!numero.fechaPagoEsperada) {
    return <Etiqueta clase="bg-amber-100 text-amber-800">Sin pagar</Etiqueta>;
  }
  const fecha = formatoFecha(numero.fechaPagoEsperada);
  return estaVencido(numero, hoy) ? (
    <Etiqueta clase="bg-red-100 text-red-800">Vencido · {fecha}</Etiqueta>
  ) : (
    <Etiqueta clase="bg-amber-100 text-amber-800">Paga {fecha}</Etiqueta>
  );
}

function Etiqueta({ clase, children }: { clase: string; children: ReactNode }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${clase}`}>{children}</span>
  );
}

function FormularioNumero({ numero, onCerrar }: { numero: NumeroAdmin; onCerrar: () => void }) {
  const [tomado, setTomado] = useState(numero.tomado);
  const [pagado, setPagado] = useState(numero.pagado);
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
    <Modal
      titulo={
        <>
          Número <span className="text-rosa">{dosCifras(numero.numero)}</span>
        </>
      }
      onCerrar={onCerrar}
      onEnviar={enviar}
    >
      <input type="hidden" name="numero" value={numero.numero} />

      <Interruptor name="tomado" label="Número tomado" checked={tomado} onChange={setTomado} />

      <fieldset disabled={!tomado} className="mt-4 space-y-3 disabled:opacity-50">
        <Campo label="Nombre" name="nombre" defaultValue={numero.nombre} autoComplete="off" />
        <Campo
          label="Teléfono"
          name="telefono"
          type="tel"
          defaultValue={numero.telefono}
          autoComplete="off"
        />
        <Interruptor name="pagado" label="Ya pagó" checked={pagado} onChange={setPagado} />
        {!pagado && (
          <Campo
            label="Fecha supuesta de pago"
            name="fecha_pago_esperada"
            type="date"
            defaultValue={numero.fechaPagoEsperada}
          />
        )}
        <AreaTexto label="Observación" name="observacion" defaultValue={numero.observacion} />
      </fieldset>

      <MensajeError error={error} />

      <div className="mt-5 flex flex-wrap gap-2">
        <BotonGuardar guardando={guardando} />
        {numero.tomado && (
          <BotonConfirmar
            confirmando={confirmarLiberar}
            disabled={guardando}
            onClick={liberar}
            texto="Liberar número"
            textoConfirmar="¿Seguro? Borra los datos"
          />
        )}
      </div>
    </Modal>
  );
}
