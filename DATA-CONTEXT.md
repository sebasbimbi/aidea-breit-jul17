# DATA-CONTEXT.md: mapa de datos educativos del Peru a nivel UGEL

Tres briefs preparados el 17 de julio con investigacion web + conocimiento del sistema educativo peruano. Leer una vez esta noche; manana usar como referencia cuando el cientifico de datos o el especialista UGEL nombre un sistema.

1. Panorama de sistemas de datos (SIAGIE, NEXUS, ESCALE, UMC, SIMON, PeruEduca, SIAF, CGE) y las llaves de cruce.
2. Deep-dive de dominio: evaluaciones de aprendizaje, asistencia docente, formacion docente, privacidad (Ley 29733).
3. Contexto de organizaciones: AIdea, BREIT, especialistas UGEL como companeros de equipo, tacticas de jurado.

---

# Panorama de datos educativos a nivel UGEL (Perú) · cheat sheet DataEdHack

## La llave técnica: identificadores para cruzar todo

- **Código modular** (7 dígitos): identifica un SERVICIO educativo (un nivel/modalidad en una IE). Es la llave primaria de SIAGIE, Censo, ECE/ENLA y NEXUS.
- **Anexo** (1 dígito, casi siempre 0): distingue sedes anexas del mismo servicio. Las bases de UMC y ESCALE se cruzan por cod_mod + anexo.
- **Código de local** (6 dígitos): identifica el LOCAL físico. Un local puede albergar 2 o 3 códigos modulares (inicial, primaria, secundaria del "mismo colegio"). Infraestructura y Mi Mantenimiento van por código de local; todo lo demás por código modular. Convertir entre ambos vía el Padrón de ESCALE es EL truco del modelo de datos de mañana.
- Personas: estudiantes por DNI o código de estudiante SIAGIE; docentes por DNI; plazas por código de plaza (12 dígitos, NEXUS).

## SIAGIE (siagie.minedu.gob.pe)

- Qué es: registro nominal oficial de estudiantes. Lo carga el director o su personal administrativo en cada IE.
- Datos: matrícula (nóminas), notas finales por área (actas de evaluación), traslados, retiros, datos del estudiante (DNI validado con RENIEC, sexo, edad, lengua materna, discapacidad). Existe módulo de asistencia, pero su uso es marginal.
- Granularidad: estudiante por sección, por periodo de evaluación.
- Exporta la UGEL: el especialista SIAGIE de la UGEL tiene módulo de reportes (avance de matrícula por IE, nóminas y actas en Excel/PDF). Los datos agregados alimentan datosabiertos y ESCALE.
- Trampas: notas se cargan a fin de bimestre/trimestre con semanas de retraso; retiros y traslados tardíos inflan matrícula; asistencia diaria prácticamente no existe como serie confiable; secciones fantasma en IIEE rurales. Desde 2024 convive con la plataforma Matrícula Digital para el proceso de matrícula en varias UGEL.

## NEXUS y LEGIX (personal docente)

- **NEXUS**: sistema de administración y control de plazas. Cada plaza con código de 12 dígitos, tipo (docente, directivo, auxiliar, administrativo), condición (orgánica/eventual), estado (ocupada/vacante) y quién la ocupa. Lo opera el equipo de personal del Área de Administración de la UGEL; DITEN (MINEDU) lo administra a nivel central. Exporta a Excel; las listas de plazas vacantes para contratación y reasignación que publican las UGEL salen de ahí.
- **LEGIX**: escalafón magisterial (legajo del docente): títulos, escala (1 a 8), tiempo de servicios, méritos y sanciones. La UGEL emite informes escalafonarios desde LEGIX.
- Trampas: desfase crónico entre NEXUS, la planilla (AIRHSP del MEF) y la realidad en aula; ceses, encargaturas y licencias se registran tarde. Cruce NEXUS x matrícula SIAGIE = base del proceso de racionalización (excedencia/déficit de plazas).

## ESCALE / Censo Educativo / Padrón (escale.minedu.gob.pe)

- Qué es: la Unidad de Estadística del MINEDU. Tres piezas: Padrón de servicios educativos, Censo Educativo anual y tabuladores (Magnitudes).
- **Padrón**: descarga libre en escale.minedu.gob.pe/padron-de-iiee (xls). Trae código modular, anexo, código de local, nombre, nivel, gestión, DRE/UGEL, ubigeo, área rural/urbana, lat/long, director, estado. Es la tabla maestra para cualquier join.
- **Censo Educativo**: autodeclarado por cada director una vez al año (matrícula, docentes, secciones, local escolar: aulas, agua, luz, internet) más el módulo "Resultado del ejercicio" (aprobados, desaprobados, retirados por IE del año anterior: proxy público de repitencia y deserción por colegio). Bases completas descargables sin trámite en escale.minedu.gob.pe/bases-de-datos.
- Trampas: es una foto anual autodeclarada; siempre difiere de SIAGIE. Para decisiones de plazas manda SIAGIE; para series históricas y variables de local, el Censo.

## UMC / ECE-ENLA / SICRECE (umc.minedu.gob.pe)

- Qué es: la oficina de medición de aprendizajes. ECE censal 2007 a 2019; suspensión por pandemia; ENLA desde 2022. ENLA 2024 volvió a ser censal en 4° de primaria (lectura y matemática) tras seis años, más muestral en otros grados.
- Datos: niveles de logro (previo al inicio, en inicio, en proceso, satisfactorio) por estudiante, IE, UGEL, región.
- Exporta la UGEL: resultados por IE y UGEL vía SICRECE (el director entra con su clave SIAGIE; la UGEL tiene reportes agregados). Bases públicas agregadas en umc.minedu.gob.pe/bases-de-datos; microdatos por estudiante requieren formulario y compromiso de confidencialidad.
- Trampas: cobertura censal incompleta en rural; comparabilidad rota entre ECE y ENLA; el dato llega con casi un año de rezago.

## Semáforo Escuela (histórico, saberlo da puntos)

- Operó 2015 a 2019: monitores del MINEDU hacían visitas inopinadas mensuales a una muestra representativa por UGEL y medían asistencia de director, docentes y estudiantes, materiales, servicios básicos y horas efectivas. Reporte mensual por UGEL.
- 2020 tuvo versión remota telefónica; no hay evidencia pública de operación presencial desde entonces (la web solo conserva reportes históricos). Su función migró de facto a SIMON. Dato clave: fue el único intento serio de medir asistencia docente de forma independiente; ese vacío sigue abierto.

## SIMON y fichas de monitoreo (simon.minedu.gob.pe)

- Qué es: Sistema de Monitoreo y Evaluación de la Calidad del Servicio Educativo, vigente. Los especialistas de la UGEL aplican fichas digitales (configurables por campaña: buen inicio del año escolar, condiciones operativas, acompañamiento pedagógico) en visitas a IIEE.
- Exporta: dashboards en línea por UGEL e IE y descarga Excel de respuestas por ficha. Es la fuente más viva de "qué vio la UGEL en campo".
- Trampas: cobertura depende de cuántas visitas logra hacer cada especialista (decenas de IIEE por persona); sesgo hacia IIEE accesibles.

## PeruEduca (formación docente)

- LMS nacional de capacitación (cursos autoformativos, certificados). Registro por DNI del docente.
- La UGEL no exporta directamente; recibe listas de participantes desde MINEDU/DIFODS. Trampa: certificados no vinculados a plaza ni a IE actual, así que cruzar capacitación con resultados exige join por DNI contra NEXUS.

## Presupuesto e infraestructura: SIAF, SIGA, Mi Mantenimiento

- **SIAF** (MEF): la UGEL es unidad ejecutora; su PIA/PIM/devengado es público y al día en Consulta Amigable (apps5.mineco.gob.pe/transparencia).
- **SIGA** (MEF): logística, almacén, patrimonio; con él se gestiona la distribución de materiales educativos a IIEE.
- **Mi Mantenimiento** (PRONIED): asignaciones anuales por LOCAL educativo (código de local), responsable designado, ficha de acciones (FAM) y declaración de gastos con plazos duros. Norma 2026: RM 007-2026-MINEDU. Trampa y oportunidad: el seguimiento a directores omisos en declarar gastos es un dolor real y medible de toda UGEL.

## CGE y SSII (el marco de indicadores)

- Compromisos de Gestión Escolar vigentes (RM 189-2021-MINEDU), 5 en total: **CGE1** Progreso de los aprendizajes (resultado), **CGE2** Acceso y permanencia en el sistema educativo (resultado), **CGE3** Gestión de condiciones operativas (calendarización, matrícula oportuna, mantenimiento), **CGE4** Gestión de la práctica pedagógica (acompañamiento y monitoreo), **CGE5** Gestión del bienestar escolar (convivencia, SíseVe). Los 3 últimos son "de condiciones".
- El seguimiento (capa SSII) calcula semáforos por IE con datos que ya existen: SIAGIE, Censo, ENLA, SíseVe. La Norma Técnica del Año Escolar 2025 es la RM 556-2024-MINEDU. Cualquier prototipo que ordene sus indicadores por CGE habla el idioma oficial del jurado.

## Quién decide qué en la UGEL

- **Director de UGEL**: contratación, racionalización final, sanciones. Mira NEXUS, SIAF y lo que le escalen.
- **AGP** (Gestión Pedagógica): jefe + especialistas por nivel (los que van a campo). Deciden monitoreo, capacitación y uso de resultados ENLA. Usan SIMON, SICRECE, PeruEduca.
- **AGI** (Gestión Institucional): planificación, presupuesto, racionalización técnica, infraestructura y EL ESTADÍSTICO de la UGEL (la persona que domina todos los códigos). Usan Censo, Padrón, SIAF, NEXUS x SIAGIE.
- **AGA** (Administración): personal, planillas, escalafón, abastecimiento. Operan NEXUS, LEGIX, SIGA.

## Descargables esta noche (fallback/demo)

- Padrón de IIEE: escale.minedu.gob.pe/padron-de-iiee (xls, libre).
- Bases del Censo Educativo (matrícula, docentes, local, resultado del ejercicio): escale.minedu.gob.pe/bases-de-datos.
- Resultados ENLA 2024 y históricos ECE: umc.minedu.gob.pe/bases-de-datos y umc.minedu.gob.pe/resultadosenla2024.
- datosabiertos.gob.pe: buscar "MINEDU" y "SIAGIE" (ej. dataset "IIEE de gestión pública: información de alumnos extranjeros y docentes 2024" por regiones).
- Ejecución presupuestal por UGEL: Consulta Amigable MEF.

## Los 5 hechos que más impresionan en la mesa

1. "Todo se cruza por código modular más anexo; mantenimiento e infraestructura van por código de local. Su colegio de un solo local probablemente son tres códigos modulares."
2. "La asistencia diaria casi no se carga en SIAGIE; Semáforo Escuela existió justo por eso, murió con la pandemia y nadie volvió a medir asistencia docente de forma independiente."
3. "Censo Educativo es una foto anual autodeclarada; SIAGIE es nominal y continuo. Cuando difieren, para racionalización de plazas manda SIAGIE."
4. "ENLA 2024 volvió a ser censal en 4° de primaria después de seis años; el director lo consulta en SICRECE con su misma clave SIAGIE."
5. "El módulo Resultado del ejercicio del Censo trae aprobados, desaprobados y retirados por colegio: un proxy público de deserción que se descarga sin pedir permiso."

Nota de verificación: sistemas, normas (RM 189-2021, RM 556-2024, RM 007-2026), plataformas y descargas fueron contrastados en la web (minedu.gob.pe, escale, umc, gob.pe/pronied). Dos puntos con evidencia web delgada, señalados como tales: la fecha exacta de cese de Semáforo Escuela y el detalle operativo interno del SSII; ambos descritos desde conocimiento establecido del sector.

---

# Brief de dominio · DataEdHack Lima · 18 jul 2026

## A. Evaluaciones de aprendizaje en Peru

**Quien mide y como.** La UMC (Oficina de Medicion de la Calidad de los Aprendizajes, MINEDU) corre las evaluaciones estandarizadas nacionales desde 2007. Dos familias: censales (toda la poblacion objetivo, resultados por IE y UGEL) y muestrales (muestra representativa nacional/regional, sin resultado por escuela).

**Historia rapida (utíl para series de tiempo):**
- ECE 2007-2016: censal anual a 2.º primaria (Lectura y Matematica); desde 2015 se sumo 2.º secundaria.
- ECE 2018-2019: 4.º primaria y 2.º secundaria (Lectura, Matematica; en secundaria tambien Ciencia y Tecnologia y Ciencias Sociales en algunos años).
- 2020-2021: suspendida por pandemia (solo mecanismos virtuales no comparables).
- EM 2022 y ENLA 2023: muestrales (sin dato por IE, si por region).
- ENLA 2024 (ultimo dato publicado, abr 2025): volvio la censal tras 6 años. Censal a 4.º primaria: 532,000 estudiantes en 18,112 IIEE publicas y privadas; muestral a 6.º primaria: 105,534 estudiantes. Verificado en umc.minedu.gob.pe.

**Escala de niveles de logro:** previo al inicio / en inicio / en proceso / satisfactorio (2.º primaria solo usa los ultimos tres). Ademas se reporta la **medida promedio**: puntaje en escala Rasch (media 500, DE 100 en el año base), que permite comparar años aunque cambien los porcentajes por nivel. Para un dashboard: usar ambos, porcentaje satisfactorio comunica, medida promedio compara.

**Tendencias conocidas:** caida fuerte post-pandemia (EM 2022) y recuperacion en ENLA 2024: la medida promedio de 4.º primaria en Lectura supero 2023, 2022 y hasta 2019; en rural, +24 puntos en Lectura y +22 en Matematica, con el nivel mas bajo cayendo de 23.6% a 9.6% (Lectura) y de 36.8% a 28.7% (Matematica). El "previo al inicio" nacional bajo a 3.4%, minimo desde 2016. Aun asi, el satisfactorio nacional sigue en torno a un tercio: la mayoria de estudiantes no logra lo esperado.

**Como llega el dato a la UGEL/IE:** SICRECE (sistema de consulta de resultados, con clave por director/docente/especialista) entrega reportes por IE, UGEL y region; la UMC publica ademas informes por region y **bases de microdatos** (SPSS/CSV, estudiante disociado) en umc.minedu.gob.pe/bases-de-datos. Problema real: el especialista UGEL recibe PDFs y sabanas, no una herramienta para priorizar sus ~200 IIEE. Ahi vive el reto tipico.

**Evaluaciones regionales (ERA / kits regionales).** Las DRE/GRE corren sus propias censales regionales para llenar los años sin ECE y cubrir mas grados: ej. kit regional de DRE Junin (2.º y 4.º de primaria y secundaria, via cuadernillos o Google Forms), ERA Ayacucho (con sistema propio era.dreayacucho.gob.pe), ERA Cusco (protocolo GEREDU 2025). Diferencias clave vs ECE: las aplica y califica el propio docente o la IE (riesgo de inflacion y aplicacion heterogenea), no usan escala Rasch (porcentaje de aciertos o niveles por puntos de corte, no comparables entre regiones ni con ECE), y los resultados circulan como Excel/CSV por estudiante-seccion-IE con respuestas por item. Para el hackathon esto es oro: data granular, sucia, sin herramienta de explotacion.

**Analisis de brechas:** comparar satisfactorio y medida promedio cortando por area (rural/urbano: la brecha mas grande del sistema, en secundaria rural el satisfactorio en Lectura ha estado historicamente en un digito), sexo (mujeres arriba en Lectura, hombres levemente arriba en Matematica), lengua materna (originaria muy por debajo del castellano; la ECE EIB de 4.º primaria evalua ademas lectura en lengua originaria y castellano como segunda lengua), gestion (publica/privada, brecha que se achico post-pandemia) y caracteristica de IE (polidocente/multigrado/unidocente). Un buen "analisis de brechas" para el jurado: no solo el promedio de la UGEL, sino que IIEE concentran los estudiantes en previo al inicio y como se cruza con ruralidad y lengua.

## B. Asistencia docente

**Lo que se sabe.** Estudios pre-2015 (Banco Mundial/GRADE) midieron ausencia docente cercana al 11% en un dia tipico. **Semaforo Escuela** (MINEDU, desde 2015) visito mensualmente una muestra de IIEE publicas representativa por UGEL: en 2016 encontro 7% de aulas sin docente presente y 9% de directores ausentes; en julio 2019, 93.6% de docentes presentes en aula. El programa se debilito despues de 2019: hoy no existe medicion sistematica y continua de asistencia docente, y en rural (multigrado, horas de viaje, supervision casi nula) la cifra real es peor que el promedio nacional. Decirlo asi al jurado es honesto y correcto.

**Como se registra hoy:** parte de asistencia fisico (cuaderno o formato) que llena el director, consolidado mensual remitido a la UGEL (area de personal); la UGEL procesa **descuentos por tardanzas e inasistencias injustificadas** en la planilla (Ley 29944 de Reforma Magisterial y su reglamento; la plaza y el personal se administran en NEXUS, la planilla en el sistema unico de planillas). El circuito es papel, tardio (el descuento llega 1-2 meses despues) y depende de que el director reporte a su propio colega.

**Palancas reales de una UGEL:** descuento en planilla (la unica sancion dura), procesos administrativos por abandono, y en positivo: reconocimiento (resoluciones de felicitacion, que suman en escalafon), prioridad en capacitaciones, y gestion de contratos (docentes contratados con mala asistencia pierden renovacion). No puede pagar bonos ad hoc.

**Captura de asistencia low-cost para rural y sus modos de falla:**
- Check-in SMS/WhatsApp del docente: barato, pero autoreportado (fraude trivial), depende de cobertura y de que el numero sea del docente.
- Foto geolocalizada (docente en aula, timestamp + GPS): mejor evidencia, pero falla sin señal (mitigable con captura offline y sincronizacion diferida), GPS impreciso en zonas de un solo edificio, y puede falsificarse con fotos recicladas (mitigar con codigo del dia o selfie con estudiantes es invasivo).
- Atestacion del director (confirma la asistencia de su personal via app/WhatsApp): alinea con el circuito legal actual (el director ya es la fuente oficial), pero hereda su conflicto de interes y falla en unidocentes (el director es el docente).
- Triangulacion barata: cruzar autoreporte + atestacion + visitas inopinadas del especialista UGEL como auditoria muestral. Para el MVP, lo defendible es digitalizar el parte que ya existe y darle al especialista un semaforo por IE, no inventar biometria.

## C. Formacion docente y acompañamiento pedagogico

**Como funciona el servicio:** cursos virtuales autoformativos en **PeruEduca** (plataforma nacional, certificados por horas), programas de formacion en servicio de MINEDU/DIFODS, **acompañamiento pedagogico** (un acompañante visita al docente en aula: observacion + retroalimentacion individual, tipicamente ciclos mensuales en IIEE focalizadas, historicamente rural/multigrado y EIB), **GIA** (grupos de interaprendizaje entre docentes) y talleres de UGEL. La UGEL (AGP, especialistas pedagogicos) ejecuta y reporta, pero rara vez cierra el ciclo con datos.

**Rubricas de observacion de aula (MINEDU, verificadas):** instrumento estandar, 5 desempeños calificados en 4 niveles (I a IV): (1) involucra activamente a los estudiantes en el aprendizaje, (2) promueve el razonamiento, la creatividad y/o el pensamiento critico, (3) evalua el progreso de los aprendizajes para retroalimentar y adecuar la enseñanza, (4) propicia un ambiente de respeto y proximidad, (5) regula positivamente el comportamiento. (La version 2017 tenia un sexto: maximiza el tiempo dedicado al aprendizaje.) Son la moneda comun de "practica observada".

**Medir efectividad (Kirkpatrick adaptado):** L1 asistencia/completitud del curso (dato que ya existe en PeruEduca y listas de talleres), L2 satisfaccion y aprendizaje del docente (encuesta/prueba de salida), L3 cambio en practica: delta en rubricas entre visita 1 y visita N del acompañante (el dato mas valioso y el que casi nunca se sistematiza), L4 resultado en estudiantes. Un dashboard que solo cruce L1 con L3 ya supera lo que cualquier UGEL tiene hoy.

**La trampa de atribucion:** no afirmar ante el jurado que la capacitacion causo mejora en ECE/ENLA. Hay seleccion (se focaliza a las IIEE mas debiles), desfase temporal, y cien factores concurrentes. Lenguaje correcto: "asociacion", "monitoreo de cobertura y de cambio en practica", "insumo para focalizar". Prometer causalidad es la forma mas rapida de perder credibilidad tecnica.

## D. Privacidad: Ley 29733

- Ley 29733 (Proteccion de Datos Personales) + nuevo reglamento DS 016-2024-JUS (vigente desde 2025); autoridad: ANPD. Datos de menores requieren consentimiento de padres/tutores (14-17 años pueden consentir si la informacion es comprensible para ellos). Datos de asistencia y desempeño docente son datos personales laborales: mismo regimen.
- La ley exime el uso estadistico cuando media **anonimizacion** (irreversible) o **disociacion** (reversible, la llave se guarda aparte). Un dashboard UGEL vive de esa excepcion: agregados, no personas.
- Reglas practicas para decir al jurado: el prototipo demo usa data sintetica/fixtures, nunca nombres ni DNI; en produccion, agregacion minima por IE o red (suprimir celdas con n<5 para evitar reidentificacion en escuelas chicas), IDs disociados para series por estudiante, acceso por rol (especialista ve su UGEL, director solo su IE), finalidad limitada a gestion educativa, y datos docentes individualizados solo para el area de personal, no en vistas publicas. Mencionar esto en el pitch suma: casi ningun equipo lo hace.

Fuentes principales: umc.minedu.gob.pe (ENLA 2024, evaluaciones censales/muestrales, bases de datos), gob.pe/minedu (nota ENLA 2024), minedu.gob.pe/semaforo-escuela, repositorio.minedu.gob.pe (manual de rubricas, estudio de ausentismo), sites DRE Junin/Ayacucho/Cusco (kits regionales), leyes.congreso.gob.pe (Ley 29733). Donde la web esta delgada (estado actual de Semaforo Escuela post-2019, detalle operativo del circuito de descuentos), el brief se apoya en conocimiento establecido del sistema y lo señala como tal.

---

# Brief de contexto: DataEdHack (AIdea x BREIT), Lima, sáb 18 jul 2026

## A. AIdea Peru

- Qué es: iniciativa edtech "Designed at MIT", fundada en agosto 2025. Doble misión: alfabetización en IA para docentes y tecnología educativa significativa, "co-construida con el usuario desde la concepción" (frase literal de su web). Opera con actores del ecosistema MINEDU.
- Aliados: Harvard Graduate School of Education, McKinsey, UTEC, Enseña Perú, Banco Mundial, Sundai Latam. Organizó el EdTech Summit 2025 en UTEC con Musa y Universidad Continental.
- Programas: EdHack (hackathon intensivo de ~10 horas, 50-70 participantes entre docentes, devs, UX y perfiles de negocio, con 8-10 mentores y jurados), EdLab (9 h), TallerIA (2-4 h, uso "ético-seguro-efectivo" de IA), EdProduct (30+ h para convertir prototipo en producto sostenible; se corrió en Emprende UP, Universidad del Pacífico).
- Qué valora su cultura de jurado: prototipo funcional sobre slides, diseño centrado en el usuario real, impacto educativo demostrable. Ellos mismos se miden con indicadores (reportan 95% de docentes "significativamente más preparados", satisfacción 9.6/10): esperan que los equipos también presenten un indicador de impacto medible. Proyectos destacados previos (FlexIAdapt, LUMI, ÑawinchAI) atacan personalización, retroalimentación y accesibilidad.
- No verificado: la rúbrica exacta del jurado de DataEdHack no está publicada; lo anterior es inferencia de su lenguaje institucional y ediciones previas.

## B. BREIT (verificado)

- Qué es: Brescia Institute of Technology, instituto de tecnología avanzada de Aporta, el laboratorio de impacto social del Grupo Breca (conglomerado de la familia Brescia, 130+ años: banca, seguros, salud, inmobiliario). Becas financiadas por Ana María Brescia Cafferata. Alianza formal con MIT IDSS. Confirmado: la hipótesis "Breca / fundación" es correcta.
- El programa: Advanced Program in Data Science & Global Skills, ~18 meses. Núcleo: el MITx MicroMasters en Statistics and Data Science (IDSS, vía edX), más módulos propios de habilidades globales (comunicación, trabajo en equipo, liderazgo). A mayo 2025: 7 cohortes, 4 completas, 68 con credencial y 73 en pipeline. Perfil: profesionales peruanos seleccionados, no principiantes; prerrequisitos del programa son cálculo y Python.
- Currículo que cursaron: Probability y Fundamentals of Statistics (inferencia, pruebas de hipótesis, regresión, rigor matemático real); Machine Learning with Python (de modelos lineales a deep learning, proyectos hands-on con numpy/sklearn); un curso de Data Analysis con datos reales (según el track, el electivo de análisis social se dicta en R; no pude verificar qué track llevó cada cohorte) y Capstone.
- Traducción para el sábado: espera EDA sólido con pandas, baselines sklearn (regresión logística, random forest), métricas bien elegidas, gráficos matplotlib/plotly, todo en notebooks. NO esperes de ellos frontend, APIs, git fluido ni deployment: eso es tuyo. Dales un lane claro: CSV limpio de entrada, JSON canónico de salida, y tú integras sus resultados precomputados al dashboard Next.js. Su fuerza diferencial es el rigor estadístico: úsalos para validar que el indicador north star esté bien construido, no solo para graficar.

## C. El especialista UGEL como compañero

- Perfil típico: docente de carrera (escala magisterial) encargado en el Área de Gestión Pedagógica o de gestión institucional; las convocatorias de encargatura exigen 200+ horas recientes de formación en gestión pedagógica/institucional. Conoce normas, visitas de monitoreo, directores de IIEE y plazos mejor que nadie en la sala.
- Comodidad tecnológica: Excel y sistemas MINEDU (SIAGIE, ESCALE); no programa. Los datos que traiga serán probablemente exportes de esos sistemas: sucios, con el código modular de la IE como llave. Planifica 30-45 min de limpieza al inicio.
- Cómo colaborar: es tu product owner y tu usuario final a la vez. Valida cada 45-60 min tres cosas: el vocabulario (usa sus términos: IIEE, código modular, compromisos de gestión, monitoreo), la decisión concreta que cada pantalla gatilla, y si podría usar la herramienta el lunes sin ti. Que narre el problema en el pitch inicial de las 12:30 y cierre el demo final: su voz es la evidencia de problem-solution fit.

## D. Ocho tácticas para ganar

1. Demo con SUS datos reales, aunque sea una sola tabla: una fila reconocible ("esa es mi IE") vale más que mil filas sintéticas.
2. Una métrica north star: define el indicador de impacto medible desde el pitch inicial y repítelo idéntico en el pitch final. Consistencia narrativa gana en jurados que vieron 10 equipos.
3. Diagrama del modelo de datos como lámina explícita: es entregable juzgado. Entidades (IE, agregado de estudiantes, indicador, alerta), llaves y fuentes en una sola vista.
4. Cada pantalla termina en una acción: "llamar a estas 5 IIEE", "priorizar esta visita de monitoreo". Visualización sin siguiente paso no es accionable y el criterio pide accionable.
5. Honestidad sobre calidad de datos: una slide con vacíos y supuestos. Un jurado de gente de datos castiga la sobreventa y premia el criterio.
6. Agrega y anonimiza datos de menores: nunca nombres de estudiantes en pantalla, solo niveles IE o sección. Decirlo explícitamente es un punto ético gratis ante actores MINEDU.
7. Valor que se queda: URL en Vercel funcionando con los datos de la UGEL cargados y fixtures deterministas sin wifi. Cierra con "la UGEL se lleva esto hoy".
8. Últimos 15 segundos del pitch: la cita del especialista diciendo qué decisión tomará distinto desde ahora. Eso sella problem-solution fit ante este jurado.

Fuentes: [aidea.education](https://www.aidea.education/), [IDSS MIT: BREIT and Aporta](https://idss.mit.edu/engage/idss-strategic-partnerships/strategic-partnerships-in-education/breit-and-aporta/), [MIT News, may 2025](https://news.mit.edu/2025/building-networks-data-science-talent-0527), [MicroMasters SDS](https://micromasters.mit.edu/ds/), [edX SDS](https://www.edx.org/micromasters/mitx-statistics-and-data-science), [UGEL 07 encargaturas](https://www.ugel07.gob.pe/encargatura-para-cargo-de-especialista-de-educacion/). No verificado: página propia del evento DataEdHack (no encontrada), rúbrica exacta del jurado, track/electivo (R vs Python) de las cohortes BREIT, y breit.org.pe no cargó (sitio JS-rendered).
