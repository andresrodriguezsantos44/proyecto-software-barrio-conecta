# ============================================================================
# BarrioConecta API — imagen multi-stage (runtime Bun)
#
# La API es un workspace de un monorepo Bun y consume `shared/contracts` como
# TypeScript crudo (workspace:*), por lo que la imagen incluye apps/api y
# shared/contracts. Bun ejecuta TypeScript directamente: no hay paso de build,
# el "build" es la instalación de dependencias.
# ============================================================================

# --- Stage 1: instalación de dependencias (cacheable por manifiestos) -------
FROM oven/bun:1-alpine AS install

WORKDIR /app

# Copiar solo los manifiestos primero para aprovechar la cache de capas:
# si el código cambia pero las deps no, esta capa se reutiliza. Se incluye el
# package.json de apps/web (sin su código) para que el grafo de workspaces de
# Bun resuelva (la API depende de shared/contracts vía workspace:*).
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY shared/contracts/package.json ./shared/contracts/

# Instalar dependencias del workspace de forma reproducible. Bun NO ejecuta
# scripts postinstall por defecto, así que Playwright no descarga navegadores.
# --linker hoisted fuerza un node_modules plano (estilo npm) con archivos
# reales en la raíz: así `COPY --from=install node_modules` es self-contained
# (el linker "isolated" por defecto usa symlinks que se rompen entre stages).
RUN bun install --frozen-lockfile --linker hoisted

# --- Stage 2: runtime slim ---------------------------------------------------
FROM oven/bun:1-alpine AS release

ENV NODE_ENV=production
WORKDIR /app

# Traer las dependencias ya instaladas y los manifiestos.
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/package.json ./package.json
COPY --from=install /app/apps/api/package.json ./apps/api/package.json
COPY --from=install /app/shared/contracts/package.json ./shared/contracts/package.json

# Copiar el código fuente necesario (API + contratos compartidos).
COPY shared/contracts/src ./shared/contracts/src
COPY apps/api/src ./apps/api/src

# Ejecutar como el usuario no-root que la imagen oven/bun ya provee.
USER bun

EXPOSE 3000

# Healthcheck contra el endpoint de salud de la API.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun --eval "fetch('http://localhost:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "apps/api/src/app.ts"]
