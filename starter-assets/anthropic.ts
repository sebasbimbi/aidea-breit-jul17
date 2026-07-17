import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Model IDs verificados (claude-api skill). Opus para razonar la rubrica;
// Haiku para definiciones cortas; Sonnet como respaldo de latencia.
export const MODELS = {
  reason: "claude-opus-4-8",
  fast: "claude-haiku-4-5",
  fallback: "claude-sonnet-4-6",
} as const;

/**
 * Salida estructurada via output_config.format (JSON Schema). El primer bloque
 * de texto contiene JSON valido contra el schema. Devuelve el objeto parseado.
 * Se castea a `any` porque output_config puede no estar tipado segun la version
 * del SDK; el contrato del runtime si lo soporta.
 */
export async function structured<T>(opts: {
  model?: string;
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const res = await anthropic.messages.create({
    model: opts.model ?? MODELS.reason,
    max_tokens: opts.maxTokens ?? 2000,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
    output_config: { format: { type: "json_schema", schema: opts.schema } },
  } as any);

  const block = (res.content as any[]).find((b) => b.type === "text") as
    | { text: string }
    | undefined;
  if (!block) throw new Error("Sin respuesta de texto del modelo.");
  return JSON.parse(block.text) as T;
}
