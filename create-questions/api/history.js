const TABLE = "quiz_history";
const MAX_BODY_BYTES = 2_000_000;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(body));
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase no está configurado en el servidor.");
  return { url: url.replace(/\/$/, ""), key };
}

async function supabase(path, options = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${TABLE}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}: ${body.slice(0, 180)}`);
  return body ? JSON.parse(body) : null;
}

module.exports = async function handler(req, res) {
  try {
    const clientId = String(req.headers["x-history-client"] || "");
    if (!/^[0-9a-f-]{36}$/i.test(clientId)) return json(res, 400, { error: "Identificador de historial inválido." });

    if (req.method === "GET") {
      if (req.query.id) {
        const rows = await supabase(`?id=eq.${encodeURIComponent(req.query.id)}&client_id=eq.${clientId}&select=*`);
        if (!rows?.length) return json(res, 404, { error: "La evaluación ya no existe." });
        return json(res, 200, rows[0]);
      }
      const rows = await supabase(`?client_id=eq.${clientId}&select=id,title,file_name,created_at,question_count&order=created_at.desc&limit=50`);
      return json(res, 200, rows || []);
    }

    if (req.method === "POST") {
      const rawLength = Number(req.headers["content-length"] || 0);
      if (rawLength > MAX_BODY_BYTES) return json(res, 413, { error: "La evaluación supera el límite para el historial." });
      const body = req.body || {};
      if (!Array.isArray(body.questions) || !body.questions.length) return json(res, 400, { error: "No hay preguntas para guardar." });
      const record = {
        client_id: clientId,
        title: String(body.title || "Evaluación").slice(0, 180),
        file_name: String(body.fileName || "").slice(0, 240),
        context: String(body.context || "").slice(0, 8_000),
        rubric: String(body.rubric || "").slice(0, 80_000),
        questions: body.questions,
        question_count: body.questions.length,
      };
      const rows = await supabase("", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
      return json(res, 201, rows?.[0] || { ok: true });
    }

    if (req.method === "DELETE") {
      if (!req.query.id) return json(res, 400, { error: "Falta el id de la evaluación." });
      await supabase(`?id=eq.${encodeURIComponent(req.query.id)}&client_id=eq.${clientId}`, { method: "DELETE" });
      return json(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return json(res, 405, { error: "Método no permitido." });
  } catch (error) {
    console.error("[history]", error.message);
    return json(res, 500, { error: "No se pudo conectar con el historial." });
  }
};
