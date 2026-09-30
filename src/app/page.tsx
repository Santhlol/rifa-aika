import Image from "next/image";
import { Corazon } from "@/components/Corazon";
import { Tablero } from "@/components/Tablero";
import { obtenerNumerosPublicos } from "@/lib/numeros";
import { RIFA, formatoPesos } from "@/lib/rifa";

const FOTOS = [
  { src: "/img/aika-cono.jpg", alt: "Aika con cono veterinario, sonriendo", giro: "-rotate-3" },
  { src: "/img/aika-juguete.jpg", alt: "Aika con su pollito de juguete", giro: "rotate-2" },
  { src: "/img/aika-feliz.jpg", alt: "Aika acostada, feliz", giro: "-rotate-2" },
];

export default async function Home() {
  const numeros = await obtenerNumerosPublicos();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.75fr_1fr] lg:gap-x-8">
        {/* Título e historia */}
        <header className="relative">
          <Corazon className="absolute -top-3 right-4 w-10 rotate-12 text-rosa sm:right-auto sm:left-[21rem] lg:left-[27rem]" />
          <h1 className="font-marker leading-[0.85] tracking-tight">
            <span className="block text-6xl text-cafe sm:text-7xl lg:text-8xl">Rifa por</span>
            <span className="block text-8xl text-rosa sm:text-9xl lg:text-[10rem]">Aika</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-cafe-suave sm:text-xl">
            Aika está pasando por un momento de salud muy difícil y necesita atención
            veterinaria urgente. Tu apoyo nos ayudará a cubrir sus gastos médicos y darle la
            oportunidad de seguir con nosotros{" "}
            <span className="text-cafe" aria-hidden>
              ♥
            </span>
          </p>
        </header>

        {/* Foto principal con el valor del número */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Image
            src="/img/aika-hero.jpg"
            alt="Aika, una cocker spaniel dorada, recostada en un cojín"
            width={410}
            height={440}
            priority
            className="h-auto w-full rounded-3xl object-cover shadow-md"
          />
          <div className="absolute -bottom-5 -right-3 flex h-32 w-40 -rotate-12 flex-col items-center justify-center rounded-[48%_52%_46%_54%] bg-rosa-claro text-center shadow-sm sm:h-36 sm:w-44">
            <span className="font-amatic text-2xl leading-[0.9] text-cafe sm:text-3xl">
              Valor
              <br />
              del número
            </span>
            <span className="font-marker text-3xl text-cafe sm:text-4xl">
              {formatoPesos(RIFA.valorNumero)}
            </span>
          </div>
        </div>

        {/* Tablero */}
        <section aria-labelledby="titulo-numeros">
          <h2
            id="titulo-numeros"
            className="pincel mb-4 inline-block px-6 py-1 font-amatic text-4xl tracking-wide sm:text-5xl"
          >
            Números disponibles
          </h2>
          <Tablero inicial={numeros} />
        </section>

        {/* Premios, sorteo y cierre */}
        <aside className="flex flex-col gap-4 rounded-3xl bg-rosa-suave p-5 lg:self-start">
          <h2 className="text-center font-amatic text-5xl tracking-wide">Dos premios</h2>
          {RIFA.premios.map((p) => (
            <div key={p.titulo} className="rounded-2xl bg-crema-claro p-4 text-center shadow-sm">
              <p className="font-amatic text-3xl">
                <span className="text-rosa">★</span> {p.titulo}
              </p>
              <p className="pincel mx-auto my-1 inline-block px-3 font-marker text-4xl sm:text-5xl">
                {formatoPesos(p.valor)}
              </p>
              <p className="text-sm">
                Gana con las <strong className="uppercase">{p.regla}</strong> de la lotería.
              </p>
            </div>
          ))}

          <hr className="border-cafe/30" />

          <dl className="grid gap-3 px-1">
            <div>
              <dt className="flex items-center gap-2 font-amatic text-3xl leading-none"><IconoCalendario /> Sorteo</dt>
              <dd>
                {RIFA.loteria}
                <br />
                Noche del <strong>{RIFA.fechaSorteo}</strong>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-amatic text-3xl leading-none"><IconoBoleta /> Números</dt>
              <dd>Del 00 al 99</dd>
            </div>
          </dl>

        </aside>

        {/* Fotos */}
        <section aria-label="Fotos de Aika" className="pb-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {FOTOS.map((f) => (
              <figure
                key={f.src}
                className={`cinta relative bg-white p-1.5 pb-5 shadow-md sm:p-2 sm:pb-7 ${f.giro}`}
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  width={210}
                  height={275}
                  className="aspect-[3/4] h-auto w-full object-cover"
                />
              </figure>
            ))}
          </div>
          <p className="pincel mx-auto mt-5 w-fit -rotate-1 px-5 py-1 text-center font-caveat text-2xl sm:text-3xl">
            Cualquier aporte, por pequeño que sea, hace una gran diferencia.{" "}
            <span className="text-rosa">♥</span>
          </p>
        </section>

        <div className="flex flex-col items-center justify-center pb-6 text-center">
          <p className="-rotate-3 font-amatic text-5xl leading-tight">
            ¡Juega y ayúdanos
            <br />a seguir cuidando
            <br />a Aika! <span className="text-rosa">♥</span>
          </p>
          <IconoHuella />
        </div>
      </div>
    </main>
  );
}

function IconoCalendario() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h8M8 17.5h5" />
    </svg>
  );
}

function IconoBoleta() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z" />
      <rect x="8" y="9" width="8" height="6" rx="1" />
    </svg>
  );
}

function IconoHuella() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="mt-3 w-14 rotate-12 text-cafe-suave/70" fill="currentColor">
      <ellipse cx="32" cy="44" rx="13" ry="11" />
      <ellipse cx="15" cy="28" rx="6" ry="8" />
      <ellipse cx="26" cy="18" rx="6" ry="8" />
      <ellipse cx="38" cy="18" rx="6" ry="8" />
      <ellipse cx="49" cy="28" rx="6" ry="8" />
    </svg>
  );
}
