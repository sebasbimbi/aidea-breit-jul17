# DataEdHack: kit de preparacion (AIdea x BREIT)

Kit de preparacion para el **DataEdHack** del sabado 18 de julio 2026 en Lima, organizado por [AIdea](https://www.aidea.education/) y BREIT (Brescia Institute of Technology, programa de ciencia de datos con MIT IDSS). Un dia, equipos mixtos (especialistas UGEL, cientificos de datos, UX, PM y tecnologia), datos reales de UGELs, y un MVP funcional frente a jurado a las 4pm.

Rol en el equipo: liderar el diseno tecnico y el desarrollo del prototipo de IA y analitica de datos.

Armado la noche anterior: los equipos y el reto se asignan recien el sabado en la manana, asi que este repo trae un plan listo para cualquiera de los 7 retos posibles.

## Contenido

| Archivo | Que es |
|---|---|
| [`GAME-PLAN.md`](GAME-PLAN.md) | El plan del dia: agenda bloque por bloque, division de trabajo por rol, reglas de riesgo de demo, estructura del pitch final y checklists |
| [`RETOS.md`](RETOS.md) | Un kit de solucion por cada uno de los 7 retos UGEL: usuario y decision, preguntas al especialista, modelo de datos, KPIs, vistas del dashboard, feature de IA con fixtures, recorte MVP por horas, guion de demo y riesgos |
| [`DATA-CONTEXT.md`](DATA-CONTEXT.md) | Mapa de los sistemas de datos educativos del Peru a nivel UGEL: SIAGIE, NEXUS, ESCALE, ENLA/UMC, SIMON, PeruEduca, Mi Mantenimiento, CGE, y las llaves de cruce (codigo modular + anexo, codigo de local) |
| [`PROMPTS.md`](PROMPTS.md) | Prompts listos para pegar en Claude Code durante el hack, mas el contrato de datos a acordar con los cientificos de datos |
| [`starter-assets/`](starter-assets/) | Nucleo de codigo probado en hacks anteriores: cadena de proveedores de IA (Claude CLI por suscripcion, API con salida estructurada, fixtures demo deterministas) y configs de Next.js listas |
| [`data-fallback/`](data-fallback/README.md) | Datasets publicos de respaldo por si la data de la UGEL llega inusable. Solo el README esta en git; los archivos (600+ MB) se re-descargan con las fuentes documentadas |
| `Reunion Techs_ AIdea-BREIT-18 julio.pdf` | Deck de la reunion de coordinacion previa (17 jul) |

## Como se usa el dia del hack

1. Asignan el reto: abrir su kit en `RETOS.md` y hacer las 5 preguntas al especialista UGEL.
2. Acordar el contrato de datos con los cientificos de datos (template en `PROMPTS.md`): ellos limpian en pandas, entregan JSON canonico, la herramienta lo consume.
3. Arrancar el repo del proyecto con la secuencia de `starter-assets/README.md` (5 minutos) y construir con los prompts de `PROMPTS.md`.
4. Fixtures deterministas antes del deploy: el demo nunca depende del wifi.

## El stack (probado en dos hacks anteriores)

Next.js + TypeScript + Tailwind, JSON canonico como unica fuente de verdad (sin base de datos), Claude con salida estructurada y citas verbatim como regla anti-alucinacion, respaldo demo determinista, deploy en Vercel. La misma formula de [copiloto-sineace](https://github.com/sebasbimbi/copiloto-sineace) (EdHack jun 2026) y de YachAI (2do puesto, AIdea EdProduct may 2026).

## Datos de respaldo (resumen)

Padron de Servicios Educativos de ESCALE (180K servicios, corte 10 jul 2026), reporte de matricula SIAGIE 2025 por IE (575K filas), Censo Educativo 2024 (resultado del ejercicio, matricula, docentes) y resultados ENLA/ECE por UGEL de la UMC. Todo publico, agregado por institucion educativa, sin datos de personas menores de edad. Detalle y fuentes en [`data-fallback/README.md`](data-fallback/README.md).
