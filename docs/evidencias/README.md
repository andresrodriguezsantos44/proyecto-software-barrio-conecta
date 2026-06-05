# Evidencias — Entrega final BarrioConecta

Índice de evidencias para el documento de sustentación. Las secciones marcadas con ✅ están
generadas y verificadas; las marcadas con 📸 requieren una captura o un dato de infraestructura
que controla el equipo (deploy, secrets, runs).

| # | Evidencia | Estado | Dónde |
|---|-----------|--------|-------|
| 1 | Cobertura de pruebas (resumen + HTML) | ✅ | [`cobertura.md`](./cobertura.md) |
| 2 | Métricas de retrospectiva (HU, velocity, backlog) | ✅ | [`retrospectiva.md`](./retrospectiva.md) |
| 3 | Ejecuciones del pipeline (≥3 verdes) | 📸 | [`pipeline.md`](./pipeline.md) |
| 4 | URLs de producción + app viva | 📸 | [`produccion.md`](./produccion.md) |
| 5 | Swagger UI funcionando | 📸 | [`swagger.md`](./swagger.md) |

## Cómo regenerar lo automatizable
```bash
# Cobertura (tabla + lcov + HTML navegable en apps/api/coverage/html)
bun run --cwd apps/api coverage:html

# Spec OpenAPI (docs/openapi.json)
bun run --cwd apps/api openapi:export

# Referencia TSDoc (docs/api/)
bun run --cwd apps/api docs:api
```
