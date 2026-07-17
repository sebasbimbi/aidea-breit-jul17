# data-fallback: datasets publicos de respaldo

Descargados el 17 de julio 2026, la noche antes del DataEdHack. Uso: si la data que trae la UGEL llega inusable (PDF, papel, Excel roto), estos archivos permiten construir el mismo modelo de datos y demo con datos reales de SU ugel, filtrando por CODOOII o COD_UGEL.

Todos los CSV estan en UTF-8 (convertidos desde DBF cp850 de MINEDU). Llave de cruce entre todo: COD_MOD + ANEXO. Para infraestructura: CODLOCAL.

## Archivos

| Archivo | Fuente | Que es | Filas |
|---|---|---|---|
| `Padron_web_2026-07-10.csv` | ESCALE, Padron de Servicios Educativos (corte 10 jul 2026) | Tabla maestra: COD_MOD, ANEXO, CODLOCAL, nombre, nivel/modalidad, gestion, director, direccion, ubigeo, area censo, DRE/UGEL (CODOOII), lat/long | 180,753 |
| `Padron_diccionario.xlsx` | mismo zip | Especificacion de campos del padron | |
| `siagie/SIAGIE_Reporte_Matricula_2025.csv` | ESCALE, reporte SIAGIE | Matricula 2025 registrada en SIAGIE por IE, nivel, grado, seccion y turno (COD_UGEL y NOM_UGEL incluidos). El insumo del reto 1 (avance de matricula) | 575,181 |
| `censo-2024/Resultados_2024.csv` | Censo Educativo 2024, modulo Resultado del ejercicio | Aprobados, desaprobados, retirados por IE (proxy de repitencia/desercion). Leer con `Diccionario_CE_2024_Resultados.pdf` | 287,073 |
| `censo-2024/Matricula_01_2024.csv` | Censo Educativo 2024 | Matricula censal por IE (declarada por director) | 178,461 |
| `censo-2024/Docentes_01_2024.csv` | Censo Educativo 2024 | Docentes por IE | 869,621 |
| `enla/3.-UGEL-4P-2016-2018-2024-*.xlsx` | UMC | ENLA censal 4to primaria por UGEL: medida promedio y niveles de logro, 2016-2024. El insumo de retos 4 y 6 | |
| `enla/2.-DRE-4P-2016-2025-*.xlsx` | UMC | Serie por DRE hasta ENLA 2025 | |
| `enla/3.-UGEL-2015-2019-2S-*.xlsx` | UMC | ECE 2do secundaria por UGEL (serie historica) | |
| `enla/1.-Estratos-4P-2016-2025-Nivel-de-desempeño.xlsx` | UMC | Nacional por estratos (contexto para el pitch) | |

Los .zip y .rar originales quedan como respaldo bit a bit. Los diccionarios PDF del Censo 2024 estan en `censo-2024/`.

## Como filtrar a la UGEL del equipo (pandas, 1 minuto)

```python
import pandas as pd
padron = pd.read_csv("Padron_web_2026-07-10.csv", dtype=str)
# CODOOII = codigo de DRE/UGEL; D_DREUGEL = nombre. Ver valores:
padron[["CODOOII", "D_DREUGEL"]].drop_duplicates().sort_values("CODOOII")
mi_ugel = padron[padron["D_DREUGEL"].str.contains("NOMBRE UGEL", case=False, na=False)]

siagie = pd.read_csv("siagie/SIAGIE_Reporte_Matricula_2025.csv", dtype=str)
siagie_ugel = siagie[siagie["NOM_UGEL"].str.contains("NOMBRE UGEL", case=False, na=False)]
```

## Notas

- ENLA por UGEL solo esta publicado hasta 2024 en 4P (2025 salio por DRE; por UGEL aun no estaba publicado al 17 jul).
- ANDA de MINEDU (microdatos historicos) solo llega hasta ~2016; no util.
- datos.minedu.gob.pe (CKAN) esta caido (NXDOMAIN); el padron se bajo directo de ESCALE.
- Fuentes: escale.minedu.gob.pe (padron, censo, SIAGIE) y umc.minedu.gob.pe/bases-de-datos (ENLA/ECE).
- Privacidad: todo esto es data publica agregada por IE, sin datos de personas menores. Los nombres de directores en el padron son informacion publica oficial; igual no mostrarlos en pantalla sin necesidad.
