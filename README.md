# BarrioConecta — Directorio Digital de Economía Local

![Status](https://img.shields.io/badge/Status-Entrega%20Final-blue)
![Stack](https://img.shields.io/badge/Stack-Bun%20|%20TypeScript%20|%20Vue%203%20|%20Express%20|%20MongoDB-green)
![Monorepo](https://img.shields.io/badge/Monorepo-Bun%20Workspaces-orange)

**BarrioConecta** es una plataforma web (Single Page Application) diseñada para revitalizar la economía local. El proyecto centraliza la oferta de productos y servicios de los negocios de barrio (panaderías, ferreterías, talleres, etc.) a través de un directorio inteligente geolocalizado.

---

## 🌟 Propósito del Proyecto
En un mercado dominado por grandes superficies y plataformas internacionales, los micro-negocios locales sufren de una brecha digital crítica. BarrioConecta democratiza el acceso a la visibilidad online, permitiendo que:
- Los **comerciantes** gestionen su identidad digital sin complicaciones.
- Los **vecinos** encuentren lo que necesitan cerca de casa de forma ágil y confiable.

---

## 🛠️ Stack Tecnológico (real, verificado contra el código)

> **Nota de alcance ejecutado:** la documentación académica original (Act. 2 y 4) planteaba un stack Node.js + JavaScript con carpetas `server/` y `client/` y pruebas con Jest. Durante la ejecución se migró a un **monorepo Bun + TypeScript**. Este README documenta **lo que existe de verdad en el repositorio**, no el plan inicial. Toda discrepancia se resuelve a favor del código real.

| Capa | Tecnología real |
|------|-----------------|
| **Runtime / gestor** | [Bun](https://bun.sh/) (workspaces, runner, gestor de paquetes) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) en todo el monorepo |
| **Backend (`apps/api`)** | [Express 4](https://expressjs.com/) sobre Bun · [Mongoose 8](https://mongoosejs.com/) · validación con [Joi](https://joi.dev/) · auth con `jsonwebtoken` + `bcryptjs` |
| **Frontend (`apps/web`)** | [Vue 3](https://vuejs.org/) (Composition API) · [Pinia](https://pinia.vuejs.org/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Vue Router](https://router.vuejs.org/) · [Vite 6](https://vitejs.dev/) |
| **Contratos (`shared/contracts`)** | Tipos TypeScript compartidos (DTOs, enums) entre API y web |
| **Base de datos** | [MongoDB](https://www.mongodb.com/) con consultas geoespaciales (índice `2dsphere`) |
| **Pruebas** | `bun test` + `supertest` (API) · [Vitest](https://vitest.dev/) + `@vue/test-utils` (web) |
| **Despliegue** | [Vercel](https://vercel.com/) (frontend) · [Render](https://render.com/) (backend) |

---

## 📂 Estructura del Monorepo

```
.
├── apps/
│   ├── api/                  # Backend Express + Mongoose (runtime Bun)
│   │   └── src/
│   │       ├── app.ts        # Bootstrap Express + montaje de rutas
│   │       ├── auth/         # Registro, login, JWT, middleware RBAC
│   │       ├── businesses/   # CRUD de negocios + categorías
│   │       ├── search/       # Búsqueda geoespacial por categoría/radio
│   │       ├── reviews/      # Reseñas y respuestas del comerciante
│   │       ├── admin/        # Reportes, moderación, estadísticas
│   │       ├── categories/   # Listado de categorías
│   │       └── shared/       # config, db, manejo de errores, seed
│   └── web/                  # Frontend Vue 3 (SPA)
│       └── src/
│           ├── views/        # Vistas por ruta (Explore, Auth, Dashboards…)
│           ├── components/   # Componentes reutilizables
│           ├── composables/  # Lógica reactiva (búsqueda, geolocalización)
│           ├── services/     # Lógica de negocio de la SPA
│           ├── stores/       # Estado global con Pinia
│           ├── api/          # Cliente HTTP tipado contra la API
│           └── router/       # Definición de rutas y guards
└── shared/
    └── contracts/            # Tipos TS compartidos (fuente única de DTOs)
```

Documentación de ingeniería en [`/docs`](./docs): [`proposal/`](./docs/proposal/), [`specs/`](./docs/specs/), [`design/`](./docs/design/), [`requirements/`](./docs/requirements/), [`project_management/`](./docs/project_management/), [`tasks/`](./docs/tasks/), [`maintenance/`](./docs/maintenance/).

---

## 🚀 Funcionalidades Principales
1. **Gestión de Perfiles (CRUD)**: los comerciantes registran sus locales con fotos, horarios y coordenadas GPS.
2. **Motor de Búsqueda Geoespacial**: búsqueda por categoría y radio de distancia (500 m a 2 km).
3. **Sistema de Reputación**: reseñas y calificaciones de 1 a 5 estrellas, con respuesta del comerciante.
4. **Panel de Administración**: moderación de reportes (spam / información falsa / contenido inapropiado) y estadísticas.
5. **Control de Acceso por Roles (RBAC)**: `merchant`, `neighbor` y `admin`, aplicado vía middleware JWT.

---

## ⚙️ Puesta en Marcha

### Requisitos Previos
- [Bun](https://bun.sh/) ≥ 1.3 (`curl -fsSL https://bun.sh/install | bash`)
- MongoDB en local (`mongodb://localhost:27017`) o un cluster de MongoDB Atlas con índice `2dsphere`

### Instalación (una sola vez, desde la raíz)
```bash
# Instala TODAS las dependencias del monorepo (api, web, contracts)
bun install
```
> No hay `cd server && npm install`. Bun resuelve los tres workspaces (`apps/api`, `apps/web`, `shared/contracts`) con un único `bun install` en la raíz.

### Variables de Entorno
Copiá el ejemplo y completá los valores (ver [`.env.example`](./.env.example)):
```bash
cp .env.example .env
```

**Backend (`apps/api`):**
| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `PORT` | no | `3000` | Puerto del servidor Express |
| `MONGODB_URI` | no | `mongodb://localhost:27017/barrio-conecta` | Cadena de conexión a Mongo |
| `JWT_SECRET` | **sí** | — | Secreto para firmar los JWT (la app lanza error si falta) |
| `JWT_EXPIRES_IN` | no | `24h` | Vigencia del token |

**Frontend (`apps/web`):**
| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `VITE_API_BASE_URL` | no | `http://localhost:3000/api/v1` | URL base de la API |

### Desarrollo
```bash
# Levantar la API (hot reload) — http://localhost:3000
bun run dev:api

# Levantar el frontend (Vite) — http://localhost:5173
bun run dev:web

# Sembrar datos de ejemplo en Mongo
bun run seed
```

### Pruebas
```bash
bun run test                      # Toda la suite (API + web)
bun run test:api                  # Solo API  (bun test + supertest)
bun run test:web                  # Solo web  (Vitest)
bun run --cwd apps/api test:coverage   # API con cobertura (umbral ≥85%)
bun run --cwd apps/web test:e2e        # E2E con Playwright (Chromium)
```

Estrategia de pruebas:
- **Unitarias + integración (API)** con `bun test`. Los tests de **integración** usan
  [`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server) (MongoDB en
  memoria), por lo que no requieren un Mongo externo. Cobertura global **≥85%**, exigida en CI.
- **Componentes (web)** con Vitest + `@vue/test-utils`.
- **E2E** con Playwright contra el SPA: registro/login de comerciante, alta de negocio y
  búsqueda por categoría con apertura del detalle. El backend E2E también levanta Mongo en
  memoria, así que `bun run --cwd apps/web test:e2e` funciona sin servicios externos
  (la primera vez descarga el navegador Chromium).

### Calidad
```bash
bun run lint        # ESLint en los workspaces
bun run typecheck   # tsc / vue-tsc --noEmit
```

---

## 🌐 API

La API se monta bajo el prefijo `/api/v1`. Endpoints disponibles:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/auth/register` | — | Registro de usuario |
| `POST` | `/auth/login` | — | Login → devuelve JWT |
| `POST` | `/businesses` | merchant | Crear negocio |
| `GET` | `/businesses/my` | merchant | Mis negocios |
| `GET` | `/businesses/:id` | — | Detalle de negocio |
| `PUT` | `/businesses/:id` | sí | Actualizar negocio |
| `DELETE` | `/businesses/:id` | sí | Desactivar negocio |
| `GET` | `/search` | — | Búsqueda geoespacial por categoría/radio |
| `GET` | `/reviews/:businessId` | — | Reseñas de un negocio |
| `POST` | `/reviews` | sí | Crear reseña |
| `PUT` | `/reviews/:reviewId/reply` | merchant | Responder reseña |
| `POST` | `/admin/reports` | sí | Crear reporte |
| `GET` | `/admin/reports` | sí | Listar reportes |
| `PATCH` | `/admin/reports/:reportId` | sí | Actualizar estado de reporte |
| `PATCH` | `/admin/business/:id/deactivate` | sí | Desactivar negocio (moderación) |
| `GET` | `/admin/stats` | sí | Estadísticas del panel |
| `GET` | `/categories` | — | Listar categorías |

> La documentación interactiva Swagger/OpenAPI se sirve en `/api/docs` (entrega final).

---

## 🔄 CI/CD (GitHub Actions)

El pipeline vive en [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):

- **En cada Pull Request** corren cuatro gates de calidad en paralelo:
  1. `Lint & Typecheck` — ESLint + `tsc`/`vue-tsc`.
  2. `Tests` — `bun test` + `supertest` (API, con MongoDB en memoria) y Vitest (web), exigiendo **cobertura ≥85%**.
  3. `Build` — build de producción del frontend con Vite.
  4. `E2E (Playwright)` — flujos de punta a punta contra el SPA.
- **En cada push/merge a `main`**, si los gates pasan, se ejecuta el job `Deploy`: frontend → Vercel, backend → Render.

### Secrets de CI/CD
Configurar en **GitHub → Settings → Secrets and variables → Actions**. Mientras no estén cargados, el job de deploy se omite con un *warning* (no rompe el pipeline):

| Secret | Para qué |
|--------|----------|
| `VERCEL_TOKEN` | Token de despliegue de Vercel (frontend) |
| `VERCEL_ORG_ID` | ID de la organización/usuario en Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel |
| `RENDER_DEPLOY_HOOK` | URL del Deploy Hook del servicio en Render (backend) |

---

## 🐳 Docker (solo aprendizaje)

El repo incluye un [`Dockerfile`](./Dockerfile) multi-stage (imagen base `oven/bun`) para la API
y un [`docker-compose.yml`](./docker-compose.yml) que orquesta MongoDB + API (+ frontend opcional).

```bash
# Construir y levantar MongoDB + API
cp .env.example .env        # define al menos JWT_SECRET
docker compose up --build   # API en http://localhost:3000

# Incluir además el frontend (Vite) en modo desarrollo
docker compose --profile frontend up --build   # SPA en http://localhost:5173

# Solo construir la imagen de la API
docker build -t barrio-conecta-api .
```

Notas:
- La API conecta a Mongo por el nombre de servicio de compose (`mongodb://mongo:27017/...`); el
  `depends_on` espera a que Mongo esté *healthy* antes de arrancar.
- Los puertos host son configurables vía `.env` (`API_PORT`, `MONGO_PORT`, `WEB_PORT`) para evitar
  choques con otros servicios locales.
- El `Dockerfile` instala las dependencias del workspace con `--linker hoisted` (necesario para que
  la imagen final sea autocontenida en este monorepo Bun).

---

## 👨‍💻 Autor
**Andrés Alfonso Rodríguez Santos**
*Ingeniería de Software — Corporación Universitaria Iberoamericana*

## 📜 Licencia
Distribuido bajo licencia MIT.
