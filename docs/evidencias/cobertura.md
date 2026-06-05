# Evidencia 1 — Cobertura de pruebas

Runner: `bun test --coverage` (API). Umbral exigido en CI: **≥ 85 %** (líneas y funciones,
evaluado por archivo). Reporte generado el último run local de la entrega final.

## Resumen global

| Métrica | Valor | Umbral |
|---------|-------|--------|
| **Funciones** | **100,00 %** | ≥ 85 % ✅ |
| **Líneas** | **98,44 %** | ≥ 85 % ✅ |
| Tests ejecutados | 239 (API) | — |

> El punto de entrada `src/app.ts` se excluye del umbral por ser glue de arranque
> (`app.listen` + bootstrap); sus rutas y middleware sí se ejercitan vía los tests de integración.

## Detalle por archivo (`% Funcs | % Líneas`)

```
--------------------------------------|---------|---------
File                                  | % Funcs | % Lines
--------------------------------------|---------|---------
All files                             |  100.00 |   98.44
 src/admin/controller.ts              |  100.00 |   94.67
 src/admin/model.ts                   |  100.00 |  100.00
 src/admin/service.ts                 |  100.00 |   90.76
 src/auth/controller.ts               |  100.00 |  100.00
 src/auth/middleware.ts               |  100.00 |  100.00
 src/auth/model.ts                    |  100.00 |  100.00
 src/auth/service.ts                  |  100.00 |   98.39
 src/businesses/category-model.ts     |  100.00 |  100.00
 src/businesses/controller.ts         |  100.00 |   96.05
 src/businesses/model.ts              |  100.00 |  100.00
 src/businesses/service.ts            |  100.00 |   88.24
 src/categories/controller.ts         |  100.00 |   94.74
 src/reviews/controller.ts            |  100.00 |   97.92
 src/reviews/model.ts                 |  100.00 |  100.00
 src/reviews/service.ts               |  100.00 |   93.15
 src/search/controller.ts             |  100.00 |   95.83
 src/search/service.ts                |  100.00 |   98.70
 src/shared/config.ts                 |  100.00 |  100.00
 src/shared/db.ts                     |  100.00 |  100.00
 src/shared/error.ts                  |  100.00 |  100.00
 src/shared/openapi.ts                |  100.00 |  100.00
--------------------------------------|---------|---------
```

## Reporte HTML navegable

```bash
bun run --cwd apps/api coverage:html
# Abre apps/api/coverage/html/index.html
```

> 📸 **Para el PDF:** abrir `apps/api/coverage/html/index.html` y capturar la vista general
> (muestra ~97,5 % de líneas cubiertas según `lcov --summary`).

## Tipos de prueba

| Tipo | Cantidad | Herramienta |
|------|----------|-------------|
| Unitarias + integración (API) | 239 | `bun test` + supertest + mongodb-memory-server |
| Componentes (web) | 52 | Vitest + @vue/test-utils |
| End-to-end | 4 | Playwright (Chromium) |
