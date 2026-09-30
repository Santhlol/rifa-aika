import { redirect } from "next/navigation";
import { PanelAdmin } from "@/components/PanelAdmin";
import { obtenerNumerosAdmin } from "@/lib/numeros";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "./actions";

export const metadata = { title: "Panel · Rifa por Aika", robots: { index: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.claims.sub)
    .maybeSingle();

  if (!admin) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-lg">
          Tu cuenta no tiene permisos de administración para esta rifa.
        </p>
        <form action={cerrarSesion}>
          <button className="rounded-xl bg-cafe px-4 py-2 font-bold text-crema-claro">
            Cerrar sesión
          </button>
        </form>
      </main>
    );
  }

  const numeros = await obtenerNumerosAdmin();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-marker text-3xl sm:text-4xl">
          Rifa por <span className="text-rosa">Aika</span>{" "}
          <span className="font-amatic text-3xl text-cafe-suave">· panel</span>
        </h1>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="rounded-xl border border-cafe/30 px-3 py-2 text-sm font-semibold hover:bg-rosa-suave"
          >
            Ver página pública ↗
          </a>
          <form action={cerrarSesion}>
            <button className="rounded-xl bg-cafe px-3 py-2 text-sm font-semibold text-crema-claro hover:bg-cafe-suave">
              Salir
            </button>
          </form>
        </div>
      </header>
      <PanelAdmin numeros={numeros} />
    </main>
  );
}
