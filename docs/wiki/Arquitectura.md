# Arquitectura

> Esta página reconcilia la narrativa original (Node.js + carpetas `server/`/`client/`) con el
> **código real**: un monorepo **Bun + TypeScript**. El backend usa Express y Mongoose, pero
> corre sobre el runtime de Bun. Detalle de diseño en [`docs/design/`](../design/).

## C4 — Nivel 1: Contexto

```mermaid
graph TD
    Vecino[Vecino] -->|busca y reseña negocios| SPA[BarrioConecta SPA]
    Comerciante[Comerciante] -->|publica y gestiona su negocio| SPA
    Admin[Administrador] -->|modera y ve estadísticas| SPA
    SPA -->|HTTPS /api/v1| API[BarrioConecta API]
    API -->|consultas + geo| Mongo[(MongoDB)]
```

## C4 — Nivel 2: Contenedores

```mermaid
graph LR
    subgraph Cliente
      Web[apps/web — Vue 3 SPA<br/>Pinia · Tailwind · Vue Router]
    end
    subgraph Servidor
      Api[apps/api — Express + Mongoose<br/>runtime Bun · TypeScript]
    end
    Contracts[shared/contracts — DTOs/enums TS]
    Web -->|fetch /api/v1| Api
    Web -.importa tipos.-> Contracts
    Api -.importa tipos.-> Contracts
    Api --> DB[(MongoDB · índice 2dsphere)]
```

- **`apps/web`** — SPA Vue 3. Vistas por ruta, componentes reutilizables, composables (búsqueda,
  geolocalización), stores Pinia y un cliente HTTP tipado.
- **`apps/api`** — API REST Express sobre Bun. Rutas montadas bajo `/api/v1`.
- **`shared/contracts`** — fuente única de DTOs y enums TypeScript compartidos entre FE y BE.

## C4 — Nivel 3: Componentes del backend (arquitectura por capas)

Cada módulo de dominio (`auth`, `businesses`, `search`, `reviews`, `admin`, `categories`) sigue
la misma estructura en capas:

```mermaid
graph TD
    Routes[routes.ts<br/>define endpoints] --> Controller[controller.ts<br/>HTTP → respuesta]
    Controller --> Validation[schemas.ts<br/>validación Joi]
    Controller --> Service[service.ts<br/>lógica de negocio]
    Service --> Model[model.ts<br/>esquema Mongoose]
    Model --> DB[(MongoDB)]
    Middleware[auth/middleware.ts<br/>JWT + RBAC] --> Controller
```

- **Routes** — declaran rutas y middlewares (autenticación, rol).
- **Controllers** — reciben la request, validan con Joi y formatean la respuesta.
- **Services** — lógica pura: hash/JWT, cálculo de `avgRating`, distancia geoespacial, reglas
  de negocio (p. ej. **BM-02**: un negocio activo por comerciante).
- **Models** — esquemas Mongoose; `Business.location` tiene índice `2dsphere` para `$near`.
- **Middleware** — `authenticateJWT` y `requireRole` implementan el control de acceso por roles.

## Manejo de errores

Un `globalErrorHandler` centralizado traduce los `AppError(status, message)` a respuestas
`{ status, message }` y oculta los detalles de errores no operacionales (500).

## Flujo de ejemplo: búsqueda geoespacial

```mermaid
sequenceDiagram
    participant Vecino
    participant SPA as SPA (Vue)
    participant API as API (Express/Bun)
    participant DB as MongoDB
    Vecino->>SPA: Busca "Panadería" en 1 km
    SPA->>API: GET /api/v1/search?categoryId=..&lat=..&lng=..&radius=1000
    API->>DB: $near sobre índice 2dsphere (solo isActive)
    DB-->>API: Negocios ordenados por proximidad
    API-->>SPA: { businesses: [...] }
    SPA-->>Vecino: Listado + detalle
```
