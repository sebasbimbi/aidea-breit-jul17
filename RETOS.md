# RETOS.md: kit de solucion por cada reto posible

Siete kits, uno por reto. Manana en la mesa: identificar el reto asignado, abrir SU kit, y ejecutar. Cada kit trae: solucion en una frase, usuario y decision, las 5 preguntas al especialista UGEL, data esperada, modelo de datos (entregable juzgado), KPIs, las 3 vistas del dashboard, feature de IA con fixture, recorte MVP por horas, guion de demo y riesgos.

Indice:
1. Directores no ven informacion en tiempo real
2. No hay analisis y seguimiento de priorizacion y decisiones de inversion
3. No se aprovecha la informacion de seguimiento pedagogico
4. Falta analisis para toma de decision sobre evaluaciones educativas
5. No hay sistema de seguimiento y desincentivo de inasistencia docente
6. Falta herramienta de seguimiento de la Evaluacion Censal Regional
7. No hay monitoreo de efectividad de entrenamientos docentes

---

## Reto 1: Directores no ven informacion en tiempo real

### La solucion en una frase
**Qhaway** (mirar, en quechua): un panel de pulso que convierte los exportes que la UGEL ya recibe (SIAGIE, SIMON, Mi Mantenimiento) en un semaforo por IE y una cola priorizada de intervenciones para la semana.

### Usuario y decision
Usuario primario: el estadistico de AGI y el jefe de AGP; consumidor final: el director de UGEL. Decision que habilita: cada lunes, decidir a que 10 IIEE llamar, cuales visitar y a que directores omisos escalar con oficio, en vez de reaccionar a lo que llega por WhatsApp.

### 5 preguntas para el especialista UGEL (primera hora)
1. Que archivos trajiste y de que sistema salieron (SIAGIE, SIMON, Mi Mantenimiento, NEXUS): pide verlos ya.
2. En que formato vienen (Excel, PDF, CSV) y si cada fila trae codigo modular.
3. Que decision tomas cada mes sobre directores y que dato te falta para tomarla mejor.
4. Hoy, sin herramienta, como detectas que una IE esta en problemas y cuanto demoras.
5. Que haria que abras esto cada lunes: que pantalla, que alerta, que numero.

### Data esperada
Probable en su USB: avance de matricula por IE (reporte SIAGIE, Excel), actas cerradas por periodo (SIAGIE), respuestas de fichas SIMON por campania (Excel), estado de declaracion de gastos de Mi Mantenimiento (por codigo de local), Padron con director y contacto. Fallback publico si su data es inservible: Padron de ESCALE (cod_mod, anexo, codigo de local, director, rural) + Censo Educativo (matricula, Resultado del ejercicio) + ENLA 2024 agregada; con eso simulas los hitos con fechas realistas.

### Modelo de datos propuesto
Estrella simple, implementable en pandas en una hora:
- **dim_ie** (del Padron): cod_mod + anexo (llave), codigo_local, nombre, nivel, distrito, rural, director, telefono.
- **dim_hito**: catalogo de obligaciones del director (matricula cargada, actas cerradas, declaracion de mantenimiento, ficha SIMON respondida), cada una mapeada a su CGE (3, 4 o 5).
- **fact_cumplimiento** (grano: IE x hito x fecha_corte): estado (cumplido, pendiente, vencido), fecha_limite, dias_retraso, fuente, fecha_dato.
- **score_ie** derivada: hitos vencidos ponderados + dias de silencio.
Truco de join: todo cruza por cod_mod + anexo; Mi Mantenimiento entra por codigo_local y se convierte via Padron. Presentalo como lamina propia y como pantalla "/modelo" en el dashboard: es entregable juzgado.

### KPIs (5 a 7)
1. **Indice de cumplimiento por IE**: hitos a tiempo / hitos exigibles. Ordena las 200 IIEE.
2. **% IIEE con matricula SIAGIE al dia**: cargadas / total. Dispara llamadas de inicio de periodo.
3. **Omisos de mantenimiento**: IIEE con plazo de declaracion vencido (RM 007-2026). Lista directa de oficios.
4. **% actas cerradas del ultimo periodo**: IIEE con notas cargadas / total. Detecta rezago SIAGIE.
5. **Cobertura de monitoreo**: % IIEE con ficha SIMON en 60 dias. Dice a donde ir.
6. **Dias de silencio**: dias desde el ultimo dato de cualquier fuente por IE. La alerta mas simple y potente.
7. **IIEE en rojo por CGE3**: IIEE con 2+ hitos vencidos. El numero del pitch.

### Dashboard (3 vistas maximo)
1. **Semaforo UGEL**: tabla de las ~200 IIEE ordenada por score, chips rojo/ambar/verde, filtros por distrito, nivel y rural, sello visible "datos al [fecha del exporte]". Accion: boton "generar cola de la semana".
2. **Ficha IE**: timeline de hitos con fecha y fuente, datos crudos citados, contacto del director, boton "explicar con IA". Accion: llamar o programar visita hoy.
3. **Cola semanal**: 10 intervenciones generadas (llamadas, visitas, oficios) con motivo por linea, imprimible. Accion: es literalmente el plan del lunes.

### Feature de IA
Core: resumen por IE con Claude API y salida estructurada (JSON: diagnostico, evidencia con citas verbatim de los datos, accion_recomendada, borrador de mensaje cordial al director). El wow: de fila roja a oficio listo en 5 segundos. Stretch: pregunta en lenguaje natural sobre el JSON canonico ("cuales IIEE rurales no declaran mantenimiento"). Fixture determinista: precomputa las respuestas de las 10 IIEE de la demo en un JSON y sirvelo si no hay wifi; el endpoint real queda detras de un flag.

### Recorte MVP (4.5 horas de build)
Dentro: JSON canonico hardcodeado desde su data real, 3 pantallas (semaforo, ficha, cola), 1 endpoint de IA con fixtures, deploy a Vercel. Fuera: auth, base de datos, mobile, integracion en vivo con SIAGIE/SIMON, notificaciones. Horario: 13:10-14:00 limpieza y JSON canonico (BREIT en pandas, tu defines el schema); 14:00-15:30 dashboard con data real; 15:30-16:00 fixtures IA, deploy, ensayo del pitch con el especialista.

### Guion de demo (3 beats) y one-liner
Beat 1 (habla el especialista): "De mis X IIEE, Y no han declarado mantenimiento y Z no cargan actas; hoy me entero tarde y por WhatsApp." Beat 2: semaforo con su data real, clic en "cola de la semana": el plan del lunes aparece en pantalla. Beat 3: clic en una IE roja, la IA explica con citas y redacta el mensaje al director. Cierra el especialista: que decision tomara distinto desde el lunes. One-liner: "Qhaway convierte los Excel que la UGEL ya recibe en la lista de las 10 IIEE que hay que llamar el lunes."

### Riesgos y trampas
"Tiempo real" literal no existe: SIAGIE llega con semanas de rezago; vende "visibilidad al dia del ultimo exporte" con sello de frescura, no streaming. Censo autodeclarado difiere de SIAGIE: declara la fuente por hito. Secciones fantasma y traslados tardios inflan matricula. Privacidad (Ley 29733): cero nombres o DNI de estudiantes, agregados por IE, suprime celdas con n<5; el cumplimiento individual del director es dato personal laboral, solo para roles internos. Trampa politica: esto NO es un ranking para sancionar directores; vendelo como priorizacion de acompaniamiento o el jurado MINEDU lo leera como vigilancia. No prometas causalidad ni integracion automatica con MINEDU.

---

## Reto 2: No hay analisis y seguimiento correcto de priorizacion y decisiones de inversion

### La solucion en una frase
**Kipu** (el registro contable andino): tablero que cruza necesidad real por local educativo con la plata asignada y ejecutada, para que la UGEL decida donde invertir con evidencia y vea que paso despues de cada sol.

### Usuario y decision
Operador: el jefe de AGI y el estadistico de la UGEL (dueños de Padron, Censo, SIAF y racionalizacion). Firmante: el director de UGEL. Decisiones habilitadas: (1) que locales priorizar en la siguiente asignacion de mantenimiento y distribucion de materiales, (2) a que directores omisos de declarar gastos enviar oficio esta semana, (3) que inversion pasada no movio la aguja y debe reasignarse.

### 5 preguntas para el especialista UGEL (primera hora)
1. Que archivos trajiste exactamente y en que formato: exportes de Mi Mantenimiento, SIGA, SIAF, Censo (Excel, PDF, CSV)?
2. Tus filas vienen por codigo de local o por codigo modular? (Define todo el modelo de datos.)
3. Que decision de inversion tomas cada mes o campaña, y quien la firma?
4. Como lo resuelves hoy sin herramienta y cuantas horas te toma?
5. Que tendria que mostrarte esto el lunes para que lo uses de verdad: omisos, priorizacion o seguimiento? Cual duele mas?

### Data esperada
Probable de la UGEL: **Mi Mantenimiento** (PRONIED): codigo de local, monto asignado, responsable, estado de ficha FAM, declaracion de gastos, plazos (RM 007-2026-MINEDU). **SIGA**: pecosas de distribucion de materiales por IE. **SIAF**: PIA/PIM/devengado de la UE. **Censo Educativo, modulo local**: aulas, agua, luz, internet. **SIAGIE**: matricula por servicio. Fallback publico descargable esta noche: Padron de IIEE (escale.minedu.gob.pe/padron-de-iiee), bases del Censo (matricula, local, resultado del ejercicio) y Consulta Amigable MEF por UE.

### Modelo de datos propuesto
Estrella simple, implementable en pandas en una hora:
- **dim_local** (llave: codigo_local): distrito, area rural/urbana, lat/long, deficit agua/luz/internet (Censo).
- **dim_servicio** (llave: cod_mod + anexo): nivel, matricula, gestion. Puente servicio-local via Padron ESCALE: es EL join del dia (un local suele tener 2 o 3 codigos modulares).
- **fact_inversion** (grano: codigo_local x intervencion x año): monto_asignado, monto_declarado, estado_fam, fecha_limite, fuente (MiMantenimiento/SIGA).
- **fact_necesidad** (grano: codigo_local x año): matricula total del local (deduplicada), aulas, servicios basicos, indice de deficit normalizado 0-100.
Presentacion: una pantalla "Modelo" dentro del dashboard con el diagrama (entidades, llaves, fuentes); es entregable juzgado, no lo dejes en la cabeza del equipo.

### KPIs (5 a 7)
1. **Indice de Priorizacion de Inversion (IPI)**: deficit normalizado x matricula / soles recibidos ultimos 3 años. Ordena los ~200 locales: la lista de mañana.
2. **Tasa de declaracion**: locales con gastos declarados / locales con asignacion. Genera la lista de oficios a omisos.
3. **Dias de atraso FAM**: hoy menos fecha limite, por local. Convierte plazo normativo en alerta.
4. **Soles por estudiante**: monto asignado / matricula del local. Expone inequidad entre locales comparables.
5. **Cobertura de necesidad**: % de locales con deficit critico que recibieron inversion este año. Mide el desalineo asignacion vs necesidad.
6. **Ejecucion presupuestal**: devengado / PIM de la especifica relevante (SIAF). Contexto para el director.
7. **Delta post-inversion**: cambio del indice de deficit (Censo año siguiente) en locales intervenidos vs no intervenidos. Cierra el ciclo, presentado como asociacion.

### Dashboard (3 vistas maximo)
1. **Priorizar**: ranking de locales por IPI con semaforo (rojo: deficit alto y cero inversion), filtros por distrito y nivel. Accion: boton "exportar top 10 para el comite de asignacion".
2. **Seguir**: semaforo de declaracion y atraso por local; omisos en rojo con dias vencidos y responsable. Accion: "generar lista de oficios de esta semana".
3. **Verificar**: dispersion soles/estudiante vs deficit, y delta post-inversion. Accion: identificar locales sobreatendidos y subatendidos para reasignar la proxima campaña.

### Feature de IA
Core: **ficha de decision por local** via Claude API con structured output: JSON {prioridad, razones[], datos_citados[], accion_sugerida}, resumen en lenguaje natural que cita textualmente los numeros ("sin agua segun Censo 2025, S/ 12,400 asignados, FAM sin declarar hace 47 dias"). Stretch: generador del texto de oficio a omisos pre-llenado con datos del local. Fixture determinista: precomputa esta noche las fichas de los 15 locales top como JSON estatico; el endpoint sirve fixture si no hay wifi, output identico. El wow no depende de la señal de UTEC.

### Recorte MVP (4.5 horas de build)
DENTRO: JSON canonico hardcodeado desde su data real, 3 pantallas, 1 endpoint IA con fixtures, deploy Vercel. FUERA: auth, base de datos, mobile, integracion en vivo con SIAF/SIGA, mapas complejos. Reloj: 13:10-14:00 limpieza y JSON canonico (BREIT en pandas: joins por Padron, KPIs precomputados); 14:00-15:30 dashboard 3 vistas; 15:30-16:00 fixtures IA, deploy y ensayo del pitch.

### Guion de demo (3 beats) y one-liner
Beat 1 (especialista, con su numero real): "De mis N locales con plata de mantenimiento, X no han declarado gastos y no tengo criterio para asignar el siguiente sol." Beat 2: vista Priorizar, click en un local que el reconoce, "esta lista va al comite el lunes". Beat 3: ficha IA con citas de datos y el oficio generado en vivo. One-liner: "Kipu convierte los Excel de mantenimiento y presupuesto en una lista priorizada de inversion y un semaforo de seguimiento que la UGEL se lleva hoy."

### Riesgos y trampas
- **Llave equivocada**: mantenimiento va por codigo de local, matricula por codigo modular; si sumas matricula sin deduplicar por local, duplicas estudiantes y el jurado de datos lo va a ver.
- **Desagregacion inventada**: SIAF es por unidad ejecutora, no por IE; no repartas montos entre colegios sin fuente. Mi Mantenimiento si es por local: usalo como columna vertebral.
- **Censo autodeclarado**: el deficit puede estar inflado o viejo; ponlo en la slide de supuestos.
- **Atribucion**: nunca digas que la inversion causo mejora; di asociacion e insumo para focalizar.
- **Trampa politica**: la lista de omisos señala directores con nombre; framing correcto es "acompañamiento al cumplimiento" con recordatorios, no lista negra; nombres solo en vista interna de la UGEL. Datos de menores no aparecen: solo agregados por local, y dilo explicito al jurado.

---

## Reto 3: No se aprovecha la informacion de seguimiento pedagogico

### La solucion en una frase
**Ñawi** (ojo, en quechua): convierte las fichas de monitoreo y rubricas que la UGEL ya llena en SIMON en un tablero de priorizacion que decide a que IIEE ir, que docentes acompañar y que tema trabajar el proximo mes.

### Usuario y decision
Usuario primario: el jefe de AGP y sus especialistas pedagogicos por nivel (los que hacen las visitas). Decision habilitada: el cronograma mensual de monitoreo (que 10 IIEE visitar y por que) y la focalizacion del acompañamiento (que docentes y que desempeño de rubrica reforzar en GIA o taller). Vista secundaria de solo lectura para el director de UGEL: cobertura y avance.

### 5 preguntas para el especialista UGEL (primera hora)
1. Que trajiste exactamente: export Excel de SIMON por ficha, rubricas de observacion, consolidados propios? Muestrame las columnas.
2. Cada fila tiene codigo modular, fecha y quien visito? De que campañas y años?
3. Que decision tomas cada mes con esto hoy: cronograma de visitas, informes a DRE, focalizacion?
4. Como lo haces hoy sin herramienta y cuanto te toma (Excel manual, memoria, PDFs)?
5. Que haria que lo uses el lunes: que pantalla, que alerta, quien mas necesita verlo?

### Data esperada
- **SIMON** (export Excel): una fila por respuesta por item por visita; codigo modular, fecha, campaña (BIAE, condiciones operativas, acompañamiento), especialista, respuestas.
- **Rubricas de observacion de aula**: docente (DNI), 5 desempeños en niveles I a IV, numero de visita. A veces en papel o Excel propio del especialista.
- **Padron ESCALE** como tabla maestra (cod_mod, anexo, nivel, rural/urbana, lat/long, caracteristica).
- Fallback si su data es inusable: descargar esta noche el Padron de su UGEL y generar fichas sinteticas realistas sobre esas IIEE reales (nombres verdaderos, resultados simulados), mas ENLA 2024 agregado por IE como capa de contexto.

### Modelo de datos propuesto
Esquema estrella, implementable en pandas en una hora:
- **dim_iiee**: cod_mod + anexo (llave), nombre, nivel, distrito, rural/urbana, caracteristica, lat/long. Fuente: Padron.
- **dim_docente**: id_docente (hash de DNI, disociado), cod_mod actual. Fuente: rubricas o NEXUS.
- **dim_campana**: id_campana, tipo de ficha, items.
- **fact_observacion** (tabla de hechos, formato long): grano = una visita x un desempeño observado. Columnas: cod_mod, anexo, id_docente, fecha_visita, num_visita, id_campana, desempeño (1 a 5), nivel (1 a 4), compromiso_abierto (bool).
Joins: cod_mod + anexo contra dim_iiee; hash DNI contra dim_docente. Presentacion: el diagrama vive como pantalla /modelo dentro del dashboard y como lamina; es entregable juzgado, mostrarlo explicitamente.

### KPIs (5 a 7)
1. **Cobertura**: IIEE con al menos 1 visita / total IIEE. Dice a donde nunca fuimos.
2. **Recencia**: dias desde la ultima visita por IE (mediana y maximo). Alimenta el cronograma.
3. **IPP (indice de practica pedagogica)**: promedio de niveles de rubrica (1 a 4) por IE. Comunica estado en un numero.
4. **Delta de practica**: IPP en visita N menos visita 1 por docente acompañado. El dato que ninguna UGEL sistematiza; muestra si el acompañamiento mueve la aguja.
5. **% docentes en nivel I o II en el desempeño 3** (evaluacion formativa, el mas debil historicamente). Define el tema del proximo GIA.
6. **Sesgo rural**: cobertura rural vs urbana. Corrige el sesgo hacia IIEE accesibles.
7. **Cierre de ciclo**: % de compromisos verificados en la visita siguiente. Mide si el monitoreo termina en algo.

### Dashboard (3 vistas maximo)
1. **Cobertura y priorizacion**: mapa o grilla de las ~200 IIEE, semaforo por recencia + cobertura + IPP, filtros por nivel y ruralidad. Boton "generar cronograma": lista de 10 proximas visitas priorizadas, exportable. Mañana: el especialista arma su ruta del mes.
2. **Panorama de practica**: heatmap de los 5 desempeños x IE (o red), ranking de desempeños mas debiles. Mañana: elegir tema de taller y docentes a focalizar.
3. **Ficha de IE**: trayectoria de visitas, deltas por docente disociado, compromisos abiertos, resumen de IA. Mañana: preparar la siguiente visita con foco.

### Feature de IA
- **Core**: resumen de acompañamiento por IE con Claude API y structured output: JSON con 3 hallazgos (cada uno citando textual el campo de la ficha que lo sustenta), 1 prioridad y agenda sugerida para la proxima visita. La cita verbatim es el wow: el jurado ve que no alucina.
- **Stretch**: clasificador de los comentarios de texto libre de las fichas en temas alineados a CGE4.
- **Fixture determinista**: precomputar los JSON de respuesta para 3 IIEE demo (incluida la IE que el especialista reconozca) y un modo demo que los sirve sin wifi.

### Recorte MVP (4.5 horas de build)
Dentro: JSON canonico hardcodeado desde su Excel real, 3 pantallas Next.js + Tailwind, 1 endpoint de IA con fallback a fixtures, deploy en Vercel. Fuera: auth, base de datos, mobile, integracion en vivo con SIMON, edicion de datos.
- 13:10 a 14:00: limpieza y JSON canonico (BREIT en pandas, tu defines el schema de salida).
- 14:00 a 15:30: dashboard, las 3 vistas.
- 15:30 a 16:00: fixtures de IA, deploy, ensayo de pitch.

### Guion de demo (3 beats) y one-liner
1. Problema con su numero real: "De nuestras 200 IIEE, X no recibieron ninguna visita este año y las fichas que si llenamos viven en Excel que nadie vuelve a abrir". Lo narra el especialista.
2. Vista de cobertura: un clic genera el cronograma de 10 visitas priorizadas del proximo mes.
3. Abrir una IE, boton de resumen IA: hallazgos citando la ficha textual y agenda de visita. Cierra el especialista: "el lunes armo mi cronograma con esto".
One-liner: "Ñawi convierte las fichas que la UGEL ya llena en el cronograma y el acompañamiento del proximo mes."

### Riesgos y trampas
- **Cobertura sesgada**: SIMON refleja las IIEE accesibles; decirlo en la slide de supuestos suma, ocultarlo resta.
- **Fichas heterogeneas**: los items cambian por campaña; normalizar a nivel de desempeño, no de item.
- **Datos docentes son datos personales laborales** (Ley 29733): DNI disociado por hash, nunca ranking publico de docentes, vistas individualizadas solo para acompañamiento, suprimir celdas con n menor a 5.
- **Trampa politica**: encuadrar como herramienta de acompañamiento y mejora, jamas como fiscalizacion o vigilancia docente.
- **Trampa de atribucion**: nunca afirmar que el acompañamiento causo mejora en ENLA; decir asociacion e insumo para focalizar.

---

## Reto 4: Falta analisis para visibilidad y toma de decision sobre evaluaciones educativas

### La solucion en una frase
**Yupay** (medir, contar, en quechua): tablero que convierte los resultados de ENLA, ERA y actas SIAGIE en un semáforo de prioridad por IE con acciones concretas de acompañamiento, para que la evaluación termine en decisión y no en PDF.

### Usuario y decision
Usuario primario: el **jefe de AGP** y sus **especialistas pedagógicos por nivel**. Decisión que habilita: a qué IIEE (de sus ~200) dirigir las visitas de monitoreo SIMON, el acompañamiento pedagógico y los GIA del próximo mes, y qué área/grado reforzar en cada una. Usuario secundario: el director de UGEL, que recibe el plan priorizado como evidencia para su informe a la DRE.

### 5 preguntas para el especialista UGEL (primera hora)
1. ¿Qué data trajiste exactamente: reportes SICRECE de ENLA por IE, Excel de la evaluación regional (ERA) con respuestas por ítem, actas SIAGIE? ¿Excel, CSV o PDF?
2. ¿Tus tablas traen código modular y anexo? Si no, ¿cómo identificas cada IE?
3. ¿Qué decisión tomas cada mes con resultados de evaluaciones (plan de visitas, talleres, informes)?
4. ¿Cómo lo haces hoy sin herramienta? Muéstrame el último reporte que armaste.
5. ¿Qué tendría que mostrar esta pantalla para que la uses el lunes y qué te pide tu director que hoy no puedes responder?

### Data esperada
Probable: (a) SICRECE/UMC: resultados ENLA 2024 por IE (porcentaje por nivel de logro, medida promedio, por grado y área), (b) ERA regional: Excel por estudiante-sección-IE con aciertos por ítem, sucio y sin escala Rasch, (c) actas SIAGIE: notas finales por área, (d) Censo "Resultado del ejercicio": aprobados, desaprobados, retirados por IE. Fallback público si su data es inusable: bases ENLA 2024 de umc.minedu.gob.pe/bases-de-datos + Padrón de ESCALE + Censo, filtrados a su UGEL. Descargar esta noche.

### Modelo de datos propuesto
Estrella simple, implementable en pandas en una hora:
- **dim_iiee** (del Padrón ESCALE): PK cod_mod + anexo; codigo_local, nombre, nivel, gestión, área rural/urbana, característica (unidocente/multigrado/polidocente), lat/long.
- **fact_resultados**: grano = cod_mod + anexo + año + grado + área + fuente (ENLA/ERA/SIAGIE/Censo). Medidas: n evaluados, % por nivel de logro, medida promedio, % aprobados/desaprobados/retirados.
- **dim_metas** (opcional): meta CGE1 por IE o UGEL.
- **prioridad_iiee** (derivada): score por IE calculado desde fact_resultados.
Llave universal: cod_mod + anexo; codigo_local solo si cruzas infraestructura. Preséntalo como lámina propia y como pantalla "Modelo" del dashboard: entidades, llaves y fuentes en una vista. Es entregable juzgado.

### KPIs (5 a 7)
1. **% satisfactorio** por IE, área y grado: satisfactorios/evaluados. Ordena el ranking base.
2. **Medida promedio y delta anual**: promedio Rasch vs año previo. Detecta mejora o caída real aunque los porcentajes engañen.
3. **% previo al inicio**: estudiantes en el nivel crítico/evaluados. Ubica dónde está la urgencia.
4. **Brecha rural-urbana interna**: % satisfactorio urbano menos rural en la UGEL. Focaliza recursos.
5. **Índice de prioridad**: normalizado(previo al inicio) + normalizado(caída de medida) + normalizado(% retirados del Censo). Ordena las visitas del mes.
6. **Cobertura de acción**: IIEE priorizadas con visita o GIA programado/priorizadas. Ataca el corazón del reto: poca acción post evaluación.
7. **Proxy de deserción**: (retirados + desaprobados)/matrícula, del Resultado del ejercicio. Cruza aprendizaje con permanencia.

### Dashboard (3 vistas maximo)
1. **Semáforo UGEL**: tabla de las ~200 IIEE con índice de prioridad en rojo/ámbar/verde, filtros por nivel, área y ruralidad. Acción: "estas 10 IIEE van al plan de visitas de agosto", botón que genera la lista.
2. **Ficha IE**: serie histórica, brechas por grado y área vs promedio UGEL y meta CGE1, más el resumen de IA. Acción: qué reforzar en la visita a esa IE.
3. **Brechas y plan**: cortes rural/urbano, sexo, lengua; lista consolidada de acciones (visitas, GIA, talleres) exportable. Acción: el plan mensual que el jefe AGP lleva firmable a su director.

### Feature de IA
Core: **explicador por IE**. Claude API con salida estructurada recibe el JSON de la IE y devuelve diagnóstico en lenguaje claro citando cifras textuales, 3 hipótesis (marcadas como asociación, nunca causa) y 3 acciones alineadas a CGE1/CGE4. Stretch: generador del plan mensual de visitas en formato de oficio. Fixture determinista: precomputa esta noche las respuestas de las 15 IIEE más críticas y guárdalas como JSON; el botón lee el fixture si no hay red. El wow funciona sin wifi.

### Recorte MVP (4.5 horas de build)
Dentro: JSON canónico hardcodeado desde su data real, 3 pantallas, 1 endpoint de IA con fixtures, deploy en Vercel. Fuera: auth, base de datos, móvil, integraciones, carga de archivos. Corte horario: 13:10-14:00 los BREIT limpian en pandas y emiten el JSON canónico; 14:00-15:30 dashboard Next.js con sus datos; 15:30-16:00 fixtures, deploy y ensayo de pitch con el especialista.

### Guion de demo (3 beats) y one-liner
Beat 1 (especialista): "De mis 200 IIEE, X concentran la mitad de los estudiantes en previo al inicio, y hoy eso vive en PDFs que nadie cruza". Beat 2: semáforo, filtro rural, top 5 a visitar la próxima semana. Beat 3: clic en una IE, la IA explica con cifras exactas y propone acciones; el especialista cierra: "esto cambia mi plan del lunes". One-liner: "Yupay convierte los resultados de las evaluaciones en el plan de acción mensual de la UGEL: de PDF a decisión en un clic."

### Riesgos y trampas
ECE y ENLA no son comparables entre sí, y la ERA menos (la aplica el propio docente, sin Rasch, con inflación): etiqueta cada fuente en pantalla. El dato ENLA llega con casi un año de rezago: véndelo como priorización, no tiempo real. Ley 29733: solo agregados por IE, suprime celdas con n menor a 5, jamás nombres o DNI; dilo en el pitch. Trampa de atribución: nunca afirmes que una capacitación causó la mejora. Trampa política del reto: un ranking de "peores colegios" culpa a directores y docentes; presenta el semáforo como priorización de apoyo, no de sanción. Cobertura censal incompleta en rural: muestra vacíos como "sin dato", nunca como cero.

---

## Reto 5: No hay sistema de seguimiento y desincentivo de inasistencia docente

### La solucion en una frase
"Kachkani" (quechua: "aqui estoy"): digitaliza el parte de asistencia que el director ya remite a la UGEL y lo convierte en un semaforo mensual por IE con alertas, descuentos oportunos y reconocimiento a los docentes que nunca faltan.

### Usuario y decision
Usuario primario: el especialista de personal del AGA (procesa descuentos en planilla) mas el jefe de AGP (prioriza visitas). Decision mensual habilitada: a que directores omisos requerir el parte, a que docentes aplicar descuento o proceso, que IIEE reciben visita inopinada y que docentes reciben resolucion de felicitacion. El director de UGEL firma con evidencia, no con rumores.

### 5 preguntas para el especialista UGEL (primera hora)
1. Que data trajiste: partes consolidados, export NEXUS, padron propio? En Excel, PDF o papel escaneado?
2. Como llega hoy el parte mensual y cuantos directores no lo remiten?
3. Que decision tomas cada mes con eso, y cuanto tarda el descuento en llegar a planilla?
4. Que haces hoy cuando sospechas que un docente rural va una vez al mes? Que evidencia te falta?
5. Que tendria que tener esta herramienta para que la uses el lunes sin nosotros?

### Data esperada
- Parte de asistencia consolidado por IE (papel o Excel del director, via AGA): DNI docente, dias laborados, tardanzas, inasistencias justificadas e injustificadas, mes.
- NEXUS (Excel del area de personal): codigo de plaza (12 digitos), DNI, cargo, condicion (nombrado/contratado), estado, codigo modular de la IE.
- Padron ESCALE (descarga libre): cod_mod + anexo, codigo de local, rural/urbano, lat/long, caracteristica (unidocente/multigrado).
Fallback publico si su data es inusable: Padron de IIEE + Censo Educativo (docentes por IE) de escale.minedu.gob.pe, con asistencia sintetica generada esta noche (fixtures deterministas, patron realista: peor en rural lejana).

### Modelo de datos propuesto
Estrella simple, implementable en pandas en una hora:
- fact_asistencia (grano: docente x IE x mes): dni, cod_mod, anexo, mes, dias_laborables, dias_asistidos, inasist_injustificadas, tardanzas, parte_recibido (bool), fecha_recepcion.
- dim_docente: dni, codigo_plaza, cargo, condicion. Fuente: NEXUS.
- dim_ie: cod_mod + anexo (llave con todo MINEDU), codigo_local, rural, unidocente, lat/long, horas de viaje a la UGEL. Fuente: Padron.
- fact_verificacion (grano: visita): cod_mod, fecha, docentes presentes vs esperados. Fuente: SIMON o visita inopinada. Es la capa de auditoria que triangula el autoreporte.
Joins: DNI (personas), cod_mod + anexo (IIEE). Presentalo como lamina y pantalla propia: 4 cajas con llaves y fuentes visibles. Es entregable juzgado.

### KPIs (5 a 7)
1. Tasa de inasistencia injustificada = inasist_injustificadas / dias_laborables, por docente e IE. Gatilla descuento.
2. IIEE en silencio = % de IIEE sin parte remitido en el mes. Gatilla llamada a directores omisos.
3. Rezago del parte = dias entre fin de mes y recepcion. Mide si el descuento llega a tiempo (hoy tarda 1 a 2 meses).
4. Indice de riesgo por IE = inasistencia x ruralidad x unidocente x silencio. Ordena las visitas inopinadas.
5. Reincidentes = docentes con faltas injustificadas en 2 o mas meses. Gatilla proceso o no renovacion de contrato.
6. Cobertura de verificacion = % de IIEE rojas con visita en el trimestre. Autoreporte auditado, honestidad del sistema.
7. Asistencia perfecta = docentes con 0 faltas en 3 o mas meses. Gatilla resolucion de felicitacion (suma en escalafon).

### Dashboard (3 vistas maximo)
1. Semaforo UGEL: tabla y mapa de las ~200 IIEE coloreadas por indice de riesgo, filtros rural/unidocente/nivel. Panel lateral: "mañana: llamar a estos N directores omisos, programar estas 5 visitas".
2. Ficha IE: serie mensual por docente (disociado salvo rol de personal), partes recibidos vs faltantes, ultima verificacion. Boton: generar requerimiento al director u oficio de descuento.
3. Incentivos y contratos: ranking de reincidentes (insumo de renovacion) y de asistencia perfecta (lista para felicitaciones). Cada vista termina en una accion con nombre y plazo.

### Feature de IA
Core: explicador de alerta. Claude API con salida estructurada genera, por IE en rojo, un parrafo que cita los datos exactos (IE, meses en silencio, tasa, horas de viaje) y recomienda la palanca legal correcta (requerimiento, descuento, visita, felicitacion) con borrador de oficio listo para copiar.
Stretch: preguntas en lenguaje natural sobre el JSON canonico ("que unidocentes llevan 2 meses sin parte?").
Fixture determinista: precomputar las respuestas JSON de las 3 IIEE del demo y servirlas si el fetch falla; el momento wow funciona sin wifi.

### Recorte MVP (4.5 horas de build)
ENTRA: JSON canonico hardcodeado desde su data real (o fixtures), 3 pantallas Next.js + Tailwind, 1 endpoint Claude, deploy en Vercel. FUERA: auth, base de datos, app movil de captura (el flujo del director por WhatsApp se muestra como mock), integracion real con NEXUS o planilla.
13:10-14:00 limpieza con BREIT (pandas: partes + NEXUS + Padron a JSON). 14:00-15:30 dashboard (semaforo, ficha, incentivos) mientras BREIT valida el indice de riesgo. 15:30-16:00 fixtures de IA, deploy, ensayo de pitch con el especialista.

### Guion de demo (3 beats) y one-liner
Beat 1 (habla el especialista): "De mis X IIEE rurales, Y no remitieron parte en junio; el descuento llega 2 meses tarde y nadie verifica en campo".
Beat 2: semaforo con su data real: "estas 5 IIEE se visitan la proxima semana, estos N directores se llaman mañana".
Beat 3: clic en una IE roja, la IA explica la alerta citando los numeros y entrega el oficio listo. Cierra el especialista: "el lunes proceso descuentos con esto".
One-liner: "Kachkani convierte el parte de papel en un semaforo mensual: la UGEL sabe quien asiste, descuenta a tiempo y felicita a quien nunca falta."

### Riesgos y trampas
- Calidad: partes en papel con meses faltantes, NEXUS desfasado (licencias y encargaturas tardias), asistencia SIAGIE marginal. Lleva una slide de vacios y supuestos: el jurado de datos premia el criterio.
- Autoreporte: el director reporta a su colega, y en unidocentes se reporta a si mismo. Respuesta: triangulacion con visitas muestrales (KPI 6), no biometria.
- Privacidad (Ley 29733): la asistencia docente es dato personal laboral. Vistas individualizadas solo para AGA; demo con datos disociados, sin DNI ni nombres; suprimir celdas con n menor a 5.
- Atribucion: no prometas que mas asistencia sube ENLA; di "condicion necesaria", no causa.
- Trampa politica (la grande): si suena a vigilancia docente, pierdes al gremio y al jurado. Framing: presencia y reconocimiento, digitalizas el circuito legal que ya existe, y el incentivo positivo (felicitacion, prioridad en capacitacion) va al mismo nivel visual que el descuento.

---

## Reto 6: Falta herramienta de seguimiento y analisis de Evaluacion Censal Regional

### La solucion en una frase
**QhawaERA** (de qhaway, mirar en quechua): tablero que convierte las sábanas Excel de la evaluación censal regional en un semáforo de IIEE contra las metas de aprendizaje de la región, con priorización de visitas y resúmenes de IA por colegio.

### Usuario y decision
El especialista pedagógico de AGP (por nivel) y su jefe de AGP. Decisión habilitada: a qué IIEE dirigir las visitas de monitoreo, acompañamiento y GIA del próximo mes, y qué reportar al director de UGEL y a la DRE sobre el avance frente a la meta regional (PER). Hoy eso se decide con sábanas Excel y memoria.

### 5 preguntas para el especialista UGEL (primera hora)
1. Qué archivos trajiste: ERA de qué año, grados y áreas, y en qué formato (sábana por estudiante, consolidado por IE, respuestas por ítem).
2. Las filas traen código modular o solo nombre de IE. Si solo nombre, arrancamos el match contra el Padrón ya.
3. Cuál es la meta regional oficial contra la que te miden (PER o meta DRE) y en qué indicador está expresada.
4. Qué haces hoy cuando llegan resultados: qué Excel armas, cuánto demoras, a quién lo envías, qué decisión gatilla.
5. Qué tendría que mostrar la primera pantalla para que la uses el lunes sin nosotros.

### Data esperada
Lo probable: sábanas Excel del sistema regional de la DRE (tipo ERA Ayacucho o kit Junín): una fila por estudiante con sección, grado, IE (nombre y ojalá cod_mod), respuestas por ítem, puntaje y nivel de logro por puntos de corte. Sucia: IIEE sin código, hojas por grado, encabezados combinados. Complemento: reportes SICRECE de ENLA por IE. Fallback público si su data es inusable: ENLA 2024 (4to primaria, censal) de umc.minedu.gob.pe/bases-de-datos más Padrón de ESCALE, filtrados a su UGEL: mismo modelo, misma demo.

### Modelo de datos propuesto
Estrella simple, implementable en pandas en una hora:
- **dim_iiee** (Padrón ESCALE): cod_mod + anexo (llave), cod_local, nombre, nivel, rural/urbana, característica (polidocente/multigrado/unidocente), distrito, lat/long.
- **dim_evaluacion**: id_eval, fuente (ERA o ENLA), año, grado, área, puntos de corte.
- **dim_meta**: área, grado, año, meta regional (% satisfactorio esperado).
- **fact_resultado**, grano: IE x evaluación x nivel de logro (cod_mod, anexo, id_eval, nivel, n, pct). Sale de un groupby sobre la sábana por estudiante; suprimir celdas con n menor a 5.
- **fact_item** (opcional), grano: IE x ítem: pct_acierto, capacidad. El diferencial: nadie explota los ítems de la ERA.
Llave universal: cod_mod + anexo (cruza con ENLA, Censo y Padrón). Presentación: una lámina "Modelo de datos" con entidades, llaves y fuentes; es entregable juzgado, dedícale 20 minutos.

### KPIs (5 a 7)
1. **% satisfactorio por IE, grado y área**: n_satisfactorio / n_evaluados. Base del semáforo.
2. **Brecha vs meta regional**: meta menos % satisfactorio. Ordena IIEE por distancia al objetivo, que es literalmente el reto.
3. **Cobertura de aplicación**: evaluados / matrícula del grado (Censo). Destapa IIEE que no aplicaron; sin esto el promedio miente.
4. **Concentración del nivel más bajo**: % de estudiantes en previo al inicio que aportan las 10 peores IIEE. Focaliza recursos.
5. **Delta interanual por IE**: misma prueba regional, con advertencia de comparabilidad.
6. **Capacidades críticas**: 5 ítems con menor acierto en la UGEL. Alimenta contenido de GIA y talleres.
7. **Índice de priorización**: brecha estandarizada más bono rural/multigrado. Genera la lista de visitas.

### Dashboard (3 vistas maximo)
1. **Panorama UGEL**: tarjetas (cobertura, satisfactorio vs meta, IIEE en rojo), barras por área/grado contra la línea de meta. Mañana sabes si la UGEL llega a la meta y dónde se rompe.
2. **Priorización**: tabla rankeada por índice, filtros rural/multigrado/nivel, semáforo por fila, botón "plan de visitas" que arma las 10 IIEE del mes. El cronograma de monitoreo del lunes sale de aquí.
3. **Ficha IE**: resultados por grado/área vs meta, capacidades flojas, delta, resumen de IA. Define qué trabajar en la visita o GIA de esa IE.

### Feature de IA
Core: resumen por IE con Claude API y salida estructurada (JSON: diagnóstico, 3 acciones alineadas a CGE1, citas textuales de los números). El especialista lo lee antes de subir a la camioneta. Stretch: borrador del informe a la DRE (avance vs meta, redactado, con tablas). Fixture determinista: precomputar las respuestas JSON de las 3 IIEE del demo; el endpoint sirve el fixture si no hay red. El wow funciona sin wifi.

### Recorte MVP (4.5 horas de build)
IN: JSON canónico hardcodeado desde su data real, 3 pantallas Next.js + Tailwind, 1 endpoint de IA con fallback a fixtures, deploy en Vercel. OUT: auth, base de datos, mobile, carga de archivos, integraciones SIAGIE/SICRECE. Reloj: 13:10 a 14:00, los BREIT limpian la sábana en pandas y emiten fact_resultado y dim_iiee como JSON; 14:00 a 15:30, dashboard (Panorama y Priorización primero, Ficha si alcanza); 15:30 a 16:00, fixtures de IA, deploy, ensayo con el especialista.

### Guion de demo (3 beats) y one-liner
Beat 1 (voz del especialista): "De nuestras N IIEE evaluadas, X no alcanzan la meta regional, y hoy eso vive en 14 Excel que reviso a mano". Beat 2: vista Priorización: "estas 10 IIEE concentran el Y% de los estudiantes en el nivel más bajo, este es mi plan de visitas del lunes". Beat 3: ficha IE con resumen de IA en vivo y cierre con la URL de Vercel: "la UGEL se lleva esto hoy". One-liner: "QhawaERA convierte la evaluación censal regional en el plan de visitas del lunes".

### Riesgos y trampas
- La ERA la aplica y califica el propio docente: resultados inflados y heterogéneos. Úsala para priorizar apoyo, nunca para certificar logro ni comparar con ENLA (sin Rasch, escalas distintas). Dilo en la slide de supuestos: este jurado premia el criterio.
- Cobertura incompleta: IE sin datos no es IE mala; muéstrala como "sin aplicar", no en rojo.
- Privacidad (Ley 29733): la sábana trae nombres y DNI de menores. Solo agregados por IE, suprimir n menor a 5, cero nombres en pantalla, demo con data disociada. Decirlo explícito suma puntos.
- Atribución: nada de "las visitas mejoraron el logro"; lenguaje de asociación y focalización.
- Trampa política: un ranking de IIEE se lee como ranking de directores. Encuádralo como priorización de acompañamiento, no de culpa, y sin resultados por docente en ninguna vista.

---

## Reto 7: No hay sistema de seguimiento y monitoreo de efectividad de entrenamientos docentes

### La solucion en una frase
**Yachay** (quechua: saber): tablero UGEL que cruza cada capacitacion docente (PeruEduca, talleres, acompañamiento) con el cambio observado en aula (rubricas MINEDU) y muestra por IE y por curso que formacion esta moviendo la practica y cual es gasto muerto.

### Usuario y decision
Usuario primario: el jefe de AGP y sus especialistas pedagogicos. Decision que habilita: donde focalizar el siguiente ciclo de acompañamiento y talleres (que IIEE, que docentes, que cursos repetir o eliminar). Usuario secundario: director de UGEL, que defiende presupuesto de capacitacion ante la DRE con evidencia, no con listas de asistencia.

### 5 preguntas para el especialista UGEL (primera hora)
1. Que data trajiste exactamente: listas PeruEduca, asistencia a talleres, fichas de acompañamiento con rubricas, export NEXUS? En que formato (Excel, PDF, SIMON)?
2. Las fichas de observacion usan los 5 desempeños en niveles I a IV? Cuantas visitas por docente al año logras hacer?
3. Que decision tomas cada mes o bimestre sobre capacitacion, y con que informacion la tomas hoy?
4. Como haces hoy el seguimiento sin herramienta: donde viven las listas, quien las consolida, que se pierde?
5. Que tendria que mostrar esta pantalla el lunes para que la uses en tu proxima reunion de AGP?

### Data esperada
Probable en su USB: lista de participantes PeruEduca enviada por DIFODS (DNI, curso, horas, estado de certificacion), asistencia a talleres UGEL (Excel manual), fichas de acompañamiento o export SIMON con rubricas por visita, y un export NEXUS (DNI, plaza, IE). Trampa conocida: los certificados PeruEduca no vienen vinculados a IE, se cruzan por DNI contra NEXUS. Fallback publico si su data es inservible: Padron de IIEE (ESCALE), ENLA 2024 por IE (UMC) y Censo "Resultado del ejercicio"; capa de capacitacion sintetica etiquetada como tal en pantalla.

### Modelo de datos propuesto
Estrella simple, implementable en pandas en una hora:
- **dim_docente**: dni_disociado, condicion (nombrado/contratado), escala, cod_mod de su IE actual (via NEXUS).
- **dim_iiee**: cod_mod + anexo (llave), cod_local, nombre, nivel, rural/urbana, distrito (fuente: Padron ESCALE).
- **dim_curso**: id_curso, nombre, tipo (PeruEduca, taller, acompañamiento), horas, costo estimado.
- **fact_participacion** (grano: docente x curso): dni_disociado, id_curso, fecha, estado (inscrito, culminado, certificado).
- **fact_observacion** (grano: docente x visita): dni_disociado, fecha, d1 a d5 en niveles I a IV, observador.
- **fact_resultado** (grano: IE x año): cod_mod, medida promedio y % satisfactorio ENLA.
Llaves: DNI disociado une persona; cod_mod + anexo une IE. Presentarlo como lamina propia y como pestaña "Modelo" dentro del dashboard: es entregable juzgado.

### KPIs (5 a 7)
1. **Cobertura de formacion**: docentes con al menos 1 curso culminado en 12 meses / total docentes. Dice a quien falta llegar.
2. **Tasa de completitud por curso**: certificados / inscritos. Detecta cursos que la gente abandona.
3. **Delta de practica**: promedio (rubrica visita N menos visita 1) por docente acompañado. El numero que hoy nadie calcula.
4. **% docentes que mejoran**: docentes que suben 1+ nivel en algun desempeño / docentes con 2+ visitas. Comunica mejor que el delta.
5. **Cierre de ciclo**: docentes capacitados con 2+ observaciones posteriores / capacitados. Mide si la UGEL verifica lo que invierte.
6. **Costo por docente que mejora**: inversion del curso / docentes con delta positivo. Habla el idioma del director.
7. **Focalizacion**: % de cupos asignados a IIEE con ENLA bajo o rubricas en I y II. Mide si la inversion va donde duele.

### Dashboard (3 vistas maximo)
1. **Semaforo por IE** (~200 filas): cobertura, cierre de ciclo y delta por IE, ordenado por prioridad, filtros rural/nivel. Accion: la lista de 5 IIEE a visitar la proxima semana, boton "exportar plan de visitas".
2. **Ficha por curso**: completitud, delta de practica de participantes, costo por docente que mejora, comparacion entre cursos. Accion: renovar, rediseñar o eliminar cada curso el proximo ciclo.
3. **Cola del especialista**: docentes certificados sin observacion de seguimiento, ordenados por antiguedad del curso. Accion: agendar las visitas que cierran el ciclo mañana.

### Feature de IA
Core: resumen ejecutivo por IE con Claude API y salida estructurada (JSON: diagnostico, 3 citas textuales de datos, accion recomendada, curso sugerido), renderizado en la ficha de cada IE. Stretch: borrador de retroalimentacion para el docente a partir de sus deltas de rubrica, que el acompañante edita. Fixture determinista: precomputar los JSON de las 3 IIEE del demo y servirlos desde archivo si no hay wifi; el demo nunca depende de la API en vivo.

### Recorte MVP (4.5 horas de build)
Entra: JSON canonico hardcodeado desde su data real, 3 pantallas (semaforo, ficha IE con IA, modelo de datos), 1 endpoint Claude con fixtures. Fuera: auth, base de datos, mobile, integraciones con SIAGIE/NEXUS en vivo. Cronograma: 13:10 a 14:00 limpieza y JSON canonico (BREIT en pandas, tu defines el schema); 14:00 a 15:30 dashboard Next.js con sus numeros reales; 15:30 a 16:00 fixtures, deploy a Vercel, ensayo de pitch con el especialista.

### Guion de demo (3 beats) y one-liner
Beat 1 (especialista): "Certificamos a N docentes el año pasado y no puedo decirte si uno solo enseña distinto". Beat 2: semaforo por IE, terminar en la accion: estas 5 IIEE se visitan la proxima semana. Beat 3: click en una IE, el resumen IA con citas de datos aparece, sin wifi. One-liner: "Yachay convierte certificados en evidencia: la UGEL sabe por primera vez que capacitacion cambia la practica en aula, y se lo lleva hoy en una URL".

### Riesgos y trampas
- **Atribucion**: nunca decir que la capacitacion causo mejora en ENLA (hay seleccion y desfase). Vocabulario: asociacion, focalizacion, monitoreo. Prometer causalidad ante jurado de datos mata la credibilidad.
- **Data escasa de rubricas**: pocas visitas por docente y sesgo hacia IIEE accesibles; mostrar la cobertura como KPI, no esconderla. Slide honesta de vacios y supuestos.
- **Join fragil**: PeruEduca cruza por DNI contra NEXUS desactualizado (ceses y encargaturas tardias); reportar % de match y no inventar el resto.
- **Privacidad (Ley 29733)**: desempeño docente es dato personal laboral; en pantalla, agregados por IE y DNI disociado, detalle individual solo para AGP, celdas con n menor a 5 suprimidas.
- **Trampa politica**: si suena a ranking o vigilancia docente, el gremio lo entierra. Encuadre: herramienta de soporte y focalizacion de acompañamiento, nunca lista publica de docentes malos.
