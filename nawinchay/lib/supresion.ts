/**
 * supresion.ts — Ley 29733 aplicada en el sistema de tipos, no en un filtro.
 *
 * La union discriminada hace ESTRUCTURALMENTE IMPOSIBLE pintar una IE de n=1:
 * el caso `suprimido` no tiene campo `pct`, asi que TypeScript no compila si un
 * render lo ignora. Un filtro es algo que alguien olvida a las 15:20; esto no.
 *
 * Contexto que da peso a la regla: 22 de las 141 escuelas de Atisunchik III
 * tienen exactamente un estudiante evaluado. Publicar su nivel de logro es
 * publicar el resultado identificable de un menor de edad.
 */

export const UMBRAL_SUPRESION = 5;

export type Celda =
  | { estado: "publicado"; pct: number; n: number }
  | { estado: "suprimido" };

/** Etiqueta lista para pintar. EXIGE que el n viaje con el porcentaje. */
export function formatearCelda(c: Celda): string {
  if (c.estado === "suprimido") return "base insuficiente";
  return `${c.pct.toFixed(1)}% (n=${c.n})`;
}

/** Solo el numero, para ejes y barras. `null` cuando no hay nada publicable. */
export function valorCelda(c: Celda): number | null {
  return c.estado === "publicado" ? c.pct : null;
}

export function esPublicable(c: Celda): c is { estado: "publicado"; pct: number; n: number } {
  return c.estado === "publicado";
}

// ── categorias del semaforo de items ────────────────────────────────────────
// TRES salidas, no dos. `sin_replica` existe porque un delta indefinido no es
// evidencia de nada y NO debe heredar la categoria mas fuerte por descarte.
// En la UI va como tercera categoria EXPLICITA, nunca como celda vacia: vacia
// se lee "sin problema" y aqui significa "sin medir".
export type CategoriaItem =
  | "normal"
  | "defecto_item"
  | "concepcion_errada"
  | "sin_replica";

export const ETIQUETA_CATEGORIA: Record<CategoriaItem, string> = {
  normal: "Sin anomalia",
  defecto_item: "Defecto de item",
  concepcion_errada: "Concepcion errada compartida",
  sin_replica: "Sin replica disponible",
};

export const COLOR_CATEGORIA: Record<CategoriaItem, string> = {
  normal: "text-neutral-400 border-neutral-700",
  defecto_item: "text-rose-300 border-rose-500/50",
  concepcion_errada: "text-amber-300 border-amber-500/50",
  sin_replica: "text-sky-300 border-sky-500/50",
};

// ── tipos del canonico ──────────────────────────────────────────────────────
export type ItemEra = {
  item: number;
  clave: string;
  competencia: string;
  capacidad: string;
  desempeno_precisado: string;
  nivel_estimacion_tabla: string;
  huaytara: { k: number; n: number; pct: number };
  resto_regional: { k: number; n: number; pct: number };
  delta_pp: number;
  margen: { lo: number; hi: number };
  z_contra_azar_huaytara: number;
  z_contra_azar_resto: number;
  bajo_azar: boolean;
  categoria: CategoriaItem;
};

export type FilaAtisunchik = {
  n_estudiantes: number;
  satisfactorio: Celda;
  proceso: Celda;
  inicio: Celda;
  previo_al_inicio: Celda;
  /**
   * `null` cuando la base no alcanza. Es OBLIGATORIO que sea nullable: carga es
   * n por (inicio mas previo), asi que publicarla junto a un n visible permite
   * despejar el porcentaje que la supresion acababa de ocultar. Un campo derivado
   * de un dato suprimido hereda la supresion.
   */
  carga_estimada: number | null;
  base_suficiente: boolean;
};

export type Escuela = FilaAtisunchik & { institucion: string };
export type Distrito = FilaAtisunchik & { distrito: string };

export type Canonico = {
  meta: Record<string, string>;
  era: {
    fuente: string;
    corte: { area: string; grado: string; nivel: string; ugel: string };
    soporta_conteos: boolean;
    denominador: { huaytara: number; regional: number; resto_regional: number; nota: string };
    azar: {
      valor: number;
      alternativas: number;
      alternativas_confirmadas: boolean;
      nota: string;
    };
    items: ItemEra[];
    capacidades: {
      capacidad: string;
      n_items: number;
      n_items_limpios: number;
      items: number[];
      items_excluidos: number[];
      /** promedio EXCLUYENDO items anomalos. Es el que se muestra y se dice en voz alta. */
      pct_promedio: number;
      pct_promedio_con_anomalos: number;
      medible: boolean;
      advertencia: string | null;
      sin_items_limpios: boolean;
      contiene_item_anomalo: boolean;
    }[];
    por_area_regional: Record<string, string | number>[];
  };
  atisunchik: {
    fuente: string;
    edicion: string;
    soporta_conteos: boolean;
    totales: {
      n_estudiantes: number;
      satisfactorio: number;
      proceso: number;
      inicio: number;
      previo_al_inicio: number;
    };
    referencia_interna: { valor: number; etiqueta: string; nota: string };
    base: {
      umbral_supresion: number;
      escuelas_total: number;
      escuelas_n_igual_1: number;
      escuelas_bajo_5: number;
      escuelas_bajo_10: number;
      escuelas_publicables: number;
      estudiantes_en_publicables: number;
      pct_estudiantes_conservados: number;
    };
    carga_total_estimada: number;
    distritos: Distrito[];
    escuelas: Escuela[];
  };
};
