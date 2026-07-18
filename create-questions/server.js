const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const historyHandler = require("./api/history.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8765);

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

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Rúbrica Quiz disponible en http://127.0.0.1:${PORT}`);
});
