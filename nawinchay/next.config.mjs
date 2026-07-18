/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // /crear es la app de generacion de preguntas: HTML estatico autocontenido
    // servido desde public/, fuera del router de Next. Next no resuelve el
    // index.html de un directorio en public/, asi que /crear solo respondia en
    // /crear/index.html. El rewrite deja la URL limpia para la navbar.
    return [{ source: "/crear", destination: "/crear/index.html" }];
  },
};

export default nextConfig;
