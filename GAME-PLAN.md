# GAME PLAN: DataEdHack AIdea x BREIT, sabado 18 de julio 2026

Llegar 7:45. Empieza 8:00 en punto. Termina 18:20. Un dia, un MVP funcional, jurado a las 16:00.

## Lo esencial en 60 segundos

1. Es un DATA edhack, no un edhack de producto. Se juzgan 4 cosas: definicion del problema y fit problema-solucion, MODELO DE DATOS que responda a una necesidad real, herramienta de visualizacion ACCIONABLE que la UGEL se lleve y use, y MVP funcional demostrado.
2. Tu rol oficial: liderar el diseno tecnico y el desarrollo del prototipo de IA y analitica de datos. Los cientificos de datos BREIT (Python, pandas, sklearn, formacion MIT IDSS via edX) desarrollan el modelo de datos contigo. Tu integras todo en la herramienta.
3. La UGEL de tu equipo trae SU reto y SU data real (casi seguro Excel sucio). El especialista UGEL es tu usuario y esta sentado en tu mesa todo el dia. Validar con esa persona cada 30 minutos, igual que con Gaby en YachAI: el usuario dentro del equipo fue lo que gano el segundo puesto.
4. Formula probada dos veces: Next.js + Tailwind + JSON canonico sin base de datos + cadena de IA (suscripcion CLI, API, fixtures demo) + cita verbatim anti-alucinacion + deploy en Vercel + canvas prolijo. Todo el nucleo ya esta copiado en `starter-assets/`.
5. Los 7 retos posibles ya tienen kit de solucion en `RETOS.md`. Apenas sepas cual toco, abre ese kit y ejecuta. El contexto de sistemas de datos peruanos (SIAGIE, ECE, NEXUS, etc.) esta en `DATA-CONTEXT.md`. Los prompts listos para Claude Code estan en `PROMPTS.md`.

## Agenda con estrategia por bloque

### 8:00 a 9:20, registro, bienvenida y lightning talks
- Desayunar antes o llevar algo. Regla de cuerpo: hoy se come.
- Objetivo del bloque: mapear mentores y jurado potencial. Anotar nombres de los que dan lightning talks, citarlos en el pitch final suma.

### 9:20 a 12:30, formacion de equipos, building y mentoria
- Minuto 0: identificar al especialista UGEL y al cientifico de datos. Presentarte con una frase de servicio, no de jerarquia: "yo armo la herramienta, tu conoces el problema, ellos conocen la data, vamos a hacer que conversen".
- Primera hora con el especialista UGEL: las 5 preguntas del kit del reto (estan en `RETOS.md` por cada reto). La mas importante: que data trajiste y en que formato. Pedir el archivo DE INMEDIATO, no a las 11.
- Antes de las 10:30, cerrar con el cientifico de datos el CONTRATO DE DATOS: que JSON me entregas, con que campos, con que llave de cruce (codigo modular casi siempre). El template del contrato esta en `PROMPTS.md`. Este es el puente critico del dia: ellos trabajan en pandas o Colab, tu en Next.js, el JSON es la frontera.
- 10:30: arrancar el repo con la secuencia de `starter-assets/README.md` (5 minutos) y el PROMPT MAESTRO. A las 12:30 ya debe existir un esqueleto con data real cargada, aunque sea una sola tabla.
- Usar a los mentores para validar el recorte de alcance, no para explorar ideas nuevas.

### 12:30 a 13:10, almuerzo y pitch inicial
- Los organizadores dan el formato del pitch. Llenarlo con el guion del kit: problema con el numero real de la UGEL, usuario y decision, la solucion en una frase, que vamos a demostrar a las 16:00.
- Comer. En serio.

### 13:10 a 16:00, building (la ventana grande, 2 horas 50)
- 13:10 a 14:00: data real completa dentro de la app (JSON del cientifico de datos), tipos, vista 1 funcionando.
- 14:00 a 15:15: vistas 2 y 3, semaforo y priorizacion, feature de IA con salida estructurada.
- 15:15 a 15:40: fixtures deterministas del momento wow, deploy a Vercel, probar el link en el celular.
- 15:40 a 16:00: congelar codigo. Guion de demo, canvas, screenshots de respaldo por si el wifi muere. NADA de features nuevos despues de 15:40, regla dura de los dos hacks anteriores.
- Validaciones con el especialista UGEL cada vez que una vista queda: "usarias esto el lunes? que le falta para que lo uses?". Su frase textual va al pitch.

### 16:00 a 17:30, jurado, demos y pitches finales
- Estructura del pitch final (3 minutos tipicos):
  1. El problema con el dato real de ESTA ugel (numero concreto, nada generico).
  2. El modelo de datos EN PANTALLA: diagrama simple de entidades y cruce por codigo modular. Es un entregable juzgado, mostrarlo explicito, no asumirlo.
  3. Demo en vivo: la vista accionable (semaforo o ranking de priorizacion) y el momento wow de IA (fixture determinista, funciona sin wifi).
  4. Indicador de impacto UNICO y medible (el canvas pide solo uno).
  5. Cierre con la voz del usuario: el especialista UGEL dice en una frase por que lo usaria el lunes. Si el formato lo permite, que esa persona diga el cierre en vivo.
- Honestidad tecnica ante jurado de datos: nombrar la calidad real de la data y como el modelo la maneja. Con jurado BREIT y cientificos de datos en la sala, admitir los limites da mas credibilidad que esconderlos.

### 17:30 a 18:20, menciones, ganadores y cierre
- Ganen o no: foto del equipo, contactos del especialista UGEL y mentores clave, y anotar en el celular 3 lineas de material para el post de LinkedIn (mismo playbook que YachAI).

## Division de trabajo que propones al equipo

| Rol | Que hace | Tu puente con ellos |
|---|---|---|
| Especialista UGEL | Define problema, valida cada vista, aporta la data | Las 5 preguntas de la primera hora, validacion cada 30 min |
| Cientificos de datos BREIT | EDA en pandas, limpieza, modelo de datos, calculo de KPIs | Contrato de datos JSON antes de las 10:30 |
| Ingenieros de data | Ayudan a limpiar y cruzar fuentes (codigo modular) | Mismo contrato, ellos garantizan la llave de cruce |
| UX | Facilita, mapea al usuario, pule flujo y copy de las vistas | Le entregas las 3 vistas del kit como wireframe de partida |
| Gestion de proyectos | Tiempos, canvas, pitch | Le entregas el guion de demo y el indicador de impacto |
| Tu | Arquitectura, la herramienta, la feature de IA, el deploy | Todo lo anterior |

Regla anti-silos que pidieron los organizadores: la parte tecnica se construye preguntando en voz alta. Cada vez que termines algo, se lo muestras al especialista UGEL antes de seguir.

## Reglas de riesgo de demo (no negociables)

1. Fixtures deterministas para el momento wow: el demo NUNCA depende del wifi ni de la API.
2. Deploy a Vercel maximo 15:40. Un deploy roto a las 15:55 mata el pitch.
3. Screenshots de cada vista en el celular como ultimo respaldo.
4. Hotspot del celular listo como red de emergencia.
5. La app corre local en tu laptop como plan B del deploy.
6. Datos de menores siempre agregados o anonimizados en pantalla (Ley 29733). Mencionarlo en el pitch: es un punto que un jurado de datos valora.

## Checklist esta noche (jueves 17)

- [ ] Responder la SEGUNDA ENCUESTA de WhatsApp si no lo hiciste. Sin eso no confirman tu equipo.
- [x] Claude CLI en PATH, version 2.1.212 (verificado 17 jul; si quieres doble check del login corre `claude -p "hola"`).
- [x] `gh auth status`: sebasbimbi autenticado (verificado 17 jul).
- [x] `vercel whoami`: bimbi autenticado (verificado 17 jul).
- [x] `node -v` v22.22.3 y npm 10.9.8 (verificado 17 jul).
- [ ] Leer `RETOS.md` completo una vez (30 min). No memorizar: saber que existe cada kit.
- [ ] Leer `DATA-CONTEXT.md` una vez. Quedarte con los 5 hechos que impresionan en la mesa.
- [x] Datasets publicos de respaldo descargados a `data-fallback/` el 17 jul (padron ESCALE 180K servicios, SIAGIE matricula 2025, Censo 2024 con resultado del ejercicio, ENLA por UGEL; ver `data-fallback/README.md`).
- [ ] Cargar laptop y power bank. Adaptador HDMI/USB-C en la mochila.
- [ ] Verificar direccion del local y calcular salida para llegar 7:45.
- [ ] Dormir. Regla de cuerpo: manana rinde el que durmio 5+ horas, no el que trasnocho preparandose.

## Checklist manana en la mesa (primeros 15 minutos)

- [ ] Abrir este folder en Claude Code.
- [ ] Identificar el reto asignado y abrir su kit en `RETOS.md`.
- [ ] Pedir el archivo de data al especialista UGEL.
- [ ] Pasar las 5 preguntas del kit.
- [ ] Acordar el contrato de datos con el cientifico de datos (template en `PROMPTS.md`).

## Archivos de este folder

- `GAME-PLAN.md`: este archivo, el plan del dia.
- `RETOS.md`: kit de solucion por cada uno de los 7 retos posibles.
- `DATA-CONTEXT.md`: mapa de los sistemas de datos educativos del Peru a nivel UGEL.
- `PROMPTS.md`: prompts listos para pegar en Claude Code durante el hack.
- `starter-assets/`: nucleo de codigo probado de los 2 hacks anteriores, con su README de arranque.
- `Reunion Techs_ AIdea-BREIT-18 julio.pdf`: deck de la reunion del 17 de julio.
