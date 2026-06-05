# Decisiones de arquitectura (ADR)

Registro de las decisiones técnicas relevantes. Formato: contexto → decisión → consecuencias.

---

## ADR-001 — Monorepo Bun + TypeScript (cambio de alcance ejecutado)
**Contexto.** La documentación inicial (Act. 2 y 4) planteaba Node.js + JavaScript con carpetas
`server/` y `client/`.
**Decisión.** Se migró a un **monorepo Bun con workspaces** (`apps/api`, `apps/web`,
`shared/contracts`) en **TypeScript**. El backend mantiene Express y Mongoose, pero corre sobre el
runtime de Bun.
**Consecuencias.** Instalación única (`bun install`), tipos compartidos entre FE y BE, y `bun test`
nativo. La documentación se reconcilió para reflejar el código real.

## ADR-002 — Tipos compartidos en `shared/contracts` (sin zod)
**Contexto.** Se necesitaba una fuente única de DTOs entre frontend y backend.
**Decisión.** Tipos **TypeScript planos** (interfaces/enums), sin zod ni ts-rest.
**Consecuencias.** Cero overhead en runtime; la validación de entrada queda del lado del backend
con **Joi**. El OpenAPI no se autogenera desde los contratos (ver ADR-005).

## ADR-003 — Autenticación con JWT y RBAC por middleware
**Contexto.** Tres roles: `merchant`, `admin`, `neighbor`.
**Decisión.** JWT firmados (HS256) + middlewares `authenticateJWT` y `requireRole`. Contraseñas
con **bcrypt** (10 rondas). Login devuelve siempre un error genérico ante credenciales inválidas.
**Consecuencias.** Control de acceso declarativo en las rutas; sin estado de sesión en servidor.

## ADR-004 — Pruebas con `bun test` + Vitest + Playwright
**Contexto.** La consigna pedía ≥85% de cobertura, pruebas de integración y E2E.
**Decisión.** `bun test` + supertest (API), Vitest (web), Playwright (E2E). Integración y E2E
levantan **`mongodb-memory-server`** (sin Mongo externo).
**Consecuencias.** Suite reproducible local y en CI. El umbral de cobertura de bun se evalúa
**por archivo**; el punto de entrada `app.ts` se excluye por ser glue de arranque.

## ADR-005 — OpenAPI con `swagger-jsdoc`
**Contexto.** Los contratos son tipos planos, no esquemas ejecutables (ADR-002).
**Decisión.** Documentar con anotaciones `@openapi` (JSDoc) en las rutas Express, servidas con
**swagger-ui** en `/api/docs`; spec versionado en `docs/openapi.json`.
**Consecuencias.** La documentación vive junto al código de las rutas; un script exporta el spec.

## ADR-006 — Despliegue Vercel (FE) + Render (BE) vía GitHub Actions
**Contexto.** Se requería pipeline con deploy automático a producción en merge a `main`.
**Decisión.** CI con gates (lint, typecheck, tests+cobertura, build, E2E); job de deploy
condicional a `main` que publica el FE en Vercel y dispara el deploy del BE en Render.
**Consecuencias.** El deploy se omite con *warning* si faltan los secrets, sin romper el pipeline.

## ADR-007 — Docker multi-stage con `--linker hoisted`
**Contexto.** Empaquetar la API de un monorepo Bun en una imagen.
**Decisión.** Dockerfile multi-stage (`oven/bun`). El `bun install` usa `--linker hoisted` para
producir un `node_modules` plano y autocontenido entre stages.
**Consecuencias.** La imagen arranca correctamente; el linker por defecto (isolated, con symlinks)
rompía la copia entre stages.
