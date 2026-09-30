"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dosCifras, type NumeroPublico } from "@/lib/rifa";

type Props = {
  inicial: NumeroPublico[];
  // En admin: al tocar un número se abre su formulario
  onSeleccionar?: (numero: number) => void;
  // En admin: números tomados pero sin pagar
  pendientes?: Set<number>;
  enVivo?: boolean;
};

export function Tablero({ inicial, onSeleccionar, pendientes, enVivo = true }: Props) {
  const [numeros, setNumeros] = useState(inicial);
  const [previo, setPrevio] = useState(inicial);

  // Si el servidor manda datos nuevos (admin guardó), se reemplazan
  if (inicial !== previo) {
    setPrevio(inicial);
    setNumeros(inicial);
  }

  useEffect(() => {
    if (!enVivo || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const canal = supabase
      .channel("tablero")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "numeros" },
        (payload) => {
          const nuevo = payload.new as NumeroPublico;
          setNumeros((prev) =>
            prev.map((n) => (n.numero === nuevo.numero ? { ...n, tomado: nuevo.tomado } : n)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [enVivo]);

  const libres = numeros.filter((n) => !n.tomado).length;

  return (
    <div>
      {!onSeleccionar && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-cafe-suave">
          <span>
            Quedan <strong className="text-cafe">{libres}</strong> de 100 números
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block size-4 border border-cafe/50 bg-crema-claro" /> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="relative inline-block size-4 border border-cafe/50 bg-crema-claro">
                <MarcaX />
              </span>
              Tomado
            </span>
          </span>
        </div>
      )}
    <div className="grid grid-cols-10 overflow-hidden rounded-sm border-2 border-cafe/80 bg-crema-claro">
      {numeros.map(({ numero, tomado }) => {
        const pendiente = tomado && pendientes?.has(numero);
        const Celda = onSeleccionar ? "button" : "div";
        return (
          <Celda
            key={numero}
            {...(onSeleccionar && {
              type: "button" as const,
              onClick: () => onSeleccionar(numero),
            })}
            aria-label={`Número ${dosCifras(numero)}${tomado ? ", tomado" : ", disponible"}`}
            className={`relative flex aspect-square items-center justify-center border border-cafe/40 font-sans text-sm font-bold tabular-nums sm:text-lg md:text-xl ${
              tomado ? "text-cafe/45" : "text-cafe"
            } ${onSeleccionar ? "cursor-pointer transition hover:bg-rosa-suave focus-visible:outline-2 focus-visible:outline-rosa" : ""} ${
              pendiente ? "bg-amber-100" : ""
            }`}
          >
            {dosCifras(numero)}
            {tomado && <MarcaX />}
          </Celda>
        );
      })}
    </div>
    </div>
  );
}

function MarcaX() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className="pointer-events-none absolute inset-0 m-auto size-[76%] text-rosa"
    >
      <path
        d="M7 8 C 16 17, 24 25, 33 33 M33 7 C 24 16, 16 24, 7 33"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
