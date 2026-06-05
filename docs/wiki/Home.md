# BarrioConecta — Wiki

**BarrioConecta** es una SPA que conecta a vecinos con los negocios de su barrio mediante un
directorio inteligente geolocalizado. Esta wiki documenta el proyecto **tal como existe en el
repositorio** (monorepo Bun + TypeScript), no el plan original.

> Estas páginas viven versionadas en [`docs/wiki/`](./). Para publicarlas en la Wiki de GitHub,
> habilitá **Settings → Features → Wikis**, creá la primera página y copiá estos archivos al
> repositorio `*.wiki.git`.

## Navegación

| Página | Contenido |
|--------|-----------|
| [Arquitectura](./Arquitectura.md) | Vista C4 (contexto, contenedores, componentes) del monorepo |
| [Modelo de datos](./Modelo-de-datos.md) | Colecciones MongoDB y relaciones |
| [Guía de instalación](./Guia-de-instalacion.md) | Requisitos, instalación y comandos reales |
| [API](./API.md) | Endpoints y documentación Swagger/OpenAPI |
| [Decisiones (ADR)](./Decisiones-ADR.md) | Registro de decisiones de arquitectura |
| [Retrospectiva](./Retrospectiva.md) | Métricas e historias completadas |

## Stack real (resumen)

- **Monorepo Bun** (workspaces): `apps/api`, `apps/web`, `shared/contracts`.
- **Backend**: Express 4 + Mongoose 8 + Joi + JWT (sobre runtime **Bun**, TypeScript).
- **Frontend**: Vue 3 + Pinia + Tailwind 4 + Vue Router (Vite 6).
- **Pruebas**: `bun test` + supertest (API), Vitest (web), Playwright (E2E). Cobertura ≥85%.
- **CI/CD**: GitHub Actions (lint, typecheck, tests, build, E2E) → Vercel (FE) / Render (BE).

Más detalle en el [README](../../README.md) y en los documentos de ingeniería bajo [`docs/`](../).
