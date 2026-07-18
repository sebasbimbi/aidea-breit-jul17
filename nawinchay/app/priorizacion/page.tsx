"use client";

import { useMemo, useState } from "react";
import canonicoRaw from "@/data/canonico.json";
import {
  formatearCelda,
  esPublicable,
  type Canonico,
  type Escuela,
  type Distrito,
} from "@/lib/supresion";

const canonico = canonicoRaw as unknown as Canonico;
const A = canonico.atisunchik;

type Orden = "carga" | "pct" | "n";
type Nivel = "distrito" | "escuela";

function descargarCsv(filas: (Escuela | Distrito)[], nivel: Nivel) {
  const cab = [
    nivel === "distrito" ? "distrito" : "institucion_educativa",
    "n_estudiantes",
    "carga_estimada_estudiante_equivalente",
    "pct_satisfactorio",
    "pct_previo_al_inicio",
    "estado_base",
  ];
  const cuerpo = filas.map((f) => {
    const nombre = "distrito" in f ? f.distrito : f.institucion;
    // el CSV respeta la supresion: base insuficiente no exporta porcentaje
    const sat = esPublicable(f.satisfactorio) ? f.satisfactorio.pct.toFixed(1) : "";
    const prev = esPublicable(f.previo_al_inicio) ? f.previo_al_inicio.pct.toFixed(1) : "";
    const estado = f.base_suficiente ? "publicable" : "base insuficiente";
    // carga tambien se suprime: dividida entre n reconstruye el porcentaje oculto
    const cg = f.carga_estimada === null ? "" : f.carga_estimada.toFixed(1);
    return [`"${nombre}"`, f.n_estudiantes, cg, sat, prev, estado].join(",");
  });
  const csv = [cab.join(","), ...cuerpo].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `nawinchay-plan-visitas-${nivel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Priorizacion() {
  const [nivel, setNivel] = useState<Nivel>("distrito");
  const [orden, setOrden] = useState<Orden>("carga");

  const filas = useMemo(() => {
    const base: (Escuela | Distrito)[] = nivel === "distrito" ? A.distritos : A.escuelas;
    const copia = [...base];
    if (orden === "carga") copia.sort((x, y) => (y.carga_estimada ?? -1) - (x.carga_estimada ?? -1));
    if (orden === "n") copia.sort((x, y) => y.n_estudiantes - x.n_estudiantes);
    if (orden === "pct") {
      copia.sort((x, y) => {
        const px = esPublicable(x.previo_al_inicio) ? x.previo_al_inicio.pct : -1;
        const py = esPublicable(y.previo_al_inicio) ? y.previo_al_inicio.pct : -1;
        return py - px;
      });
    }
    return copia;
  }, [nivel, orden]);

  const top10 = filas.slice(0, 10);
  const nTop10 = top10.reduce((s, f) => s + f.n_estudiantes, 0);
  const cargaTop10 = top10.reduce((s, f) => s + (f.carga_estimada ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-8 flex gap-5 font-mono text-xs uppercase tracking-widest">
        <a href="/" className="text-neutral-500 hover:text-white">Inicio</a>
        <span className="text-brand-green">Priorizacion</span>
        <a href="/items" className="text-neutral-500 hover:text-white">Items</a>
      </nav>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        A donde va el acompanamiento
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
        Provincia y distrito son solidos. Escuela es marcada y direccional.
        Ninguna cifra se muestra sin su base.
      </p>

      {/* panorama, pegado arriba de la vista que decide */}
      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { k: "Estudiantes evaluados", v: A.totales.n_estudiantes.toLocaleString("es-PE"), s: `${A.distritos.length} distritos` },
          { k: "En previo al inicio", v: `${A.totales.previo_al_inicio.toFixed(1)}%`, s: "de la provincia" },
          { k: "Carga estimada", v: A.carga_total_estimada.toFixed(1), s: "estudiante-equivalente" },
          { k: "IE publicables", v: `${A.base.escuelas_publicables}/${A.base.escuelas_total}`, s: `${A.base.pct_estudiantes_conservados}% de estudiantes` },
        ].map((c) => (
          <div key={c.k} className="rounded-lg border border-brand-outline bg-brand-surface2 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{c.k}</p>
            <p className="mt-1.5 font-display text-2xl font-semibold text-white">{c.v}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{c.s}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-brand-outline p-0.5">
          {(["distrito", "escuela"] as Nivel[]).map((n) => (
            <button
              key={n}
              onClick={() => setNivel(n)}
              className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                nivel === n ? "bg-brand-green text-brand-ink" : "text-neutral-400 hover:text-white"
              }`}
            >
              {n === "distrito" ? "Por distrito" : "Por escuela"}
            </button>
          ))}
        </div>

        <div className="flex rounded-md border border-brand-outline p-0.5">
          {([
            ["carga", "Carga"],
            ["pct", "Porcentaje"],
            ["n", "Tamano"],
          ] as [Orden, string][]).map(([o, etiqueta]) => (
            <button
              key={o}
              onClick={() => setOrden(o)}
              className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                orden === o ? "bg-white text-brand-ink" : "text-neutral-400 hover:text-white"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <button
          onClick={() => descargarCsv(filas, nivel)}
          className="ml-auto rounded-md border border-brand-green px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-brand-green transition hover:bg-brand-green hover:text-brand-ink"
        >
          Descargar plan de visitas (CSV)
        </button>
      </section>

      <p className="mt-3 text-xs leading-relaxed text-neutral-500">
        {orden === "carga" && (
          <>Orden por <strong className="text-neutral-300">carga estimada de acompanamiento</strong>, en
          estudiante-equivalente: n por (inicio mas previo al inicio). Los 10 primeros suman{" "}
          {cargaTop10.toFixed(1)} de {A.carga_total_estimada.toFixed(1)} de la carga estimada, sobre {nTop10} estudiantes.</>
        )}
        {orden === "pct" && (
          <>Orden por porcentaje en previo al inicio. Con {A.base.escuelas_bajo_10} de {A.base.escuelas_total} escuelas
          bajo 10 estudiantes, ordenar por porcentaje corona ruido: mirar siempre la columna n.</>
        )}
        {orden === "n" && (
          <>Orden por tamano crudo. Sirve para ver que el top de carga tambien es el top de tamano,
          de modo que el argumento no dependa del denominador estimado.</>
        )}
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-brand-outline">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-brand-outline bg-brand-surface2">
            <tr className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              <th className="px-4 py-3">{nivel === "distrito" ? "Distrito" : "Institucion educativa"}</th>
              <th className="px-4 py-3 text-right">n</th>
              <th className="px-4 py-3 text-right">Carga estimada</th>
              <th className="px-4 py-3 text-right">Satisfactorio</th>
              <th className="px-4 py-3 text-right">Previo al inicio</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => {
              const nombre = "distrito" in f ? f.distrito : f.institucion;
              return (
                <tr
                  key={`${nombre}-${i}`}
                  className={`border-b border-brand-outline/40 ${
                    f.base_suficiente ? "" : "bg-neutral-900/40 text-neutral-500"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className={f.base_suficiente ? "text-neutral-200" : ""}>{nombre}</span>
                    {!f.base_suficiente && (
                      <span
                        className="ml-2 rounded border border-neutral-700 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500"
                        title={`Base menor a ${A.base.umbral_supresion}: suprimido por Ley 29733`}
                      >
                        base insuficiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{f.n_estudiantes}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {f.carga_estimada === null ? (
                      <span className="text-neutral-600">base insuficiente</span>
                    ) : (
                      f.carga_estimada.toFixed(1)
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    {formatearCelda(f.satisfactorio)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    {formatearCelda(f.previo_al_inicio)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-neutral-500">
        Referencia interna {A.referencia_interna.valor}% en satisfactorio, {A.referencia_interna.etiqueta}.{" "}
        {A.base.escuelas_n_igual_1} escuelas tienen un solo estudiante evaluado y{" "}
        {A.base.escuelas_bajo_5} tienen menos de {A.base.umbral_supresion}: sus celdas se suprimen.
        Esto es priorizacion de apoyo, nunca un ranking de peores colegios.
      </p>
    </main>
  );
}
