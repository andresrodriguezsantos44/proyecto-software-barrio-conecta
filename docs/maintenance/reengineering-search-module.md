# Reingeniería del Módulo de Búsqueda — BarrioConecta

> **Actividad 6 — Taller: Técnica de mantenimiento de software**  
> Técnica aplicada: Reingeniería de software  
> Módulo intervenido: Búsqueda y visualización de negocios  
> Rama Git: `maintenance/reengineering-search-module`

---

## 1. Diagnóstico: estado antes de la reingeniería

El componente `ExploreView.vue` concentraba **todas las responsabilidades** del módulo:

```
ExploreView.vue (~115 líneas de script)
├── Constantes de dominio hardcodeadas (DEFAULT_LAT, DEFAULT_LNG, radiusOptions)
├── Estado de geolocalización (userLat, userLng, isLocating, locationError)
├── Lógica de geolocalización (requestGeolocation con navigator.geolocation)
├── Estado de filtros (selectedCategoryId, selectedRadius, searchQuery)
├── Construcción de la query de búsqueda (handleSearch)
├── Orquestación del store (searchStore.search)
└── Navegación (goToBusiness, getCategoryName)
```

**Problemas identificados:**

| Problema | Impacto |
|----------|---------|
| Constantes de dominio mezcladas con presentación | Si cambia la ciudad por defecto, hay que tocar la vista |
| Lógica de `navigator.geolocation` en la vista | No se puede reutilizar ni probar sin un DOM completo |
| Construcción de la query en la vista | Lógica de negocio expuesta en la capa de presentación |
| Sin filtrado local ni ordenamiento en cliente | Imposible reutilizar esa lógica en otras vistas |
| Sin tests propios del módulo de búsqueda frontend | No hay validación automatizada de los filtros |

---

## 2. Estructura después de la reingeniería

```
Módulo de búsqueda — capas separadas

┌─────────────────────────────────────────────────────┐
│ Capa de presentación                                │
│  ExploreView.vue (~50 líneas de script)             │
│  Responsabilidad: renderizar y delegar              │
└───────────────────┬─────────────────────────────────┘
                    │ usa
┌───────────────────▼─────────────────────────────────┐
│ Capa de lógica (Composables)                        │
│  useBusinessSearch.ts  — orquesta filtros y búsqueda│
│  useGeolocation.ts     — encapsula navigator.geo    │
└───────────────────┬─────────────────────────────────┘
                    │ usa
┌───────────────────▼─────────────────────────────────┐
│ Capa de dominio (Servicio)                          │
│  businessSearchService.ts                           │
│  - buildSearchQuery()  — construye la query         │
│  - filterByText()      — filtrado local optimista   │
│  - sortByDistance()    — ordenamiento en cliente    │
│  - DEFAULT_COORDS      — constante de dominio       │
│  - RADIUS_OPTIONS      — opciones de radio          │
└─────────────────────────────────────────────────────┘
```

---

## 3. Archivos creados y modificados

### Archivos nuevos

| Archivo | Responsabilidad |
|---------|----------------|
| `apps/web/src/services/businessSearchService.ts` | Servicio de dominio: lógica de filtrado, ordenamiento y construcción de query |
| `apps/web/src/composables/useGeolocation.ts` | Composable: encapsula `navigator.geolocation` y manejo de errores |
| `apps/web/src/composables/useBusinessSearch.ts` | Composable orquestador: une geolocalización, filtros y búsqueda |
| `apps/web/src/composables/__tests__/businessSearchService.test.ts` | Tests unitarios del servicio de dominio |
| `apps/web/src/composables/__tests__/useGeolocation.test.ts` | Tests unitarios del composable de geolocalización |
| `docs/maintenance/reengineering-search-module.md` | Este documento |

### Archivos modificados

| Archivo | Cambio realizado |
|---------|----------------|
| `apps/web/src/views/ExploreView.vue` | Script reducido de ~115 a ~50 líneas; usa `useBusinessSearch` y `RADIUS_OPTIONS` del servicio. El template no fue modificado. |

---

## 4. Decisiones técnicas

### Por qué un servicio y no solo el store

El `useSearchStore` maneja **estado de resultados** (loading, resultados, error). Pero la lógica de **preparar la búsqueda** (validar, normalizar, filtrar localmente) es responsabilidad de dominio — no de estado. Separarlos permite testear la lógica sin mockear Pinia.

### Por qué un composable de geolocalización separado

`navigator.geolocation` es una API del navegador que puede fallar de tres formas distintas. Aislarla en `useGeolocation.ts` permite:
1. Testarla independientemente con mocks de `vi.fn()`
2. Reutilizarla en otras vistas (ejemplo: mapa de detalle de negocio)
3. Reemplazarla fácilmente si en el futuro se usa una librería de geolocalización

### Por qué el template de ExploreView no cambió

La reingeniería mejora la **estructura interna** sin alterar el comportamiento observable. El usuario ve exactamente lo mismo. Esto garantiza que no se introducen regresiones en la interfaz.

---

## 5. Pruebas ejecutadas

### Tests automatizados — Backend (existentes, sin cambios)

```bash
cd apps/api && bun test
```

| Test | Estado |
|------|--------|
| `computeDistance` — coordenadas idénticas | ✅ Aprobado |
| `computeDistance` — distancia Bogotá ≈800m | ✅ Aprobado |
| `computeDistance` — Bogotá a Medellín ≈240km | ✅ Aprobado |
| `checkIsOpenNow` — negocio abierto | ✅ Aprobado |
| `checkIsOpenNow` — sin horario para hoy | ✅ Aprobado |
| `checkIsOpenNow` — horario vacío | ✅ Aprobado |

### Tests automatizados — Frontend (nuevos)

```bash
cd apps/web && bun run test
```

**businessSearchService:**

| Test | Estado |
|------|--------|
| `buildSearchQuery` — query básica con coordenadas y radio | ✅ Aprobado |
| `buildSearchQuery` — incluye categoryId | ✅ Aprobado |
| `buildSearchQuery` — convierte null a undefined | ✅ Aprobado |
| `buildSearchQuery` — convierte string vacío en q a undefined | ✅ Aprobado |
| `buildSearchQuery` — recorta espacios en blanco | ✅ Aprobado |
| `filterByText` — devuelve todos cuando query vacío | ✅ Aprobado |
| `filterByText` — filtra por nombre case-insensitive | ✅ Aprobado |
| `filterByText` — filtra ignorando acentos | ✅ Aprobado |
| `filterByText` — filtra por descripción | ✅ Aprobado |
| `filterByText` — sin coincidencias devuelve array vacío | ✅ Aprobado |
| `sortByDistance` — ordena ascendente por distancia | ✅ Aprobado |
| `sortByDistance` — negocios sin distancia van al final | ✅ Aprobado |
| `sortByDistance` — no muta el array original | ✅ Aprobado |
| `DEFAULT_COORDS` — apunta al centro de Bogotá | ✅ Aprobado |
| `RADIUS_OPTIONS` — tiene exactamente 3 opciones | ✅ Aprobado |

**useGeolocation:**

| Test | Estado |
|------|--------|
| Estado inicial — isLocating false | ✅ Aprobado |
| Estado inicial — sin error | ✅ Aprobado |
| Estado inicial — effectiveLat/Lng usan Bogotá como fallback | ✅ Aprobado |
| Éxito — actualiza coordenadas con posición real | ✅ Aprobado |
| PERMISSION_DENIED — usa Bogotá, muestra error | ✅ Aprobado |
| POSITION_UNAVAILABLE — usa Bogotá, muestra error | ✅ Aprobado |
| TIMEOUT — usa Bogotá, muestra error | ✅ Aprobado |
| Sin soporte en navegador — usa Bogotá, muestra error | ✅ Aprobado |

### Pruebas manuales de la interfaz

| Prueba | Entrada | Resultado esperado | Estado |
|--------|---------|-------------------|--------|
| Buscar por categoría | Categoría: Gastronomía | Solo negocios de gastronomía | ✅ Aprobado |
| Buscar por texto | Texto: "panadería" | Negocios con nombre/descripción coincidente | ✅ Aprobado |
| Filtrar por distancia | Radio: 1 km | Negocios dentro del rango | ✅ Aprobado |
| Sin resultados | Categoría inexistente | Mensaje "No se encontraron negocios" | ✅ Aprobado |
| Ver detalle | Clic en negocio | Se abre información completa | ✅ Aprobado |

---

## 6. Control de versiones

```bash
git checkout -b maintenance/reengineering-search-module
git add .
git commit -m "refactor: extraer businessSearchService con lógica de filtrado y constantes de dominio"
git commit -m "refactor: crear useGeolocation composable separando lógica de navigator.geolocation"
git commit -m "refactor: crear useBusinessSearch composable orquestador del módulo de búsqueda"
git commit -m "refactor: simplificar ExploreView usando composables de reingeniería"
git commit -m "test: agregar tests unitarios de businessSearchService y useGeolocation"
git commit -m "docs: agregar documentación técnica de reingeniería del módulo de búsqueda"
git push origin maintenance/reengineering-search-module
```

---

## 7. Resultados obtenidos

| Métrica | Antes | Después |
|---------|-------|---------|
| Líneas de script en ExploreView | ~115 | ~50 |
| Responsabilidades en ExploreView | 7 | 2 (inicialización + renderizado) |
| Funciones testeables del módulo frontend | 0 | 8 (`buildSearchQuery`, `filterByText`, `sortByDistance`, `useGeolocation` × 5 escenarios) |
| Constantes hardcodeadas en la vista | 3 | 0 |
| Reutilizabilidad de la lógica de geolocalización | Ninguna | Alta (composable independiente) |

---

## 8. Referencias

- Bourque, P. & Fairley, R. E. (Eds). (2014). *Guide to the Software Engineering Body of Knowledge — SWEBOK v3.0*. IEEE Computer Society. Cap. 5, Sección 1.
- Vue.js Documentation. (2024). *Composables*. https://vuejs.org/guide/reusability/composables
- Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill.
