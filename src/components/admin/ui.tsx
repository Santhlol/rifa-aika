"use client";

import type { ComponentProps, ReactNode } from "react";

// Piezas compartidas del panel de administración

export function Dato({
  titulo,
  valor,
  detalle,
  resaltar,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  resaltar?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 ${resaltar ? "bg-amber-100" : "bg-rosa-suave"}`}>
      <p className="text-sm font-semibold text-cafe-suave">{titulo}</p>
      <p className="font-marker text-2xl sm:text-3xl">{valor}</p>
      {detalle && <p className="text-xs text-cafe-suave">{detalle}</p>}
    </div>
  );
}

export function Pestanas<T extends string>({
  opciones,
  valor,
  onCambiar,
}: {
  opciones: readonly { id: T; label: string }[];
  valor: T;
  onCambiar: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onCambiar(o.id)}
          aria-pressed={valor === o.id}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            valor === o.id ? "bg-cafe text-crema-claro" : "bg-rosa-suave hover:bg-rosa-claro"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Hoja inferior en celular, ventana centrada en PC
export function Modal({
  titulo,
  onCerrar,
  onEnviar,
  children,
}: {
  titulo: ReactNode;
  onCerrar: () => void;
  onEnviar: (formData: FormData) => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cafe/40 p-0 sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <form
        action={onEnviar}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-crema-claro p-5 shadow-xl sm:max-w-md sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-marker text-3xl">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-2xl leading-none">
            ×
          </button>
        </div>
        {children}
      </form>
    </div>
  );
}

export function Campo({
  label,
  defaultValue,
  ...props
}: { label: string; defaultValue?: string | number | null } & Omit<
  ComponentProps<"input">,
  "defaultValue"
>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input
        {...props}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-cafe/30 bg-white px-3 py-2"
      />
    </label>
  );
}

export function AreaTexto({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <textarea
        name={name}
        rows={3}
        maxLength={500}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-cafe/30 bg-white px-3 py-2"
      />
    </label>
  );
}

export function Interruptor({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
}: {
  name: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-rosa-suave px-4 py-3">
      <span className="font-semibold">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange && ((e) => onChange(e.target.checked))}
        className="size-5 accent-rosa"
      />
    </label>
  );
}

export function MensajeError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
      {error}
    </p>
  );
}

export function BotonGuardar({ guardando }: { guardando: boolean }) {
  return (
    <button
      disabled={guardando}
      className="flex-1 rounded-xl bg-cafe py-2.5 font-bold text-crema-claro hover:bg-cafe-suave disabled:opacity-60"
    >
      {guardando ? "Guardando…" : "Guardar"}
    </button>
  );
}

// Botón destructivo que pide un segundo toque para confirmar
export function BotonConfirmar({
  confirmando,
  disabled,
  onClick,
  texto,
  textoConfirmar,
}: {
  confirmando: boolean;
  disabled: boolean;
  onClick: () => void;
  texto: string;
  textoConfirmar: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-red-300 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-50"
    >
      {confirmando ? textoConfirmar : texto}
    </button>
  );
}
