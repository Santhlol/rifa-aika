import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Colaboracion, NumeroAdmin, NumeroPublico } from "@/lib/rifa";

// Tablero vacío si Supabase aún no está configurado (útil en desarrollo).
const vacio = (): NumeroPublico[] =>
  Array.from({ length: 100 }, (_, numero) => ({ numero, tomado: false }));

export const supabaseConfigurado = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

export async function obtenerNumerosPublicos(): Promise<NumeroPublico[]> {
  await connection(); // siempre datos frescos, nunca prerenderizado
  if (!supabaseConfigurado()) return vacio();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("numeros")
    .select("numero, tomado")
    .order("numero");

  if (error) {
    console.error("Error leyendo numeros:", error.message);
    return vacio();
  }
  return data;
}

export async function obtenerNumerosAdmin(): Promise<NumeroAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("numeros")
    .select(
      "numero, tomado, numeros_detalle (nombre, telefono, pagado, observacion, fecha_pago_esperada)",
    )
    .order("numero");

  if (error) throw new Error(error.message);

  return data.map(({ numeros_detalle, ...n }) => {
    const d = Array.isArray(numeros_detalle)
      ? numeros_detalle[0]
      : numeros_detalle;
    return {
      ...n,
      nombre: d?.nombre ?? null,
      telefono: d?.telefono ?? null,
      pagado: d?.pagado ?? false,
      observacion: d?.observacion ?? null,
      fechaPagoEsperada: d?.fecha_pago_esperada ?? null,
    };
  });
}

export async function obtenerColaboraciones(): Promise<Colaboracion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colaboraciones")
    .select("id, nombre, monto, fecha, medio, observacion")
    .order("fecha", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
