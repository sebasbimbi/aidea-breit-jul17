// Genera data/historico-simulado.json
//
// QUE ES REAL Y QUE NO, sin ambiguedad:
//   - REAL: los nombres de distrito, los nombres de IE, las bases (n_estudiantes)
//     y las cifras de 2026. Todo eso sale de data/canonico.json, que no se toca.
//   - SIMULADO: unicamente los porcentajes de 2024 y 2025. No existe fuente para
//     esos anios. Se generan aca para demostrar que el modulo interanual funciona.
//
// Cada fila generada lleva origen: "SIMULADO". La marca vive en el DATO, no solo
// en la interfaz: si alguien lee el JSON del bundle sin ver la pantalla, la marca
// sigue estando. Ese es el punto.
//
// Determinista a proposito: la semilla sale del nombre del distrito, asi que dos
// corridas producen el mismo archivo y el resultado es auditable. Sin Math.random.

const fs = require("fs");
const path = require("path");

const UMBRAL_SUPRESION = 5; // mismo umbral que lib/supresion.ts
const ANIO_REAL = 2026;
const ANIOS_SIMULADOS = [2024, 2025];

const canonico = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "canonico.json"), "utf8")
);

// PRNG determinista (mulberry32) sembrado con un hash del nombre.
function semilla(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) {
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function prng(s) {
  let a = s;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Los distritos con base grande se mueven menos que los chicos. La dispersion cae
// con la raiz de n, que es como se comporta el error de una proporcion.
function pasoInteranual(rand, n) {
  const sigma = Math.min(6, 14 / Math.sqrt(Math.max(n, 1)));
  // suma de dos uniformes: campana suave, sin colas absurdas
  const z = rand() + rand() - 1;
  return z * sigma * 2;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const r2 = (v) => Math.round(v * 100) / 100;

// Reconstruye hacia atras desde el valor real de 2026.
function serieRetro(nombre, pct2026, n) {
  const rand = prng(semilla(nombre));
  const porAnio = { [ANIO_REAL]: r2(pct2026) };
  let actual = pct2026;
  // 2025 primero, despues 2024: caminamos hacia atras desde el dato real
  for (const anio of [...ANIOS_SIMULADOS].reverse()) {
    actual = clamp(actual - pasoInteranual(rand, n), 0, 100);
    porAnio[anio] = r2(actual);
  }
  return porAnio;
}

function celda(pct, n, origen) {
  if (n < UMBRAL_SUPRESION) {
    return { estado: "suprimido", motivo: "base_insuficiente", n, origen };
  }
  return { estado: "publicado", pct: r2(pct), n, origen };
}

function construirFilas(entradas, tipo) {
  return entradas.map((e) => {
    const nombre = e.nombre;
    const n = e.n;
    const serie = serieRetro(nombre, e.pct2026, n);
    const anios = {};
    for (const anio of [...ANIOS_SIMULADOS, ANIO_REAL]) {
      const origen = anio === ANIO_REAL ? "REAL" : "SIMULADO";
      // el n tambien se marca: para los anios simulados no hay matricula conocida,
      // se reusa la base real como referencia estructural, no como medicion
      anios[anio] = celda(serie[anio], n, origen);
    }
    return { tipo, nombre, n_referencia: n, anios };
  });
}

// ── distritos: 16, nombres y bases reales ──────────────────────────────────
const distritos = canonico.atisunchik.distritos
  .filter((d) => d.satisfactorio && d.satisfactorio.estado === "publicado")
  .map((d) => ({ nombre: d.distrito, n: d.n_estudiantes, pct2026: d.satisfactorio.pct }));

// los distritos suprimidos en canonico entran igual, pero suprimidos en toda la serie
const distritosSuprimidos = canonico.atisunchik.distritos
  .filter((d) => !d.satisfactorio || d.satisfactorio.estado !== "publicado")
  .map((d) => ({
    tipo: "distrito",
    nombre: d.distrito,
    n_referencia: d.n_estudiantes,
    anios: Object.fromEntries(
      [...ANIOS_SIMULADOS, ANIO_REAL].map((a) => [
        a,
        {
          estado: "suprimido",
          motivo: "base_insuficiente",
          n: d.n_estudiantes,
          origen: a === ANIO_REAL ? "REAL" : "SIMULADO",
        },
      ])
    ),
  }));

// ── escuelas: nombres y bases reales del padron ────────────────────────────
const escuelas = canonico.atisunchik.escuelas
  .filter((e) => e.satisfactorio && e.satisfactorio.estado === "publicado")
  .map((e) => ({
    nombre: e.institucion_publica || e.institucion,
    n: e.n_estudiantes,
    pct2026: e.satisfactorio.pct,
  }));

const filas = [
  ...construirFilas(distritos, "distrito"),
  ...distritosSuprimidos,
  ...construirFilas(escuelas, "escuela"),
];

const salida = {
  _meta: {
    que_es:
      "Serie historica de demostracion. Los anios 2024 y 2025 son SIMULADOS: no existe fuente para ellos.",
    real: "Nombres de distrito e institucion, bases (n) y todas las cifras de 2026. Provienen de data/canonico.json.",
    simulado:
      "Unicamente los porcentajes de logro satisfactorio de 2024 y 2025. Generados de forma determinista para demostrar el modulo interanual.",
    advertencia:
      "Ninguna cifra de 2024 o 2025 debe citarse como hallazgo. La pantalla demuestra que el modulo funciona, no que algo haya ocurrido.",
    generado: "2026-07-18",
    determinista: true,
    umbral_supresion: UMBRAL_SUPRESION,
    anio_real: ANIO_REAL,
    anios_simulados: ANIOS_SIMULADOS,
    indicador: "satisfactorio",
  },
  anios: [...ANIOS_SIMULADOS, ANIO_REAL],
  filas,
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "historico-simulado.json"),
  JSON.stringify(salida, null, 1)
);

const pub = filas.filter((f) => f.anios[ANIO_REAL].estado === "publicado").length;
console.log(
  `ok: ${filas.length} filas (${filas.filter((f) => f.tipo === "distrito").length} distritos, ` +
    `${filas.filter((f) => f.tipo === "escuela").length} escuelas), ${pub} publicables en ${ANIO_REAL}`
);
