// Datos de la rifa (los mismos del flyer)
export const RIFA = {
  valorNumero: 20000,
  premios: [
    { titulo: "1er premio", valor: 500000, regla: "dos últimas cifras" },
    { titulo: "2do premio", valor: 200000, regla: "dos primeras cifras" },
  ],
  loteria: "Lotería del Sinuano",
  fechaSorteo: "20 de octubre",
} as const;

export type NumeroPublico = { numero: number; tomado: boolean };

export type NumeroAdmin = NumeroPublico & {
  nombre: string | null;
  telefono: string | null;
  pagado: boolean;
  observacion: string | null;
};

export const formatoPesos = (valor: number) =>
  "$" + valor.toLocaleString("es-CO", { maximumFractionDigits: 0 });

export const dosCifras = (n: number) => n.toString().padStart(2, "0");
