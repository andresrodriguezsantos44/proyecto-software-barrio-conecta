# Evidencia 4 — Producción

El despliegue automático está configurado en el pipeline (job `deploy`, condicional a `main`):
frontend → **Vercel**, backend → **Render**. Se activa al cargar los secrets del repositorio
(ver [README → Secrets de CI/CD](../../README.md#secrets-de-cicd)).

## URLs de producción

> 📸 Completar tras el primer deploy:

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend (Vercel) | `<pegar URL>` | ⏳ |
| Backend (Render) | `<pegar URL>` | ⏳ |
| Health del backend | `<URL backend>/api/v1/health` | ⏳ |

## Capturas a incluir
> 📸 1. La SPA en producción (landing + explorar negocios).
> 📸 2. Respuesta de `GET /api/v1/health` en producción (`{ "status": "ok", ... }`).

## Pasos para activar el deploy
1. Cargar los secrets en GitHub → Settings → Secrets and variables → Actions:
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK`.
2. Hacer merge a `main` (o re-ejecutar el último run): el job `deploy` publica FE y BE.
3. Verificar las URLs y capturar.
