// Verifica que un visitante anónimo solo pueda leer el tablero.
// Uso: node --env-file=.env.local scripts/verificar-rls.mjs   (no imprime las claves)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const tipoKey = key?.startsWith("sb_publishable_")
  ? "publishable ✓"
  : key?.startsWith("eyJ")
    ? "anon (JWT) ✓"
    : key?.startsWith("sb_secret_")
      ? "⚠️ SECRETA — no la uses en la web"
      : "desconocido";
console.log("URL:", url && !url.includes("xxxxxxxx") ? "configurada ✓" : "⚠️ falta");
console.log("Key:", tipoKey, "\n");

const sb = createClient(url, key);
const bloqueado = (e) => `BLOQUEADO ✓ (${e.code})`;

const r1 = await sb.from("numeros").select("numero, tomado", { count: "exact" });
console.log(
  "1. Público lee el tablero:     ",
  r1.error ? "⚠️ ERROR " + r1.error.message : `${r1.count} números, ${r1.data.filter((n) => n.tomado).length} tomados ✓`,
);

const r2 = await sb.from("numeros_detalle").select("*");
console.log(
  "2. Público lee datos privados: ",
  r2.error ? bloqueado(r2.error) : r2.data.length ? `⚠️ EXPUESTOS ${r2.data.length}` : "0 filas ✓",
);

const r3 = await sb.from("numeros").update({ tomado: true }).eq("numero", 5).select();
console.log(
  "3. Público marca un número:    ",
  r3.error ? bloqueado(r3.error) : r3.data.length ? "⚠️ LO MODIFICÓ" : "0 filas afectadas ✓",
);

const r4 = await sb.rpc("guardar_numero", {
  p_numero: 5, p_tomado: true, p_nombre: "prueba", p_telefono: "", p_pagado: false, p_observacion: "",
});
console.log("4. Público usa guardar_numero: ", r4.error ? bloqueado(r4.error) : "⚠️ PERMITIDO");

const r5 = await sb.from("admins").select("*");
console.log(
  "5. Público lee admins:         ",
  r5.error ? bloqueado(r5.error) : r5.data.length ? "⚠️ EXPUESTOS" : "0 filas ✓",
);

const r6 = await sb.from("numeros").insert({ numero: 5 });
console.log("6. Público inserta números:    ", r6.error ? bloqueado(r6.error) : "⚠️ PERMITIDO");
