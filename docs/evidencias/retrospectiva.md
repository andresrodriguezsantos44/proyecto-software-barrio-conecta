# Evidencia 2 — Métricas de retrospectiva

Datos derivados del backlog real ([`docs/project_management/user_stories.md`](../project_management/user_stories.md)).
Detalle narrativo en [`docs/wiki/Retrospectiva.md`](../wiki/Retrospectiva.md).

## Historias de usuario completadas

| Sprint | HU | Título | Estado |
|--------|-----|--------|--------|
| 1 | HU-01 | Registro de Comerciante | ✅ |
| 2 | HU-02 | Búsqueda y Filtros | ✅ |
| 2 | HU-03 | Visualización de Reseñas | ✅ |
| 2 | HU-06 | Visualización de Listado y Detalles | ✅ |
| 3 | HU-04 | Panel de Moderación | ✅ |
| 3 | HU-07 | Reporte de Contenido | ✅ |
| 3 | HU-05 | Notificación de Reseñas | ⛔ No implementada |

- **HU completadas:** 6 de 7.
- **Avance del backlog:** **≈ 86 %**.

## Velocity por sprint

| Sprint | HU planificadas | HU completadas |
|--------|-----------------|----------------|
| 1 | 1 | 1 |
| 2 | 3 | 3 |
| 3 | 3 | 2 |

> No se asignaron *story points* formales en el backlog; la *velocity* se expresa en historias
> por sprint. Completar con puntos cerrados/sprint si el equipo los formaliza.

## Métricas de calidad de la entrega

| Métrica | Valor |
|---------|-------|
| Cobertura (API) | 100 % funcs / 98,44 % líneas |
| Tests | 239 (API) + 52 (web) + 4 E2E = **295** |
| Endpoints documentados (OpenAPI) | 17 (+ health) |
| Gates de CI por PR | lint · typecheck · tests · build · E2E |

> La única historia pendiente es **HU-05 (notificaciones)**: existe el prototipo de UI pero no hay
> módulo implementado en API ni web. Se reporta como pendiente, no como hecho.
