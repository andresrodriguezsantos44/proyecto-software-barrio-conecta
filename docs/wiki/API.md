# API

API REST bajo el prefijo **`/api/v1`**. Autenticación por **JWT Bearer**.

## Documentación interactiva
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Spec OpenAPI 3 (JSON)**: `http://localhost:3000/api/docs.json` — versionado en
  [`docs/openapi.json`](../openapi.json).

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/auth/register` | — | Registro de usuario |
| `POST` | `/auth/login` | — | Login → JWT |
| `POST` | `/businesses` | merchant | Crear negocio (BM-02) |
| `GET` | `/businesses/my` | merchant | Mis negocios |
| `GET` | `/businesses/:id` | — | Detalle de negocio activo |
| `PUT` | `/businesses/:id` | dueño/admin | Actualizar negocio |
| `DELETE` | `/businesses/:id` | dueño/admin | Desactivar (borrado lógico, BM-03) |
| `GET` | `/search` | — | Búsqueda geoespacial (orden por proximidad) |
| `GET` | `/reviews/:businessId` | — | Reseñas de un negocio |
| `POST` | `/reviews` | sí | Crear reseña (recalcula `avgRating`) |
| `PUT` | `/reviews/:reviewId/reply` | merchant | Responder reseña (RV-03) |
| `POST` | `/admin/reports` | sí | Crear reporte |
| `GET` | `/admin/reports` | admin | Listar reportes |
| `PATCH` | `/admin/reports/:reportId` | admin | Actualizar estado de reporte |
| `PATCH` | `/admin/business/:id/deactivate` | admin | Desactivar negocio (moderación) |
| `GET` | `/admin/stats` | admin | Estadísticas del panel |
| `GET` | `/categories` | — | Listar categorías |

## Convenciones de respuesta
- Éxito: `{ "status": "success", "data": ... }`
- Error: `{ "status": "fail" | "error", "message": "..." }`

Detalle de cada operación (parámetros, cuerpos, códigos) en el Swagger UI.
Ver también [`docs/design/api_endpoints.design.md`](../design/api_endpoints.design.md).
