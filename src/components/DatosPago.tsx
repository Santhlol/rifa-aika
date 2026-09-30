"use client";

import { useState } from "react";
import { RIFA, formatoCelular, formatoPesos } from "@/lib/rifa";

export function DatosPago() {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(RIFA.pago.numero);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el número sigue visible para copiarlo a mano
    }
  }

  return (
    <section
      aria-labelledby="titulo-pago"
      className="rounded-2xl border-2 border-dashed border-rosa bg-crema-claro p-4 text-center"
    >
      <h2 id="titulo-pago" className="font-amatic text-4xl leading-none">
        ¿Cómo pagar?
      </h2>
      <p className="mt-1 text-sm">
        Transfiere <strong>{formatoPesos(RIFA.valorNumero)}</strong> por número a:
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {RIFA.pago.medios.map((m) => (
          <span key={m} className="rounded-full bg-rosa-claro px-3 py-0.5 text-sm font-bold">
            {m}
          </span>
        ))}
      </div>

      <p className="mt-2 font-marker text-3xl tracking-wide tabular-nums sm:text-4xl">
        {formatoCelular(RIFA.pago.numero)}
      </p>

      <button
        type="button"
        onClick={copiar}
        className="mt-2 rounded-xl bg-cafe px-4 py-2 text-sm font-bold text-crema-claro transition hover:bg-cafe-suave"
        aria-live="polite"
      >
        {copiado ? "¡Copiado! ♥" : "Copiar número"}
      </button>

      <p className="mt-3 text-xs text-cafe-suave">
        Envía el comprobante indicando el número que escogiste.
      </p>
    </section>
  );
}
