"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Resultado = { ok: true } | { ok: false; error: string };

const SESION_EXPIRADA: Resultado = { ok: false, error: "Tu sesión expiró. Vuelve a entrar." };

const texto = (formData: FormData, campo: string, max: number) =>
  String(formData.get(campo) ?? "").trim().slice(0, max);

// "" o fecha inválida → null; si no, YYYY-MM-DD
const fecha = (formData: FormData, campo: string) => {
  const v = String(formData.get(campo) ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};

async function clienteConSesion() {
  const supabase = await createClient();
  // Las Server Actions son accesibles por POST directo: verificar siempre.
  const { data } = await supabase.auth.getClaims();
  return data?.claims ? supabase : null;
}

export async function guardarNumero(formData: FormData): Promise<Resultado> {
  const supabase = await clienteConSesion();
  if (!supabase) return SESION_EXPIRADA;

  const numero = Number(formData.get("numero"));
  if (!Number.isInteger(numero) || numero < 0 || numero > 99) {
    return { ok: false, error: "Número inválido." };
  }

  // La función de Postgres vuelve a comprobar que sea admin (RLS).
  const { error } = await supabase.rpc("guardar_numero", {
    p_numero: numero,
    p_tomado: formData.get("tomado") === "on",
    p_nombre: texto(formData, "nombre", 120),
    p_telefono: texto(formData, "telefono", 30),
    p_pagado: formData.get("pagado") === "on",
    p_observacion: texto(formData, "observacion", 500),
    p_fecha_pago_esperada: fecha(formData, "fecha_pago_esperada"),
  });

  if (error) return { ok: false, error: "No se pudo guardar: " + error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function guardarColaboracion(formData: FormData): Promise<Resultado> {
  const supabase = await clienteConSesion();
  if (!supabase) return SESION_EXPIRADA;

  const monto = Number(String(formData.get("monto") ?? "").replace(/\D/g, ""));
  if (!Number.isInteger(monto) || monto <= 0 || monto > 100_000_000) {
    return { ok: false, error: "Escribe un monto válido." };
  }

  const fila = {
    nombre: texto(formData, "nombre", 120) || null,
    monto,
    fecha: fecha(formData, "fecha") ?? undefined, // undefined → default de la base (hoy)
    medio: texto(formData, "medio", 40) || null,
    observacion: texto(formData, "observacion", 500) || null,
  };

  const id = Number(formData.get("id"));
  // RLS rechaza la escritura si quien guarda no está en `admins`.
  const { error } = id
    ? await supabase
        .from("colaboraciones")
        .update({ ...fila, updated_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("colaboraciones").insert(fila);

  if (error) return { ok: false, error: "No se pudo guardar: " + error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarColaboracion(id: number): Promise<Resultado> {
  const supabase = await clienteConSesion();
  if (!supabase) return SESION_EXPIRADA;
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Colaboración inválida." };

  const { error } = await supabase.from("colaboraciones").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar: " + error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
