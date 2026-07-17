import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { structured } from "./anthropic";

export type ProviderUsed = "cli" | "api" | "demo";

export interface AIResult<T> {
  data: T;
  provider: ProviderUsed;
  note?: string;
}

const CLI_MODEL = process.env.CLAUDE_CLI_MODEL || "sonnet";
const TIMEOUT_MS = Number(process.env.AI_CLI_TIMEOUT_MS || 90000);
const ORDER = (process.env.AI_PROVIDER_ORDER || "cli,api,demo")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOW_CLI_IN_PROD = process.env.ALLOW_CLI_IN_PROD === "true";

// El copiloto solo genera texto, nunca ejecuta herramientas.
const DISALLOWED_TOOLS = [
  "Bash",
  "Edit",
  "Write",
  "Read",
  "Glob",
  "Grep",
  "WebSearch",
  "WebFetch",
  "NotebookEdit",
  "TodoWrite",
  "Task",
];

// Allowlist de entorno: SOLO variables benignas pasan al proceso hijo. Asi
// NINGUNA ANTHROPIC_* / CLAUDE_* / AWS_* / GOOGLE_* sobrevive, lo que (a) fuerza
// el login de suscripcion (OAuth en ~/.claude), (b) evita que ANTHROPIC_BASE_URL
// o CLAUDE_CODE_USE_BEDROCK/VERTEX redirijan o re-cobren, y (c) evita filtrar el
// bearer. Mas robusto que borrar 2 claves de un copy completo del entorno.
const ALLOWED_ENV = [
  "PATH",
  "HOME",
  "NODE_ENV",
  "USER",
  "LOGNAME",
  "SHELL",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LC_MESSAGES",
  "TERM",
  "TMPDIR",
  "TZ",
  "COLUMNS",
  "LINES",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "XDG_CACHE_HOME",
  "NODE_EXTRA_CA_CERTS",
  "SSL_CERT_FILE",
  "SSL_CERT_DIR",
];

function childEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const k of ALLOWED_ENV) {
    const v = process.env[k];
    if (v !== undefined) env[k] = v;
  }
  return env;
}

function resolveCliBin(): string {
  const candidates = [
    process.env.CLAUDE_CLI_PATH,
    `${homedir()}/.local/bin/claude`,
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
  ].filter(Boolean) as string[];
  for (const c of candidates) if (existsSync(c)) return c;
  return "claude"; // ultimo recurso: que spawn lo resuelva via PATH
}

// Extraccion robusta de JSON: intenta el string entero, luego fences, luego un
// recorrido de llaves balanceadas (respeta strings) para tolerar prosa con "}".
function extractJson(text: string): unknown {
  const t = (text || "").trim();
  try {
    return JSON.parse(t);
  } catch {
    /* sigue */
  }
  let s = t;
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      s = fence[1].trim();
    }
  }
  const start = s.indexOf("{");
  if (start === -1) throw new Error("sin objeto JSON en la salida");
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(s.slice(start, i + 1));
    }
  }
  throw new Error("objeto JSON sin cerrar en la salida");
}

// Validacion de forma contra el schema (required + enum + tipos basicos). Evita
// que una salida malformada (o una inyeccion que rompa el shape) se renderice.
function validateShape(obj: any, schema: any): boolean {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  const props = schema?.properties ?? {};
  for (const key of schema?.required ?? []) if (!(key in obj)) return false;
  for (const [key, spec] of Object.entries<any>(props)) {
    if (!(key in obj)) continue;
    const v = obj[key];
    if (spec.type === "string" && typeof v !== "string") return false;
    if (spec.type === "array" && !Array.isArray(v)) return false;
    if (spec.enum && !spec.enum.includes(v)) return false;
  }
  return true;
}

/**
 * Ejecuta el CLI de Claude Code headless con el LOGIN DE SUSCRIPCION (no la API
 * por token). El contenido del usuario viaja por STDIN (aislado de la linea de
 * comandos, sin inyeccion). El system prompt va por flag.
 */
function runCli(system: string, user: string, model: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // En produccion no usamos la suscripcion como backend (ToS) salvo opt-in.
    if (process.env.NODE_ENV === "production" && !ALLOW_CLI_IN_PROD) {
      reject(new Error("CLI deshabilitado en produccion (ALLOW_CLI_IN_PROD != true)"));
      return;
    }

    const bin = resolveCliBin();
    const args = [
      "-p",
      "--output-format",
      "json",
      "--system-prompt",
      system,
      "--model",
      model,
      "--exclude-dynamic-system-prompt-sections",
      "--disallowedTools",
      ...DISALLOWED_TOOLS,
    ];

    const child = spawn(bin, args, {
      env: childEnv() as NodeJS.ProcessEnv,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        child.kill("SIGKILL");
      } catch {
        /* ya muerto */
      }
      reject(new Error(`CLI timeout (${TIMEOUT_MS}ms)`));
    }, TIMEOUT_MS);

    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));

    child.on("error", (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        if (err) console.error("[ai.cli] stderr:", err.slice(0, 500)); // log server-side
        return reject(new Error(`CLI exit ${code}`)); // mensaje generico al caller
      }
      let envelope: any;
      try {
        envelope = JSON.parse(out);
      } catch {
        return reject(new Error("CLI envelope parse error"));
      }
      if (envelope.is_error || envelope.subtype !== "success") {
        return reject(new Error(`CLI result not success: ${envelope.subtype ?? "unknown"}`));
      }
      resolve(String(envelope.result ?? ""));
    });

    // stdin a prueba de EPIPE: si el hijo muere antes de leer, no tumbamos Next.
    child.stdin.on("error", () => {});
    try {
      child.stdin.write(user);
      child.stdin.end();
    } catch {
      /* el hijo ya cerro stdin */
    }
  });
}

const JSON_ONLY =
  "\n\nFORMATO DE SALIDA: responde UNICAMENTE con un objeto JSON valido que cumpla el esquema descrito arriba. Sin bloques de codigo, sin comillas triples, sin texto antes ni despues del objeto.";

/**
 * Cadena de proveedores configurable (AI_PROVIDER_ORDER, por defecto cli,api,demo):
 *  1. cli  -> Claude Code headless con tu suscripcion ($0)
 *  2. api  -> Anthropic API por token (solo si hay ANTHROPIC_API_KEY)
 *  3. demo -> texto fijo marcado como demo
 */
export async function generate<T>(opts: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  demo: T;
  cliModel?: string;
}): Promise<AIResult<T>> {
  const tried: string[] = [];
  for (const provider of ORDER) {
    try {
      if (provider === "cli") {
        const raw = await runCli(opts.system + JSON_ONLY, opts.user, opts.cliModel || CLI_MODEL);
        const data = extractJson(raw);
        if (!validateShape(data, opts.schema)) {
          throw new Error("salida CLI no cumple el esquema");
        }
        return { data: data as T, provider: "cli" };
      }
      if (provider === "api") {
        if (!process.env.ANTHROPIC_API_KEY) {
          tried.push("api (sin ANTHROPIC_API_KEY)");
          continue;
        }
        const data = await structured<T>({
          system: opts.system,
          user: opts.user,
          schema: opts.schema,
        });
        return { data, provider: "api" };
      }
      if (provider === "demo") {
        return { data: opts.demo, provider: "demo", note: tried.join(" | ") || undefined };
      }
    } catch (e) {
      console.error(`[ai.${provider}]`, (e as Error).message); // log server-side, no al cliente
      tried.push(`${provider}: ${(e as Error).message}`);
    }
  }
  return { data: opts.demo, provider: "demo", note: tried.join(" | ") || undefined };
}
