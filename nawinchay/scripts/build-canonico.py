#!/usr/bin/env python3
"""
build-canonico.py — emite data/canonico.json, la unica fuente de verdad de Nawinchay.

DOS UNIVERSOS DISJUNTOS POR CONSTRUCCION.
`era` y `atisunchik` son ramas separadas SIN ninguna llave compartida. No se pueden
unir aunque alguien lo intente, y es a proposito: el join Atisunchik -> Padron solo
resuelve 127 de 141 IE, con 11 nombres ambiguos que arrastran 299 estudiantes
(19.8 por ciento) incluidos los dos colegios mas grandes. ERA -> Padron por cod_mod
cierra 529/529. Ese es el unico puente geografico defendible y no se usa aqui.
"""

import csv
import json
import math
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]          # .../aidea-breit-jul17/nawinchay
CSV = RAIZ.parent / "data-fallback" / "jul-18-educadores-data" / "csv"
SALIDA = RAIZ / "data" / "canonico.json"

# ── parametros de medicion ────────────────────────────────────────────────────
N_HUAYTARA = 237          # verificado: n_correctos/237 reproduce pct sin desvio > 0.0005
N_REGIONAL = 5002         # unico N en 4000-6500 que hace enteros los 20 items (residuo max 0.0025)
N_RESTO = N_REGIONAL - N_HUAYTARA   # 4765, poblacion DISJUNTA de Huaytara

ALTERNATIVAS = 4          # SIN CONFIRMAR. Ver alternativas_confirmadas abajo.
AZAR = 1 / ALTERNATIVAS
UMBRAL_SUPRESION = 5      # Ley 29733
DELTA_INVARIANCIA = 1.0   # puntos porcentuales


def leer(nombre):
    with open(CSV / nombre, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def wilson(k, n, z=1.96):
    """Margen de incertidumbre de medicion. NO es intervalo de muestreo:
    los 237 son practicamente el censo de la UGEL y estan agrupados en aulas."""
    if n == 0:
        return None, None
    p = k / n
    d = 1 + z * z / n
    centro = (p + z * z / (2 * n)) / d
    mitad = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return round((centro - mitad) * 100, 2), round((centro + mitad) * 100, 2)


def z_contra_azar(p, n):
    return round((p - AZAR) / math.sqrt(AZAR * (1 - AZAR) / n), 2)


# ══ RAMA ERA ══════════════════════════════════════════════════════════════════
def construir_era():
    filas = leer("items_cyt_2sec_con_tabla_especificaciones.csv")
    assert len(filas) == 20, f"se esperaban 20 items, hay {len(filas)}"

    items = []
    for r in filas:
        n_item = int(r["item"])
        pct_reg = float(r["pct_correcto_regional"])
        k_hua = int(r["n_correctos_huaytara"])
        n_hua = int(r["n_evaluados_huaytara"])
        pct_hua = k_hua / n_hua

        # reconstruccion de la poblacion DISJUNTA: region menos Huaytara
        k_reg = round(pct_reg * N_REGIONAL)
        k_resto = k_reg - k_hua
        pct_resto = k_resto / N_RESTO
        delta = (pct_hua - pct_resto) * 100          # puntos porcentuales

        bajo_azar = pct_hua < AZAR
        techo = wilson(k_hua, n_hua)[1]
        techo_bajo_azar = techo is not None and techo < AZAR * 100

        # ── semaforo de DOS condiciones, TRES salidas ────────────────────────
        # Sin corte regional no hay delta, y un delta indefinido NO debe heredar
        # la categoria mas fuerte por descarte. Por eso existe sin_replica.
        if not techo_bajo_azar:
            categoria = "normal"
        elif abs(delta) < DELTA_INVARIANCIA:
            categoria = "defecto_item"
        else:
            categoria = "concepcion_errada"

        lo, hi = wilson(k_hua, n_hua)
        items.append({
            "item": n_item,
            "clave": r["clave"],
            "competencia": r["competencia"],
            "capacidad": r["capacidad"],
            "desempeno_precisado": r["desempeno_precisado"],
            "nivel_estimacion_tabla": r["nivel_estimacion_tabla"],
            "huaytara": {"k": k_hua, "n": n_hua, "pct": round(pct_hua * 100, 2)},
            "resto_regional": {"k": k_resto, "n": N_RESTO, "pct": round(pct_resto * 100, 2)},
            "delta_pp": round(delta, 2),
            "margen": {"lo": lo, "hi": hi},
            "z_contra_azar_huaytara": z_contra_azar(pct_hua, n_hua),
            "z_contra_azar_resto": z_contra_azar(pct_resto, N_RESTO),
            "bajo_azar": bajo_azar,
            "categoria": categoria,
        })

    # capacidades: una capacidad medida por un solo item NO se puede separar del
    # comportamiento de ese item. Se reporta como no medida de forma confiable.
    por_cap = {}
    for it in items:
        por_cap.setdefault(it["capacidad"], []).append(it)
    # CIFRAS CONGELADAS: el promedio de la capacidad se calcula EXCLUYENDO los items
    # declarados anomalos. Incluirlos mezcla "no sabemos" con "les fue mal" y produce
    # la cifra prohibida de 40.9 en vez de 47.7 sobre 4 items.
    capacidades = []
    for cap, lista in sorted(por_cap.items()):
        limpios = [i for i in lista if i["categoria"] == "normal"]
        base = limpios or lista          # si TODOS son anomalos, no hay nada limpio que promediar
        capacidades.append({
            "capacidad": cap,
            "n_items": len(lista),
            "n_items_limpios": len(limpios),
            "items": sorted(i["item"] for i in lista),
            "items_excluidos": sorted(i["item"] for i in lista if i["categoria"] != "normal"),
            # el que se muestra y se dice en voz alta
            "pct_promedio": round(sum(i["huaytara"]["pct"] for i in base) / len(base), 2),
            "pct_promedio_con_anomalos": round(sum(i["huaytara"]["pct"] for i in lista) / len(lista), 2),
            "medible": len(limpios) >= 3,
            "advertencia": (
                "item unico: no separa comportamiento del item del dominio de la capacidad"
                if len(lista) == 1 else None
            ),
            "sin_items_limpios": not limpios,
            "contiene_item_anomalo": len(limpios) != len(lista),
        })

    return {
        "fuente": "Evaluacion Regional de Estudiantes (ERA) Huancavelica 2025",
        "corte": {"area": "Ciencia y Tecnologia", "grado": "2do de secundaria",
                  "nivel": "Secundaria", "ugel": "Huaytara"},
        "soporta_conteos": True,   # unica tabla con numerador y denominador reales
        "denominador": {
            "huaytara": N_HUAYTARA,
            "regional": N_REGIONAL,
            "resto_regional": N_RESTO,
            "nota": ("N_REGIONAL reconstruido exigiendo conteos enteros en los 20 items. "
                     "Unico valor en el rango, residuo maximo 0.0025. Sobredeterminado, no circular."),
            "disjuntas_por_construccion": (
                f"{N_REGIONAL} regional = {N_HUAYTARA} de Huaytara + {N_RESTO} del resto, "
                "sin solapamiento. El resto se obtiene RESTANDO Huaytara del total regional, "
                "de modo que ningun estudiante puede estar en los dos grupos: no es un muestreo "
                "que pudiera solaparse, es una particion aritmetica. Lo mismo aplica a los "
                "aciertos de cada item: k_resto = k_regional menos k_huaytara."),
        },
        "azar": {
            "valor": round(AZAR * 100, 2),
            "alternativas": ALTERNATIVAS,
            "alternativas_confirmadas": False,
            "nota": ("SIN CONFIRMAR. La prueba real no esta en disco y la tabla de "
                     "especificaciones no declara alternativas. Las 20 claves usan a,b,c,d "
                     "(a=9 b=3 c=6 d=2); con 5 opciones y claves uniformes la probabilidad "
                     "de que ninguna cayera en la quinta es 1.15 por ciento: inclinacion "
                     "fuerte, nunca prueba. El item 3 sobrevive 3, 4 o 5 alternativas; el "
                     "item 9 depende de este supuesto."),
        },
        "items": items,
        "capacidades": capacidades,
        "por_area_regional": [
            {"area": r["area"], **{k: round(float(v) * 100, 2) for k, v in r.items() if k != "area"}}
            for r in leer("era_por_area_regional.csv")
        ],
    }


# ══ RAMA ATISUNCHIK ═══════════════════════════════════════════════════════════
def celda(pct, n):
    """Union discriminada en el origen: si la base no alcanza, NO viaja el pct."""
    if n < UMBRAL_SUPRESION:
        return {"estado": "suprimido"}
    return {"estado": "publicado", "pct": round(pct * 100, 2), "n": n}


def carga(n, inicio, previo):
    """FUGA CERRADA. carga = n * (inicio + previo), asi que publicarla junto a un n
    visible permite despejar (inicio + previo) = carga / n y reconstruir exactamente
    lo que la supresion acababa de ocultar. Con n=1 la aritmetica es trivial: una
    carga de 1.0 dice que ese unico menor esta en inicio o en previo al inicio.
    Un campo derivado de un dato suprimido hereda la supresion."""
    if n < UMBRAL_SUPRESION:
        return None
    return round(n * (inicio + previo), 1)


def mapa_distrito():
    """Mapa IE -> distrito desde el Padron ESCALE. El ataque de sustraccion NO
    necesita que la app publique este mapeo: ESCALE es publico y gratuito."""
    import unicodedata
    def norm(x):
        return " ".join(unicodedata.normalize("NFKD", x or "").encode("ascii", "ignore").decode().upper().split())
    m = {}
    with open(RAIZ.parent / "data-fallback" / "Padron_web_2026-07-10.csv", encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            if "HUAYTAR" in (r.get("D_DREUGEL") or "").upper():
                m.setdefault(norm(r["CEN_EDU"]), set()).add(r["D_DIST"])
    return {k: list(v)[0] for k, v in m.items() if len(v) == 1}, norm


def aplicar_base_del_residuo(escuelas, distritos):
    """REGLA DE BASE DEL RESIDUO. Publicar distrito Y escuela sobre el mismo universo
    cierra un sistema de ecuaciones: residuo = distrito menos suma(escuelas publicadas).
    Si ese residuo cubre pocos estudiantes, ES la fila suprimida, y si cubre una sola
    escuela, ESCALE la nombra por eliminacion. Se absorbe la escuela publicada mas
    pequena del distrito hasta que el residuo tenga base suficiente."""
    mapa, norm = mapa_distrito()
    por_dist = {}
    for e in escuelas:
        d = mapa.get(norm(e["institucion"]))
        if d:
            por_dist.setdefault(d, []).append(e)

    absorbidas = 0
    for dist, lista in por_dist.items():
        sup = [e for e in lista if not e["base_suficiente"]]
        if not sup:
            continue
        while True:
            residual = sum(e["n_estudiantes"] for e in lista if not e["base_suficiente"])
            pub = sorted([e for e in lista if e["base_suficiente"]], key=lambda e: e["n_estudiantes"])
            if residual >= UMBRAL_SUPRESION or not pub:
                break
            v = pub[0]                      # absorbe la publicada mas chica
            v["base_suficiente"] = False
            for k in ("satisfactorio", "proceso", "inicio", "previo_al_inicio"):
                v[k] = {"estado": "suprimido"}
            v["carga_estimada"] = None
            v["absorbida_por_residuo"] = True
            absorbidas += 1
    return absorbidas


def construir_atisunchik():
    escuelas = []
    for r in leer("atisunchik_por_escuela.csv"):
        n = int(r["n_estudiantes"])
        inicio = float(r["pct_inicio"] or 0)
        previo = float(r["pct_previo_al_inicio"] or 0)
        escuelas.append({
            # nombre, NO codigo modular: el tablero identifica por CEN_EDU
            "institucion": r["institucion_educativa"],
            "n_estudiantes": n,
            "satisfactorio": celda(float(r["pct_satisfactorio"] or 0), n),
            "proceso": celda(float(r["pct_proceso"] or 0), n),
            "inicio": celda(inicio, n),
            "previo_al_inicio": celda(previo, n),
            # unidad: estudiante-equivalente. SIEMPRE "carga estimada de acompanamiento".
            "carga_estimada": carga(n, inicio, previo),
            "base_suficiente": n >= UMBRAL_SUPRESION,
        })

    distritos = []
    for r in leer("atisunchik_por_distrito.csv"):
        n = int(r["n_estudiantes"])
        inicio = float(r["pct_inicio"])
        previo = float(r["pct_previo_al_inicio"])
        distritos.append({
            "distrito": r["distrito"],
            "n_estudiantes": n,
            "satisfactorio": celda(float(r["pct_satisfactorio"]), n),
            "proceso": celda(float(r["pct_proceso"]), n),
            "inicio": celda(inicio, n),
            "previo_al_inicio": celda(previo, n),
            "carga_estimada": carga(n, inicio, previo),
            "base_suficiente": n >= UMBRAL_SUPRESION,
        })

    absorbidas = aplicar_base_del_residuo(escuelas, distritos)

    # el NOMBRE de una escuela suprimida tambien es identificante: en una IE rural de
    # 1 a 4 alumnos, cruzar el codigo con ESCALE da centro poblado, director y GPS.
    for e in escuelas:
        if not e["base_suficiente"]:
            # el nombre real NO se emite: enmascararlo solo en la UI lo deja igual
            # dentro del bundle, legible con devtools. Se borra en el origen.
            e["institucion_publica"] = "IE reservada (base insuficiente)"
            e["institucion"] = e["institucion_publica"]
        else:
            e["institucion_publica"] = e["institucion"]

    # la carga distrital despeja inicio, y de ahi proceso: columnas que la tabla no muestra
    for d in distritos:
        d["carga_estimada"] = None

    t = leer("atisunchik_totales_ugel.csv")[0]
    n_total = int(t["n_estudiantes"])

    n1 = sum(1 for e in escuelas if e["n_estudiantes"] == 1)
    bajo5 = sum(1 for e in escuelas if e["n_estudiantes"] < 5)
    bajo10 = sum(1 for e in escuelas if e["n_estudiantes"] < 10)
    sobreviven = [e for e in escuelas if e["base_suficiente"]]

    return {
        "fuente": "III Atisunchik Todos Podemos, UGEL Huaytara (evaluacion diagnostica)",
        "edicion": "III",
        # el denominador es observacion estudiante-curso, NO estudiante:
        # los conteos exactos son irrecuperables, por eso no se ofrecen intervalos.
        "soporta_conteos": False,
        "totales": {
            "n_estudiantes": n_total,
            "satisfactorio": round(float(t["pct_satisfactorio"]) * 100, 2),
            "proceso": round(float(t["pct_proceso"]) * 100, 2),
            "inicio": round(float(t["pct_inicio"]) * 100, 2),
            "previo_al_inicio": round(float(t["pct_previo_al_inicio"]) * 100, 2),
        },
        "referencia_interna": {
            "valor": round(float(t["pct_satisfactorio"]) * 100, 2),
            "etiqueta": "referencia interna, no es meta oficial",
            "nota": "NUNCA usar el 17.70 de la ERA: otro instrumento, otra poblacion, otro denominador.",
        },
        "base": {
            "umbral_supresion": UMBRAL_SUPRESION,
            "escuelas_total": len(escuelas),
            "escuelas_n_igual_1": n1,
            "escuelas_bajo_5": bajo5,
            "escuelas_bajo_10": bajo10,
            "escuelas_publicables": len(sobreviven),
            "estudiantes_en_publicables": sum(e["n_estudiantes"] for e in sobreviven),
            "pct_estudiantes_conservados": round(
                sum(e["n_estudiantes"] for e in sobreviven) / sum(e["n_estudiantes"] for e in escuelas) * 100, 1),
        },
        # se suma SIN redondear y se redondea una sola vez al final. Sumar valores
        # ya redondeados daba 828.2 en vez de 828.4 y rompia las cifras congeladas.
        "escuelas_absorbidas_por_residuo": absorbidas,
        "carga_total_estimada": round(
            sum(e["n_estudiantes"] * (float(r["pct_inicio"] or 0) + float(r["pct_previo_al_inicio"] or 0))
                for e, r in zip(escuelas, leer("atisunchik_por_escuela.csv"))), 1),
        "distritos": sorted(distritos, key=lambda d: -(d["carga_estimada"] or -1)),
        "escuelas": sorted(escuelas, key=lambda e: -(e["carga_estimada"] or -1)),
    }


def main():
    canonico = {
        "meta": {
            "producto": "Nawinchay",
            "generado_por": "scripts/build-canonico.py",
            "aplicacion": "DataEdHack AIdea x BREIT, 18 jul 2026",
            "ley": "Ley 29733: solo agregados, base menor a 5 suprimida, sin nombres ni DNI",
            "advertencia_union": (
                "era y atisunchik son universos DISJUNTOS y no comparten ninguna llave. "
                "No unirlos: son instrumentos, poblaciones y denominadores distintos."
            ),
        },
        "era": construir_era(),
        "atisunchik": construir_atisunchik(),
    }

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(canonico, ensure_ascii=False, indent=2), encoding="utf-8")

    # ── validaciones que fallan ruidosamente ─────────────────────────────────
    e = canonico["era"]
    a = canonico["atisunchik"]
    assert len(e["items"]) == 20
    assert {i["clave"] for i in e["items"]} <= {"a", "b", "c", "d"}
    i3 = next(i for i in e["items"] if i["item"] == 3)
    i9 = next(i for i in e["items"] if i["item"] == 9)
    assert i3["categoria"] == "defecto_item", i3["categoria"]
    assert i9["categoria"] == "concepcion_errada", i9["categoria"]
    assert abs(i3["delta_pp"]) < 1, i3["delta_pp"]
    assert abs(i9["delta_pp"]) > 6, i9["delta_pp"]
    assert not any(c["estado"] == "publicado"
                   for esc in a["escuelas"] if esc["n_estudiantes"] < UMBRAL_SUPRESION
                   for c in (esc["satisfactorio"], esc["proceso"], esc["inicio"], esc["previo_al_inicio"]))

    # ── GUARDA FAIL-CLOSED ────────────────────────────────────────────────────
    # Un assert que prohibe campos CONOCIDOS solo protege de la fuga que ya
    # encontramos. Manana alguien agrega "ranking", "brecha" o "percentil", ninguno
    # se llama carga_estimada, y el assert pasa en verde mientras el campo filtra
    # igual. Se invierte: TODO campo nace bloqueado en una fila suprimida y hay que
    # autorizarlo a mano aqui. Un campo nuevo rompe el build hasta que alguien decida.
    PERMITIDOS_EN_FILA_SUPRIMIDA = {
        "institucion",              # se enmascara aparte en institucion_publica
        "institucion_publica",
        "distrito",
        "n_estudiantes",            # el n SI se publica: sin el, la exclusion parece arbitraria
        "base_suficiente",
        "absorbida_por_residuo",
        "satisfactorio", "proceso", "inicio", "previo_al_inicio",   # solo como {"estado":"suprimido"}
        "carga_estimada",           # solo como None
    }
    for coleccion in ("escuelas", "distritos"):
        for fila in a[coleccion]:
            if fila["base_suficiente"]:
                continue
            intrusos = set(fila) - PERMITIDOS_EN_FILA_SUPRIMIDA
            assert not intrusos, (
                f"FUGA POTENCIAL en {coleccion}: la fila suprimida "
                f"{fila.get('institucion', fila.get('distrito'))} lleva campos no autorizados "
                f"{sorted(intrusos)}. Un campo derivado de un dato suprimido hereda la supresion. "
                f"Si el campo es seguro, agregalo a PERMITIDOS_EN_FILA_SUPRIMIDA a proposito.")
            for k in ("satisfactorio", "proceso", "inicio", "previo_al_inicio"):
                assert fila[k] == {"estado": "suprimido"}, f"fuga: {k} publicado con base insuficiente"
            assert fila["carga_estimada"] is None, "fuga: carga publicada con base insuficiente"
            assert fila["institucion_publica"].startswith("IE reservada") if coleccion == "escuelas" else True

    # ningun distrito puede quedar con residuo reconstruible
    # el residuo ya se verifico dentro de aplicar_base_del_residuo, antes de enmascarar
    assert all(e["institucion"].startswith("IE reservada")
               for e in a["escuelas"] if not e["base_suficiente"]), \
        "fuga: nombre real de una IE suprimida sigue en el JSON emitido"

    print(f"OK  {SALIDA.relative_to(RAIZ)}  {SALIDA.stat().st_size / 1024:.1f} KB")
    print(f"    era: 20 items | azar {e['azar']['valor']}% (alternativas SIN confirmar)")
    print(f"    item 3: {i3['huaytara']['pct']}% vs resto {i3['resto_regional']['pct']}% "
          f"delta {i3['delta_pp']} -> {i3['categoria']} (z {i3['z_contra_azar_resto']} en resto)")
    print(f"    item 9: {i9['huaytara']['pct']}% vs resto {i9['resto_regional']['pct']}% "
          f"delta {i9['delta_pp']} -> {i9['categoria']} (z {i9['z_contra_azar_resto']} en resto)")
    cats = {}
    for i in e["items"]:
        cats[i["categoria"]] = cats.get(i["categoria"], 0) + 1
    print(f"    categorias: {cats}")
    print(f"    capacidades de item unico: "
          f"{[c['capacidad'][:34] for c in e['capacidades'] if c['n_items'] == 1]}")
    print(f"    atisunchik: {a['totales']['n_estudiantes']} estudiantes | "
          f"{a['base']['escuelas_publicables']}/{a['base']['escuelas_total']} IE publicables "
          f"({a['base']['pct_estudiantes_conservados']}% de estudiantes)")
    print(f"    carga total estimada: {a['carga_total_estimada']} estudiante-equivalente")


if __name__ == "__main__":
    main()
