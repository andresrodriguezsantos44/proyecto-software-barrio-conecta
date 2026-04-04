# Especificación de Panel de Administración (Admin)

Este documento define las herramientas de supervisión, moderación y métricas para el equipo de gestión de BarrioConecta.

## Herramientas de Moderación (RF-11, RF-12)
- **Manejo de Reportes**:
  - El sistema DEBE recibir reportes de usuarios sobre negocios o reseñas con los siguientes motivos:
    - `Spam`
    - `Información Falsa`
    - `Contenido Inapropiado`
    - `Otro`
  - Se debe asignar un estado al reporte: `NEW`, `IN_REVIEW`, `RESOLVED`.
- **Acciones sobre el Negocio**:
  - El administrador DEBE poder desactivar (`is_active: false`) un perfil de negocio.
  - Al desactivar un perfil, el sistema DEBE enviar una notificación automática (email o in-app) al comerciante explicando el motivo.
  - El negocio DEBE desaparecer automáticamente de todos los listados de búsqueda.

## Dashboard de Métricas
- El panel de administración DEBE presentar una vista consolidada de:
  - **Total de Usuarios** (Segmentado por rol: Merchant / Admin / User).
  - **Total de Negocios** (Activos vs Inactivos).
  - **Actividad de Reseñas** (Total de reseñas y promedio global de calificación).
  - **Reportes Pendientes** (Conteo de reportes con estado `NEW`).

## Escenarios de Prueba (Gherkin)

### Escenario 1: Reporte de contenido por un vecino
**Given** un usuario visualizando un perfil de negocio con información falsa
**When** hace clic en "Reportar", selecciona "Información Falsa" y envía el formulario
**Then** el sistema DEBE crear un documento en la colección `reports` vinculado al negocio
**And** mostrar una alerta de éxito al usuario indicando: "Gracias por tu reporte. Lo revisaremos a la brevedad."

### Escenario 2: Suspensión de negocio por administrador
**Given** un reporte pendiente con estado `NEW` sobre un negocio
**When** el administrador revisa el caso y selecciona "Desactivar Perfil"
**Then** el campo `is_active` del negocio DEBE cambiar a `false`
**And** el administrador DEBE ver el reporte como `RESOLVED` en su panel

### Escenario 3: Acceso denegado a usuarios no administradores
**Given** un usuario con rol `Merchant` autenticado
**When** intenta acceder manualmente a la ruta `/admin/dashboard`
**Then** el sistema DEBE denegar el acceso con un error `403 Forbidden`
**And** redirigir al usuario a su panel de gestión correspondiente
