"use client";

import { useMemo, useState } from "react";

type Celda =
  | { estado: "publicado"; pct: number; n: number; origen: "REAL" | "SIMULADO" }
  | { estado: "suprimido"; motivo: string; n: number; origen: "REAL" | "SIMULADO" };

type Fila = {
  tipo: string;
  nombre: string;
  n_referencia: number;
  anios: Record<string, Celda>;
};

export type HistoricoData = {
  _meta: { anio_real: number; anios_simulados: number[]; umbral_supresion: number };
  anios: number[];
  filas: Fila[];
};

// Forma del dato que pide la seccion 3 del addendum. Se calcula aca y se muestra
// tal cual en el inspector, para que se vea que el modulo produce el contrato
// pedido y no una tabla decorativa.
type Comparacion = {
  periodo_base: number;
  periodo_comparado: number;
  delta_porcentual: number | null;
  alerta_visual: "verde" | "rojo" | "neutro" | "sin_dato";
  tendencia: "sube" | "baja" | "estable" | "sin_dato";
};

function comparar(fila: Fila, base: number, comparado: number): Comparacion {
  const a = fila.anios[String(base)];
  const b = fila.anios[String(comparado)];
  if (!a || !b || a.estado !== "publicado" || b.estado !== "publicado") {
    return {
      periodo_base: base,
      periodo_comparado: comparado,
      delta_porcentual: null,
      alerta_visual: "sin_dato",
      tendencia: "sin_dato",
    };
  }
  const delta = Math.round((b.pct - a.pct) * 100) / 100;
  // umbral muerto: por debajo de medio punto no llamamos tendencia a nada
  const tendencia = delta > 0.5 ? "sube" : delta < -0.5 ? "baja" : "estable";
  return {
    periodo_base: base,
    periodo_comparado: comparado,
    delta_porcentual: delta,
    alerta_visual: tendencia === "sube" ? "verde" : tendencia === "baja" ? "rojo" : "neutro",
    tendencia,
  };
}

const FLECHA = { sube: "▲", baja: "▼", estable: "→", sin_dato: "·" } as const;
const COLOR_ALERTA = {
  verde: "text-brand-green",
  rojo: "text-rose-400",
  neutro: "text-neutral-400",
  sin_dato: "text-neutral-600",
} as const;

export default function HistoricoVista({ data }: { data: HistoricoData }) {
  const [modo, setModo] = useState<"anio" | "comparacion">("anio");
  const [anio, setAnio] = useState<number>(data._meta.anio_real);
  const [base, setBase] = useState<number>(data.anios[0]);
  const [comparado, setComparado] = useState<number>(data._meta.anio_real);

  const filas = useMemo(() => data.filas.filter((f) => f.tipo === "distrito"), [data.filas]);

  const esSimulado = (a: number) => data._meta.anios_simulados.includes(a);

  const ordenadas = useMemo(() => {
    if (modo === "anio") {
      return [...filas].sort((x, y) => {
        const cx = x.anios[String(anio)];
        const cy = y.anios[String(anio)];
        const vx = cx?.estado === "publicado" ? cx.pct : -1;
        const vy = cy?.estado === "publicado" ? cy.pct : -1;
        return vy - vx;
      });
    }
    return [...filas].sort((x, y) => {
      const dx = comparar(x, base, comparado).delta_porcentual;
      const dy = comparar(y, base, comparado).delta_porcentual;
      return (dy ?? -999) - (dx ?? -999);
    });
  }, [filas, modo, anio, base, comparado]);

  const botonAnio = (a: number, activo: boolean, onClick: () => void) => (
    <button
      key={a}
      onClick={onClick}
      className={`rounded border px-3 py-1.5 font-mono text-xs tabular-nums transition-colors ${
        activo
          ? "border-brand-green/60 bg-brand-green/10 text-brand-green"
          : "border-brand-outline text-neutral-400 hover:text-white"
      }`}
    >
      {a}
      {esSimulado(a) && <span className="ml-1.5 text-[9px] uppercase text-amber-400">sim</span>}
    </button>
  );

  return (
    <div>
      {/* ── marca de procedencia: permanente, no un pie de pagina ─────────── */}
      <div className="mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded border border-amber-400/60 bg-amber-400/10 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-amber-300 sm:text-xs">
            2024-2025 simulados
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-amber-200/90 sm:text-xs">
            demostracion de funcionalidad
          </span>
        </div>
        <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-amber-100/80">
          No existe fuente para 2024 ni 2025. Esos porcentajes fueron generados para mostrar que el
          modulo de comparacion interanual funciona. Ninguna cifra de esos dos anios describe algo
          que haya ocurrido, y ninguna debe citarse. Lo real aca son los nombres de los{" "}
          {filas.length} distritos, sus bases y las cifras de {data._meta.anio_real}.
        </p>
      </div>

      {/* ── controles ────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Vista
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setModo("anio")}
              className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
                modo === "anio"
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-brand-outline text-neutral-400 hover:text-white"
              }`}
            >
              Un anio
            </button>
            <button
              onClick={() => setModo("comparacion")}
              className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
                modo === "comparacion"
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-brand-outline text-neutral-400 hover:text-white"
              }`}
            >
              Comparacion
            </button>
          </div>
        </div>

        {modo === "anio" ? (
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Anio
            </p>
            <div className="flex gap-2">
              {data.anios.map((a) => botonAnio(a, a === anio, () => setAnio(a)))}
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Periodo base
              </p>
              <div className="flex gap-2">
                {data.anios.map((a) => botonAnio(a, a === base, () => setBase(a)))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Periodo comparado
              </p>
              <div className="flex gap-2">
                {data.anios.map((a) => botonAnio(a, a === comparado, () => setComparado(a)))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── tabla ────────────────────────────────────────────────────────── */}
      <section className="mt-6 overflow-x-auto rounded-lg border border-brand-outline bg-brand-surface2">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-brand-outline text-left font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              <th className="px-4 py-3 font-normal">Distrito</th>
              <th className="px-4 py-3 text-right font-normal">Base</th>
              {modo === "anio" ? (
                <>
                  <th className="px-4 py-3 text-right font-normal">Satisfactorio {anio}</th>
                  <th className="px-4 py-3 text-right font-normal">Origen</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-right font-normal">{base}</th>
                  <th className="px-4 py-3 text-right font-normal">{comparado}</th>
                  <th className="px-4 py-3 text-right font-normal">Delta</th>
                  <th className="px-4 py-3 text-center font-normal">Tendencia</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((f) => {
              const cmp = comparar(f, base, comparado);
              const cA = f.anios[String(base)];
              const cB = f.anios[String(comparado)];
              const cUno = f.anios[String(anio)];
              return (
                <tr key={f.nombre} className="border-b border-brand-outline/40 last:border-0">
                  <td className="px-4 py-2.5 text-neutral-200">{f.nombre}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-neutral-500">
                    {f.n_referencia}
                  </td>
                  {modo === "anio" ? (
                    <>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-white">
                        {cUno?.estado === "publicado" ? `${cUno.pct.toFixed(2)}%` : "suprimido"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                            esSimulado(anio)
                              ? "border-amber-400/50 text-amber-300"
                              : "border-brand-green/50 text-brand-green"
                          }`}
                        >
                          {esSimulado(anio) ? "simulado" : "real"}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-neutral-400">
                        {cA?.estado === "publicado" ? `${cA.pct.toFixed(2)}%` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-neutral-400">
                        {cB?.estado === "publicado" ? `${cB.pct.toFixed(2)}%` : "—"}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-mono tabular-nums ${COLOR_ALERTA[cmp.alerta_visual]}`}
                      >
                        {cmp.delta_porcentual === null
                          ? "—"
                          : `${cmp.delta_porcentual > 0 ? "+" : ""}${cmp.delta_porcentual.toFixed(2)}`}
                      </td>
                      <td className={`px-4 py-2.5 text-center text-base ${COLOR_ALERTA[cmp.alerta_visual]}`}>
                        {FLECHA[cmp.tendencia]}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ── contrato del addendum, visible ───────────────────────────────── */}
      {modo === "comparacion" && ordenadas.length > 0 && (
        <section className="mt-6 rounded-lg border border-brand-outline bg-brand-surface2 p-5">
          <h2 className="font-display text-lg font-semibold text-white">
            Forma del dato que emite el modulo
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-neutral-500">
            Una fila del resultado, con el esquema de la seccion 3 del addendum. Es el contrato que
            consumiria el reporte, no una tabla de pantalla.
          </p>
          <pre className="mt-3 overflow-x-auto rounded border border-brand-outline bg-brand-surface p-3.5 font-mono text-[11px] leading-relaxed text-neutral-300">
{JSON.stringify(
  {
    ambito: ordenadas[0].nombre,
    ...comparar(ordenadas[0], base, comparado),
    origen_periodo_base: esSimulado(base) ? "SIMULADO" : "REAL",
    origen_periodo_comparado: esSimulado(comparado) ? "SIMULADO" : "REAL",
  },
  null,
  2
)}
          </pre>
        </section>
      )}
    </div>
  );
}
