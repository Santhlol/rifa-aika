"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Resultado = { ok: true } | { ok: false; error: string };

export async function guardarNumero(formData: FormData): Promise<Resultado> {
  const supabase = await createClient();

  // Las Server Actions son accesibles por POST directo: verificar siempre.
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return { ok: false, error: "Tu sesión expiró. Vuelve a entrar." };

  const numero = Number(formData.get("numero"));
  if (!Number.isInteger(numero) || numero < 0 || numero > 99) {
    return { ok: false, error: "Número inválido." };
  }

  const texto = (campo: string, max: number) =>
    String(formData.get(campo) ?? "").slice(0, max);

  // La función de Postgres vuelve a comprobar que sea admin (RLS).
  const { error } = await supabase.rpc("guardar_numero", {
    p_numero: numero,
    p_tomado: formData.get("tomado") === "on",
    p_nombre: texto("nombre", 120),
    p_telefono: texto("telefono", 30),
    p_pagado: formData.get("pagado") === "on",
    p_observacion: texto("observacion", 500),
  });

  if (error) return { ok: false, error: "No se pudo guardar: " + error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
