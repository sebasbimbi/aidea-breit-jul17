import canonicoRaw from "@/data/canonico.json";
import {
  ETIQUETA_CATEGORIA,
  COLOR_CATEGORIA,
  type Canonico,
  type CategoriaItem,
} from "@/lib/supresion";

const canonico = canonicoRaw as unknown as Canonico;
const E = canonico.era;

const MAX = 100;
const pos = (pct: number) => `${Math.min(100, Math.max(0, pct))}%`;

export default function Items() {
  const i3 = E.items.find((i) => i.item === 3)!;
  const i9 = E.items.find((i) => i.item === 9)!;
  const anomalos = E.items.filter((i) => i.categoria !== "normal");
  const itemUnico = E.capacidades.filter((c) => c.n_items === 1);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-8 flex gap-5 font-mono text-xs uppercase tracking-widest">
        <a href="/" className="text-neutral-500 hover:text-white">Inicio</a>
        <a href="/priorizacion" className="text-neutral-500 hover:text-white">Priorizacion</a>
        <span className="text-brand-green">Items</span>
      </nav>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        La prueba tambien se evalua
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
        {E.corte.area}, {E.corte.grado}, UGEL {E.corte.ugel}. n = {E.denominador.huaytara}.
        Censo completo de items.
      </p>

      {/* ── dot-plot de los 20 items ─────────────────────────────────────── */}
      <section className="mt-8 rounded-lg border border-brand-outline bg-brand-surface2 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-white">Acierto por item</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            linea de azar {E.azar.valor}% ({E.azar.alternativas} alternativas
            {E.azar.alternativas_confirmadas ? "" : ", sin confirmar"})
          </p>
        </div>

        <div className="mt-5 space-y-1.5">
          {E.items.map((it) => {
            const anomalo = it.categoria !== "normal";
            return (
              <div key={it.item} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-right font-mono text-[11px] tabular-nums text-neutral-500">
                  {it.item}
                </span>
                <div className="relative h-6 flex-1 rounded bg-neutral-900">
                  {/* linea del azar */}
                  <div
                    className="absolute top-0 h-full w-px bg-neutral-600"
                    style={{ left: pos((E.azar.valor / MAX) * 100) }}
                  />
                  {/* margen de incertidumbre */}
                  <div
                    className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full ${
                      anomalo ? "bg-rose-500/30" : "bg-neutral-700"
                    }`}
                    style={{
                      left: pos(it.margen.lo),
                      width: pos(Math.max(0.6, it.margen.hi - it.margen.lo)),
                    }}
                  />
                  {/* punto */}
                  <div
                    className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                      it.categoria === "defecto_item"
                        ? "bg-rose-400 ring-2 ring-rose-400/30"
                        : it.categoria === "concepcion_errada"
                          ? "bg-amber-400 ring-2 ring-amber-400/30"
                          : "bg-brand-green"
                    }`}
                    style={{ left: pos(it.huaytara.pct) }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-[11px] tabular-nums text-neutral-400">
                  {it.huaytara.pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-neutral-500">
          La barra es el <strong className="text-neutral-300">margen de incertidumbre de medicion</strong>{" "}
          (Wilson, sin correccion por conglomerado), no un intervalo de confianza al 95 por ciento:
          los {E.denominador.huaytara} son practicamente el censo de la UGEL y estan agrupados en aulas.
          El intervalo mide incertidumbre del instrumento, no de muestreo.
        </p>
      </section>

      {/* ── item 3 contra item 9 ─────────────────────────────────────────── */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {[i3, i9].map((it) => (
          <article
            key={it.item}
            className={`rounded-lg border bg-brand-surface2 p-5 ${
              COLOR_CATEGORIA[it.categoria as CategoriaItem].split(" ")[1]
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-white">Item {it.item}</h3>
              <span
                className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  COLOR_CATEGORIA[it.categoria as CategoriaItem]
                }`}
              >
                {ETIQUETA_CATEGORIA[it.categoria as CategoriaItem]}
              </span>
            </div>

            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              {it.capacidad}
            </p>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Huaytara</dt>
                <dd className="font-mono tabular-nums text-white">
                  {it.huaytara.pct.toFixed(2)}% <span className="text-neutral-600">({it.huaytara.k}/{it.huaytara.n})</span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Resto de la region</dt>
                <dd className="font-mono tabular-nums text-white">
                  {it.resto_regional.pct.toFixed(2)}%{" "}
                  <span className="text-neutral-600">({it.resto_regional.k}/{it.resto_regional.n})</span>
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-brand-outline pt-2">
                <dt className="text-neutral-400">Se mueve</dt>
                <dd className="font-mono tabular-nums text-white">
                  {Math.abs(it.delta_pp).toFixed(2)} puntos
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">z contra el azar (resto)</dt>
                <dd className="font-mono tabular-nums text-white">{it.z_contra_azar_resto}</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-neutral-400">
              {it.item === 3 ? (
                <>
                  Se mueve una centesima entre dos poblaciones que no comparten un solo estudiante.
                  Un item defectuoso falla identico en todas partes; una brecha de aprendizaje varia.
                  Sobrevive 3, 4 o 5 alternativas: no depende del supuesto del azar.
                </>
              ) : (
                <>
                  Se mueve {Math.abs(it.delta_pp).toFixed(2)} puntos entre poblaciones disjuntas, de modo
                  que no es una propiedad limpia del item. Con 4 alternativas esta bajo el azar; con 5
                  estaria justo en el azar y no afirmamos nada sobre el. No pudimos confirmar el numero
                  de alternativas y por eso lo decimos asi.
                </>
              )}
            </p>
          </article>
        ))}
      </section>

      {/* ── capacidades de item unico ────────────────────────────────────── */}
      <section className="mt-6 rounded-lg border border-brand-outline bg-brand-surface2 p-5">
        <h2 className="font-display text-lg font-semibold text-white">
          Capacidades medidas por un solo item
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-neutral-500">
          Un item dicotomico unico no permite separar el comportamiento del item del dominio de la
          capacidad. No hay redundancia ni contraste posible, y toda la incertidumbre del item se
          traslada integra al resultado de la capacidad.
        </p>
        <ul className="mt-4 space-y-2">
          {itemUnico.map((c) => {
            const it = E.items.find((i) => i.item === c.items[0])!;
            return (
              <li
                key={c.capacidad}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-brand-outline/60 px-3 py-2"
              >
                <span className="text-sm text-neutral-200">{c.capacidad}</span>
                <span className="font-mono text-xs tabular-nums text-neutral-400">
                  item {c.items[0]} · {it.huaytara.pct.toFixed(2)}%
                  {it.categoria !== "normal" && (
                    <span className="ml-2 text-rose-300">{ETIQUETA_CATEGORIA[it.categoria as CategoriaItem]}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-neutral-500">
        {anomalos.length} de {E.items.length} items quedan marcados en este corte. Detectarlo exige
        cruzar la clave, la respuesta por item y el umbral de azar a la vez. El calculo no es dificil:
        lo que no encontramos en los reportes recibidos es esto expuesto como alerta rutinaria por
        item, que llegue a quien redacta el plan de remediacion.
      </p>
    </main>
  );
}
