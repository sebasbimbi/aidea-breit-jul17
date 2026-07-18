// Proxy de Gemini del lado del servidor.
//
// POR QUE EXISTE: /crear es un HTML estatico servido desde public/. Cualquier
// cosa escrita ahi es publicamente legible con devtools, asi que la clave de
// Google NO puede vivir en ese archivo. Tampoco puede venir de un .env leido
// por server.js, porque en Vercel server.js no corre: el sitio es Next y los
// estaticos los sirve el CDN. El equivalente desplegado de un .env es esta
// route handler, que corre del lado del servidor y lee process.env.
//
// La clave nunca sale hacia el navegador: entra aca por variable de entorno y
// se adjunta a la llamada a Google. El cliente solo ve la respuesta.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// El cliente no elige el modelo. Si pudiera, este endpoint seria un proxy
// abierto a cualquier ruta de la API de Google.
const MODELO = "gemini-flash-latest";
const MAX_BODY = 1_000_000; // 1 MB: las rubricas extraidas son texto, no binario

function mismoOrigen(req: Request): boolean {
  // Los navegadores actuales mandan Sec-Fetch-Site en toda peticion. Es la
  // senal mas fiable y no se puede falsificar desde JS de otra pagina.
  const sfs = req.headers.get("sec-fetch-site");
  if (sfs) return sfs === "same-origin";
  // Sin esa cabecera, se compara Origin contra el host de la propia peticion.
  const origin = req.headers.get("origin");
  if (!origin) return true; // curl y similares: no hay riesgo de CSRF sin cookies
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!mismoOrigen(req)) {
    return Response.json({ error: { message: "Origen no permitido." } }, { status: 403 });
  }

  const clave = process.env.GOOGLE_API_KEY;
  if (!clave) {
    return Response.json(
      {
        error: {
          message:
            "El servidor no tiene GOOGLE_API_KEY configurada. Definila en las variables de entorno del proyecto y volve a desplegar.",
        },
      },
      { status: 503 }
    );
  }

  const crudo = await req.text();
  if (crudo.length > MAX_BODY) {
    return Response.json({ error: { message: "La rubrica excede el limite." } }, { status: 413 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(crudo);
  } catch {
    return Response.json({ error: { message: "JSON invalido." } }, { status: 400 });
  }

  // Solo se reenvian los dos campos que la app usa. Nada mas del cuerpo del
  // cliente llega a Google.
  const { contents, generationConfig } = (cuerpo ?? {}) as {
    contents?: unknown;
    generationConfig?: unknown;
  };
  if (!contents) {
    return Response.json({ error: { message: "Falta contents." } }, { status: 400 });
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // en cabecera y no en query string: no queda en logs de URL
          "x-goog-api-key": clave,
        },
        body: JSON.stringify({ contents, generationConfig }),
      }
    );
  } catch {
    return Response.json(
      { error: { message: "No se pudo contactar a la API de Gemini." } },
      { status: 502 }
    );
  }

  // Se devuelve el cuerpo de Google tal cual, para que el manejo de errores
  // que ya tiene el cliente siga funcionando sin cambios.
  const texto = await respuesta.text();
  return new Response(texto, {
    status: respuesta.status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function GET() {
  // Diagnostico sin exponer nada: solo dice si la clave esta configurada.
  return Response.json({ configurada: Boolean(process.env.GOOGLE_API_KEY), modelo: MODELO });
}
