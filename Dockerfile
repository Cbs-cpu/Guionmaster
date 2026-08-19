# System Content Studio — imagen de despliegue.
#
# Base Debian (bookworm-slim), no Alpine: Remotion renderiza vídeo con un
# Chromium headless por debajo, y Chromium sobre musl (Alpine) da problemas
# de sobra documentados que sobre glibc no aparecen. No merece la pena
# ahorrar los ~40 MB de diferencia para heredar ese dolor de cabeza.
#
# Tres etapas: deps (todo, incluidas devDependencies, hace falta para
# compilar) → builder (next build, que con output:"standalone" deja un
# server.js con el árbol de node_modules ya podado) → runner (solo lo
# mínimo para arrancar + las librerías de sistema que pide Chromium).

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# better-sqlite3 compila un addon nativo si no hay binario precompilado para
# esta plataforma exacta — con las herramientas de compilación puestas, npm
# ci no se cae aunque le toque compilar en vez de descargar.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholders solo para que `next build` no falle si alguna ruta hace un
# require() en tiempo de import de una env var — los valores reales los pone
# el .env del servidor en tiempo de ejecución, no en la imagen.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Librerías de sistema que pide el Chromium headless que descarga/usa
# @remotion/renderer para renderizar vídeo — sin esto, renderMedia() falla
# al lanzar el navegador con un error de librería compartida ausente.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates fonts-liberation ffmpeg \
      libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcups2 \
      libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
      libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 \
      libxfixes3 libxkbcommon0 libxrandr2 xdg-utils libu2f-udev libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs studio

COPY --from=builder /app/public ./public
COPY --from=builder --chown=studio:nodejs /app/.next/standalone ./
COPY --from=builder --chown=studio:nodejs /app/.next/static ./.next/static
# El tracer de `output: standalone` a veces no arrastra el binario nativo de
# better-sqlite3 (sigue requires estáticos, y la carga del addon no siempre
# lo es) — se copia aparte como red de seguridad. Si ya estaba, esto no hace
# daño, solo sobrescribe con el mismo contenido.
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
# remotion/ (composiciones) y scripts/ hacen falta en tiempo de ejecución:
# el renderizador de vídeo hace `bundle({ entryPoint: "remotion/index.ts" })`
# contra el código fuente, no contra nada que `next build` compile.
COPY --from=builder /app/remotion ./remotion
COPY --from=builder /app/remotion.config.ts ./remotion.config.ts
COPY --from=builder /app/scripts ./scripts

# data/ (SQLite + media generado) vive en un volumen montado desde fuera,
# nunca dentro de la imagen — así un redeploy no pisa lo que ya se generó.
RUN mkdir -p /app/data && chown studio:nodejs /app/data

USER studio
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
