# starter-assets: nucleo probado del copiloto-sineace (hack del 20 jun)

Archivos listos para copiar al repo nuevo apenas se forme el equipo. Son la base que ya funciono dos veces. No reinventar manana: copiar, `npm install`, y construir encima.

## Que es cada archivo

| Archivo | Que hace | Tocar manana? |
|---|---|---|
| `ai.ts` | Cadena de proveedores de IA: 1) `claude -p` headless con tu suscripcion (costo $0), 2) Anthropic API con salida estructurada, 3) respaldo demo determinista. Cada respuesta trae `_provider` para el badge en la UI. | No. Copiar tal cual a `lib/ai.ts`. |
| `anthropic.ts` | Cliente Anthropic + helper de salida estructurada (JSON Schema). | No. Copiar tal cual a `lib/anthropic.ts`. |
| `prompts.ts` | REFERENCIA del patron anti-alucinacion (grounding + cita verbatim obligatoria, sin em-dashes en salida). Es especifico de SINEACE: reescribir el contenido, mantener el patron. | Si, reescribir para el reto del dia. |
| `.env.example` | Config de la cadena de IA. Nada es obligatorio si hiciste `claude login`. | Copiar a `.env.example` del repo nuevo. |
| `package.json` | Deps exactas que ya compilaron: Next 15, React 19, Tailwind 3.4, @anthropic-ai/sdk, shaders (fondo WebGL). Cambiar solo el `name`. | Solo el nombre. |
| `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts` | Config probada del build. | No. |

## Secuencia de arranque (5 minutos, apenas haya nombre de proyecto)

```bash
mkdir <nombre> && cd <nombre>
cp ../aidea-breit-jul17/starter-assets/{package.json,tsconfig.json,next.config.mjs,postcss.config.mjs,tailwind.config.ts,.env.example} .
mkdir -p lib data app components
cp ../aidea-breit-jul17/starter-assets/{ai.ts,anthropic.ts} lib/
npm install
git init && gh repo create <nombre> --public --source=. --push
```

Luego pegar el PROMPT MAESTRO de `PROMPTS.md` en Claude Code y seguir construyendo.

## Recordatorios que costaron aprenderlos

- En Vercel el proveedor `cli` no corre (serverless): el orden efectivo es `api,demo`. Si quieres IA en vivo en el deploy, configura `ANTHROPIC_API_KEY` en las env vars de Vercel. El wow del demo funciona igual sin key gracias a los fixtures.
- Fixtures deterministas en `data/demo-fixtures.json`: el momento wow del demo NUNCA depende del wifi del local.
- Sin base de datos. La fuente de verdad es un JSON canonico en `data/`. El cientifico de datos te exporta JSON, no te conecta nada.
