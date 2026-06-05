# Evidencia 5 — Swagger UI

La documentación interactiva se sirve en **`/api/docs`** (Swagger UI) y el spec OpenAPI 3 en
**`/api/docs.json`**, también versionado en [`docs/openapi.json`](../openapi.json).

## Cómo levantarla localmente
```bash
# Opción A: con la API y un Mongo local
JWT_SECRET=dev bun run dev:api      # luego abrir http://localhost:3000/api/docs

# Opción B: servidor E2E con Mongo en memoria (no requiere Mongo instalado)
JWT_SECRET=dev bun run --cwd apps/api e2e:server
# abrir http://localhost:3000/api/docs
```

## Contenido del spec (verificado)
- **18 operaciones** documentadas (17 endpoints de negocio + health).
- Agrupadas por tags: Auth, Businesses, Search, Reviews, Admin, Categories, Health.
- Esquemas de DTOs (request/response) con ejemplos.
- Autenticación **Bearer JWT** declarada en las rutas protegidas.

## Capturas a incluir
> 📸 1. Vista general de Swagger UI con los tags y endpoints desplegados.
> 📸 2. Un endpoint expandido (p. ej. `POST /auth/register`) mostrando request/response.
> 📸 3. (Opcional) El botón **Authorize** con el esquema Bearer JWT.
