# Evidencia 3 — Ejecuciones del pipeline (≥ 3 verdes)

El pipeline vive en [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) y corre en cada
Pull Request y push a `main`: **lint · typecheck · tests (cobertura ≥85 %) · build · E2E**.

## Dónde ver los runs
GitHub → pestaña **Actions** del repositorio:
`https://github.com/andresrodriguezsantos44/proyecto-software-barrio-conecta/actions`

## Runs verdes a documentar

> 📸 Pegar aquí los enlaces y/o capturas de **al menos 3 ejecuciones exitosas**. A lo largo de la
> entrega se abrieron varios PRs (uno por paso), cada uno con su run; además, cada merge a `main`
> dispara otro run. Ejemplos a referenciar:

| # | PR / Evento | Enlace al run | Estado |
|---|-------------|---------------|--------|
| 1 | PR #2 — CI + baseline | `<pegar enlace>` | 🟢 |
| 2 | PR #3 — Pruebas (cobertura/E2E) | `<pegar enlace>` | 🟢 |
| 3 | PR #4 — Docker | `<pegar enlace>` | 🟢 |
| 4 | PR #5 — Swagger/OpenAPI | `<pegar enlace>` | 🟢 |
| … | Merges a `main` | `<pegar enlace>` | 🟢 |

> Para obtener el enlace de un run: Actions → seleccionar el workflow run → copiar la URL.
