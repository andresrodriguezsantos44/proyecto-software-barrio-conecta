# Guía de instalación

## Requisitos
- [Bun](https://bun.sh/) ≥ 1.3 — `curl -fsSL https://bun.sh/install | bash`
- MongoDB local (`mongodb://localhost:27017`) o un cluster Atlas con índice `2dsphere`.
- (Opcional) Docker, para levantar el stack con `docker compose`.

## Instalación
Desde la raíz del monorepo, un único comando instala los tres workspaces:
```bash
bun install
```

## Variables de entorno
```bash
cp .env.example .env   # completar al menos JWT_SECRET
```

| Variable | Obligatoria | Default | Descripción |
|----------|-------------|---------|-------------|
| `PORT` | no | `3000` | Puerto de la API |
| `MONGODB_URI` | no | `mongodb://localhost:27017/barrio-conecta` | Conexión a Mongo |
| `JWT_SECRET` | **sí** | — | Secreto de firma JWT (la API no arranca sin esto) |
| `JWT_EXPIRES_IN` | no | `24h` | Vigencia del token |
| `VITE_API_BASE_URL` | no | `http://localhost:3000/api/v1` | URL base de la API (frontend) |

## Comandos de desarrollo
```bash
bun run dev:api    # API con hot reload → http://localhost:3000
bun run dev:web    # SPA (Vite)        → http://localhost:5173
bun run seed       # Datos de ejemplo en Mongo
```

## Pruebas y calidad
```bash
bun run test                          # Toda la suite
bun run --cwd apps/api test:coverage  # API con cobertura (≥85%)
bun run --cwd apps/web test:e2e       # E2E (Playwright)
bun run lint
bun run typecheck
```

## Docker (opcional)
```bash
docker compose up --build                       # MongoDB + API
docker compose --profile frontend up --build    # + frontend (Vite)
```

## Documentación
- Swagger UI: `http://localhost:3000/api/docs`
- Referencia TSDoc: `bun run --cwd apps/api docs:api` → `docs/api/`
