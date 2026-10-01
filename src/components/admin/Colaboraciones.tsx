"use client";

import { useState, useTransition } from "react";
import { eliminarColaboracion, guardarColaboracion } from "@/app/admin/actions";
import {
  AreaTexto,
  BotonConfirmar,
  BotonGuardar,
  Campo,
  MensajeError,
  Modal,
} from "@/components/admin/ui";
import {
  MEDIOS_PAGO,
  formatoFecha,
  formatoPesos,
  hoyColombia,
  type Colaboracion,
} from "@/lib/rifa";

// Aportes de personas que ayudan a Aika sin comprar número
export function Colaboraciones({ colaboraciones }: { colaboraciones: Colaboracion[] }) {
  // null = cerrado, "nueva" = formulario vacío, o la colaboración a editar
  const [editando, setEditando] = useState<Colaboracion | "nueva" | null>(null);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cafe-suave">
          Donaciones de personas que no compraron número.
        </p>
        <button
          type="button"
          onClick={() => setEditando("nueva")}
          className="rounded-xl bg-cafe px-4 py-2 text-sm font-bold text-crema-claro hover:bg-cafe-suave"
        >
          + Registrar colaboración
        </button>
      </div>

      {colaboraciones.length === 0 ? (
        <p className="rounded-2xl bg-crema-claro px-4 py-8 text-center text-cafe-suave">
          Aún no hay colaboraciones registradas.
        </p>
      ) : (
        <ul className="divide-y divide-cafe/15 overflow-hidden rounded-2xl bg-crema-claro">
          {colaboraciones.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setEditando(c)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-rosa-suave"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{c.nombre || "Anónimo"}</span>
                  <span className="block truncate text-sm text-cafe-suave">
                    {[formatoFecha(c.fecha), c.medio, c.observacion].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 font-marker text-xl">{formatoPesos(c.monto)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <FormularioColaboracion
          key={editando === "nueva" ? "nueva" : editando.id}
          colaboracion={editando === "nueva" ? null : editando}
          onCerrar={() => setEditando(null)}
        />
      )}
    </section>
  );
}

function FormularioColaboracion({
  colaboracion,
  onCerrar,
}: {
  colaboracion: Colaboracion | null;
  onCerrar: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [guardando, startTransition] = useTransition();

  function ejecutar(accion: () => ReturnType<typeof guardarColaboracion>) {
    setError(null);
    startTransition(async () => {
      const r = await accion();
      if (r.ok) onCerrar();
      else setError(r.error);
    });
  }

  function eliminar() {
    if (!colaboracion) return;
    if (!confirmarEliminar) {
      setConfirmarEliminar(true);
      return;
    }
    ejecutar(() => eliminarColaboracion(colaboracion.id));
  }

  return (
    <Modal
      titulo={colaboracion ? "Colaboración" : "Nueva colaboración"}
      onCerrar={onCerrar}
      onEnviar={(fd) => ejecutar(() => guardarColaboracion(fd))}
    >
      {colaboracion && <input type="hidden" name="id" value={colaboracion.id} />}

      <div className="space-y-3">
        <Campo
          label="Nombre (vacío = anónimo)"
          name="nombre"
          defaultValue={colaboracion?.nombre}
          autoComplete="off"
        />
        <Campo
          label="Monto (COP)"
          name="monto"
          inputMode="numeric"
          placeholder="Ej: 50000"
          required
          defaultValue={colaboracion?.monto}
          autoComplete="off"
        />
        <Campo
          label="Fecha"
          name="fecha"
          type="date"
          required
          defaultValue={colaboracion?.fecha ?? hoyColombia()}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Medio</span>
          <select
            name="medio"
            defaultValue={colaboracion?.medio ?? ""}
            className="w-full rounded-xl border border-cafe/30 bg-white px-3 py-2"
          >
            <option value="">Sin especificar</option>
            {MEDIOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <AreaTexto label="Observación" name="observacion" defaultValue={colaboracion?.observacion} />
      </div>

      <MensajeError error={error} />

      <div className="mt-5 flex flex-wrap gap-2">
        <BotonGuardar guardando={guardando} />
        {colaboracion && (
          <BotonConfirmar
            confirmando={confirmarEliminar}
            disabled={guardando}
            onClick={eliminar}
            texto="Eliminar"
            textoConfirmar="¿Seguro? Eliminar"
          />
        )}
      </div>
    </Modal>
  );
}
