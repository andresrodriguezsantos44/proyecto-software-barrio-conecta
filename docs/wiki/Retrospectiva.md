# Retrospectiva

## Historias de usuario (backlog)

El backlog se organizó en 3 sprints con **7 historias** (ver
[`docs/project_management/user_stories.md`](../project_management/user_stories.md)).

| Sprint | HU | Título | Módulo | Estado |
|--------|-----|--------|--------|--------|
| 1 | HU-01 | Registro de Comerciante | `auth` | ✅ Completada |
| 2 | HU-02 | Búsqueda y Filtros | `search` | ✅ Completada |
| 2 | HU-03 | Visualización de Reseñas | `reviews` | ✅ Completada |
| 2 | HU-06 | Visualización de Listado y Detalles | `businesses` | ✅ Completada |
| 3 | HU-04 | Panel de Moderación | `admin` | ✅ Completada |
| 3 | HU-07 | Reporte de Contenido | `admin` | ✅ Completada |
| 3 | HU-05 | Notificación de Reseñas | — | ⛔ No implementada |

**Avance del backlog: 6 / 7 historias completadas (≈ 86 %).**

> HU-05 (notificaciones) quedó fuera del alcance entregado: existe el prototipo de UI pero no hay
> módulo de notificaciones en la API ni en el frontend. Se documenta como pendiente, no como hecho.

## Velocity por sprint

| Sprint | HU planificadas | HU completadas |
|--------|-----------------|----------------|
| 1 | 1 | 1 |
| 2 | 3 | 3 |
| 3 | 3 | 2 |

> No se asignaron *story points* formales en el backlog, por lo que la *velocity* se expresa en
> historias por sprint. Si el equipo asigna puntos, completar esta tabla con puntos cerrados/sprint.

## Calidad (métricas de la entrega final)

| Métrica | Valor |
|---------|-------|
| Cobertura de pruebas (API) | ~95 % líneas / 95 % funciones (umbral CI ≥ 85 %) |
| Tests automatizados | 239 (API) + 52 (web) + 4 E2E |
| Endpoints documentados (OpenAPI) | 17 (+ health) |
| Gates de CI por PR | lint · typecheck · tests · build · E2E |

## Qué salió bien
- Reconciliación de la documentación con el código real (stack Bun/TS/monorepo).
- Suite de pruebas reproducible sin dependencias externas (Mongo en memoria).
- Pipeline de CI/CD con evidencia de ejecuciones verdes.

## Qué mejorar
- Completar HU-05 (notificaciones), única historia pendiente.
- Formalizar *story points* para medir *velocity* cuantitativa.
- Activar el deploy real cargando los secrets de Vercel/Render.

## Próximos pasos
- Implementar el módulo de notificaciones.
- Publicar estas páginas en la Wiki de GitHub.
- Recolectar las evidencias finales (capturas de cobertura, runs del pipeline, URLs de producción).
