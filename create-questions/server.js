const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const historyHandler = require("./api/history.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8765);
// Por defecto sigue siendo 127.0.0.1, igual que antes: en local no cambia nada.
// Dentro de un contenedor hay que escuchar en 0.0.0.0, porque 127.0.0.1 es la
// loopback del propio contenedor y el proceso quedaria inalcanzable desde el
// host aunque se publique el puerto. El Dockerfile setea HOST=0.0.0.0.
const HOST = process.env.HOST || "127.0.0.1";

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

loadEnv();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  req.query = Object.fromEntries(url.searchParams.entries());

  // Proxy de Gemini: la clave sale de GOOGLE_API_KEY (el .env local, o
  // docker run --env-file .env) y nunca viaja al navegador. Es el equivalente,
  // para este servidor, de lo que hace app/api/gemini en el sitio desplegado.
  if (url.pathname === "/api/gemini") {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.end(JSON.stringify({ error: { message: "Usa POST." } }));
    }
    const clave = process.env.GOOGLE_API_KEY;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (!clave) {
      res.statusCode = 503;
      return res.end(
        JSON.stringify({
          error: { message: "Falta GOOGLE_API_KEY en el entorno del servidor." },
        })
      );
    }
    const trozos = [];
    for await (const trozo of req) trozos.push(trozo);
    let cuerpo;
    try {
      cuerpo = JSON.parse(Buffer.concat(trozos).toString("utf8") || "{}");
    } catch {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: { message: "JSON invalido." } }));
    }
    try {
      // El modelo lo fija el servidor: si lo eligiera el cliente, esto seria un
      // proxy abierto a cualquier ruta de la API de Google.
      const upstream = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": clave },
          body: JSON.stringify({
            contents: cuerpo.contents,
            generationConfig: cuerpo.generationConfig,
          }),
        }
      );
      res.statusCode = upstream.status;
      return res.end(await upstream.text());
    } catch {
      res.statusCode = 502;
      return res.end(
        JSON.stringify({ error: { message: "No se pudo contactar a la API de Gemini." } })
      );
    }
  }

  if (url.pathname === "/api/history") {
    const origin = req.headers.origin || "";
    if (!origin || origin === "null" || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-History-Client");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      return res.end();
    }
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    if (req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try {
        req.body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "JSON inválido." }));
      }
    }
    return historyHandler(req, res);
  }

  const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.resolve(ROOT, requested);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.statusCode = 404;
    return res.end("Not found");
  }
  res.setHeader("Content-Type", mime[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Rúbrica Quiz disponible en http://${HOST}:${PORT}`);
});
