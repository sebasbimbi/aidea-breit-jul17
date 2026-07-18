import HistoricoVista, { type HistoricoData } from "@/components/HistoricoVista";
import historicoRaw from "@/data/historico-simulado.json";

const data = historicoRaw as unknown as HistoricoData;

export default function Historico() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-8 flex gap-5 font-mono text-xs uppercase tracking-widest">
        <a href="/" className="text-neutral-500 hover:text-white">Inicio</a>
        <a href="/priorizacion" className="text-neutral-500 hover:text-white">Priorizacion</a>
        <a href="/items" className="text-neutral-500 hover:text-white">Items</a>
        <span className="text-brand-green">Historico</span>
      </nav>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Comparacion interanual
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
        El modulo compara dos periodos sobre el mismo ambito y emite el delta con su alerta visual.
        Lo que se demuestra aca es la capacidad de comparar, no un resultado.
      </p>

      <HistoricoVista data={data} />

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-neutral-500">
        La regla de base minima rige igual que en el resto del producto: un ambito por debajo del
        umbral se muestra suprimido en toda la serie, no solo en el anio en que cae. Una comparacion
        contra una celda suprimida no devuelve cero ni se rellena: devuelve sin dato, porque no
        saberlo y que no haya cambiado no son la misma cosa.
      </p>
    </main>
  );
}
