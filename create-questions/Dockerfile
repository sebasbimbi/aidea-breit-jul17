# create-questions — Rubrica Quiz
#
# server.js no tiene dependencias npm: usa solo modulos nativos (node:http,
# node:fs, node:path) y el fetch global. Por eso no hay package.json y no hay
# npm install. La imagen es la oficial de Node y el codigo, nada mas.
#
# Node 20 y no 18 porque api/history.js llama a fetch global, que recien es
# estable a partir de Node 18. Se elige 20 LTS por margen.
FROM node:20-slim

WORKDIR /app

# El .dockerignore deja fuera el PDF de 12.4 MB, .env, Data/ y node_modules.
COPY . .

# server.js lee process.env.PORT y cae a 8765 si no esta.
ENV PORT=8765

# server.js escucha en process.env.HOST y cae a 127.0.0.1, que es lo correcto
# para desarrollo local. Dentro de un contenedor, 127.0.0.1 es la loopback DEL
# CONTENEDOR: el proceso quedaria inalcanzable desde afuera y `docker run -p`
# no serviria de nada. Por eso aca se fija 0.0.0.0.
ENV HOST=0.0.0.0

EXPOSE 8765

# Sin proceso de build: se ejecuta el servidor directamente.
CMD ["node", "server.js"]
