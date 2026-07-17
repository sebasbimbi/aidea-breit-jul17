# PROMPTS.md: prompts listos para el dia del hack

Orden de uso: contrato de datos (con el cientifico de datos) → arranque del repo (`starter-assets/README.md`) → PROMPT MAESTRO → ingesta de data → vistas → feature IA → pulido → deploy → canvas. Copiar, rellenar corchetes, pegar en Claude Code.

---

## 0. Contrato de datos (para acordar con el cientifico de datos antes de las 10:30)

No es un prompt, es el acuerdo que le pides. Dictarselo o pasarselo por WhatsApp:

```
Contrato de datos del equipo:
- Me entregas uno o mas archivos JSON (no CSV, no Excel, no notebook).
- Un array de objetos por tabla, campos en snake_case, sin tildes en los nombres de campo.
- Toda fila de colegio lleva codigo_modular (string) como llave. Si hay nivel/anexo, tambien.
- Nulos como null, no como "", "NA" ni 0.
- Fechas en formato YYYY-MM-DD.
- Primera entrega parcial a la 1pm aunque este incompleta (con 20 filas me basta para armar la UI).
- Entrega final maximo 2:30pm. Despues de esa hora congelamos el esquema.
- Me pasas tambien un resumen de 5 lineas: filas, periodo, campos con huecos, rarezas.
```

---

## 1. PROMPT MAESTRO (pegar en Claude Code apenas exista el repo con starter-assets copiados)

```
Estamos en un hackathon de un dia (DataEdHack, UGELs del Peru). Tenemos hasta las 3:40pm para un MVP funcional. Trabaja rapido, sin preguntas de permiso, decisiones pragmaticas.

RETO: [pegar titulo y detalle del reto asignado, del kit en RETOS.md]
USUARIO: [rol exacto en la UGEL, del kit]
DECISION QUE HABILITA: [del kit]
KPIs: [lista del kit]
VISTAS: [las 3 vistas del kit]

Proyecto Next.js App Router + TypeScript + Tailwind ya configurado (package.json, configs y lib/ai.ts + lib/anthropic.ts ya estan en el repo, no los toques: lib/ai.ts es la cadena de proveedores de IA con suscripcion CLI, API y demo).

Construye:
1. data/: JSON canonico como unica fuente de verdad (te voy a pasar la data real en el siguiente mensaje). Sin base de datos.
2. lib/tipos + helpers puros para los KPIs (funciones puras testeables, sin LLM en los calculos).
3. app/page.tsx con las vistas indicadas. Navegacion por tabs simple.
4. Diseno: estetica editorial oscura tipo panel de control serio (referencia Carbon/Palantir), tipografia clara, semaforos con color + icono + texto (no solo color), tablas densas ordenables, sin emojis en la UI, sin em-dashes en ningun texto visible.
5. Todo el copy de la UI en espanol peruano formal (usted implicito, sin voseo).
6. Una vista debe ser imprimible/exportable (boton imprimir con CSS print basta).

Empieza por el esqueleto con data de ejemplo minima y reemplazamos con data real despues. Muestrame la app corriendo antes de pulir.
```

---

## 2. Ingesta de la data real (cuando el especialista UGEL entregue el archivo)

```
Aqui esta la data real de la UGEL: [ruta del archivo .xlsx/.csv, o pegar el JSON del cientifico de datos]

1. Conviertela a data/[nombre].json siguiendo el contrato: snake_case, codigo_modular como string, nulos como null, fechas YYYY-MM-DD.
2. Genera los tipos TypeScript.
3. Dame un reporte de calidad de 10 lineas: filas totales, campos con mas de 10% de huecos, duplicados por codigo_modular, valores fuera de rango, y que columnas NO podemos usar con honestidad.
4. Conecta el JSON a las vistas reemplazando la data de ejemplo.
No inventes valores para rellenar huecos: los huecos se muestran como "sin dato" en la UI. Esa honestidad es parte del pitch.
```

---

## 3. Feature de IA + fixtures (despues de que las vistas esten con data real)

```
Agrega la feature de IA usando la cadena existente en lib/ai.ts (no crees otro cliente):

FEATURE: [del kit: ej. resumen en lenguaje natural por colegio con citas textuales de sus datos, explicacion de por que un colegio esta en rojo, justificacion del ranking de priorizacion]

1. Route handler app/api/[nombre]/route.ts con salida estructurada (JSON Schema via lib/anthropic.ts).
2. System prompt con las reglas anti-alucinacion de siempre: responder SOLO con los datos provistos en el contexto, toda afirmacion cuantitativa cita el dato textual entre comillas, prohibido inventar numeros, sin em-dashes en la salida, espanol peruano.
3. data/demo-fixtures.json: para los [2-3] casos que vamos a mostrar al jurado, respuesta deterministica pre-generada. El route handler detecta esos inputs y devuelve el fixture sin llamar a la API. El demo NUNCA depende del wifi.
4. Badge de proveedor en la UI (suscripcion $0 / API / DEMO) como en el hack anterior.
```

---

## 4. Pase de pulido (15:00, timeboxed a 20 minutos)

```
Pase final de pulido, maximo 20 minutos, NO agregues features:
1. Estados vacios y de carga en cada vista.
2. Numeros formateados (miles con separador, porcentajes con 1 decimal).
3. Responsive basico (el jurado puede verlo en la pantalla del proyector y alguien lo abrira en celular).
4. Title, favicon neutro, metadata OG con el nombre de la herramienta.
5. Revisa TODO el copy visible: cero emojis, cero em-dashes, espanol peruano.
6. npm run build tiene que pasar limpio. Arregla lo que rompa.
```

---

## 5. Deploy (15:15, no despues de 15:40)

```
Deploy a produccion:
1. npm run build local primero. Si pasa:
2. vercel --prod (el proyecto ya esta linkeado o crea uno nuevo con el nombre del equipo).
3. Verifica el link en vivo: cada vista carga, el fixture del demo responde.
4. Recuerdame configurar ANTHROPIC_API_KEY en Vercel solo si queremos IA en vivo para input libre del jurado; el momento wow ya funciona con fixtures sin key.
5. Dame el link final y un QR (genera un SVG simple) para la ultima slide.
```

---

## 6. Canvas + guion de pitch (mientras corre el deploy)

```
Genera AIDEA-CANVAS.md siguiendo exactamente el formato del canvas de AIdea (mismas celdas que el hack pasado): nombre del equipo y solucion, integrantes, link publico del MVP, link del codigo en GitHub, problema, solucion, herramientas de IA (front, back, datos), impacto educativo, indicador de impacto (UNO solo, medible y visible en vivo en la herramienta), usuario de la solucion.

Reglas: espanol peruano, sin emojis, sin em-dashes, parrafos cortos listos para copiar y pegar celda por celda. El problema usa el numero real de esta UGEL: [numero]. El indicador de impacto es: [del kit].

Despues genera GUION-DEMO.md: 3 beats (problema con dato real, vista accionable, momento wow de IA con fixture), quien dice que, y la frase de cierre del especialista UGEL: [frase textual que dijo durante el dia].
```

---

## Recordatorios de operador

- Cada prompt asume que el anterior termino. No encadenar sin mirar el resultado.
- Si Claude Code se atasca mas de 10 minutos en algo, recortar el alcance, no debuggear con orgullo.
- Commit + push despues de cada bloque que funcione. El link de GitHub es parte del canvas.
- El cientifico de datos puede pedir ayuda con pandas: prestarle Claude Code 10 minutos es buena inversion, su JSON es tu insumo.
