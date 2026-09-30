"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./actions";

export default function LoginPage() {
  const [error, accion, enviando] = useActionState(iniciarSesion, null);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form
        action={accion}
        className="w-full max-w-sm rounded-3xl bg-rosa-suave p-6 shadow-sm"
      >
        <h1 className="text-center font-marker text-4xl text-rosa">Aika</h1>
        <p className="mb-6 text-center font-amatic text-3xl">Panel de la rifa</p>

        <label className="mb-1 block text-sm font-semibold" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mb-4 w-full rounded-xl border border-cafe/30 bg-crema-claro px-3 py-2"
        />

        <label className="mb-1 block text-sm font-semibold" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mb-4 w-full rounded-xl border border-cafe/30 bg-crema-claro px-3 py-2"
        />

        {error && (
          <p role="alert" className="mb-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={enviando}
          className="w-full rounded-xl bg-cafe py-2.5 font-bold text-crema-claro transition hover:bg-cafe-suave disabled:opacity-60"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
