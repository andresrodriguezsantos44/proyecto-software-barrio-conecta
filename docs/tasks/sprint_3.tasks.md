# Tareas Detalladas: Sprint 3 (Días 31–45)

Este documento contiene el desglose granular de tareas para la fase final de BarrioConecta.

## Fase 6: Panel de Administración y Moderación (Día 31-37)
- [ ] **Esquema de Reportes**: Implementar modelo `Report`.
- [ ] **Funcionalidad de Reporte**:
  - [ ] Desarrollar endpoint `POST /reports` para negocios y reseñas.
  - [ ] Implementar visualización de reportes en el panel de administrador.
- [ ] **Gestión de Moderación**:
  - [ ] Implementar botón de desactivación de perfil con confirmación.
  - [ ] Desarrollar lógica de desactivación (`is_active: false`) y envío de notificación.
- [ ] **Dashboard de Administrador**: 
  - [ ] Crear componentes de tarjetas con métricas globales (Total Usuarios, Negocios, Reviews).
  - [ ] Listado filtrable de reportes por estado.

## Fase 7: Notificaciones e Interfaz (Día 38-42)
- [ ] **Implementación de Notificaciones**:
  - [ ] Sistema de avisos in-app (Pequeña campana o punto rojo) en el panel del comerciante.
  - [ ] Notificaciones push (opcional) o email automatizado.
- [ ] **UX / UI Refinamiento**:
  - [ ] Revisión de accesibilidad en dispositivos móviles.
  - [ ] Implementación de `Skeleton Loaders` para tiempos de carga de imágenes.

## Fase 8: Pruebas y Despliegue (Día 43-45)
- [ ] **Testing Final**:
  - [ ] Cobertura de tests unitarios (Jest/Vitest) >= 70%.
  - [ ] Pruebas E2E (Cypress) para el flujo de búsqueda crítica.
- [ ] **CI/CD Configuration**:
  - [ ] Despliegue automatizado en `Vercel` (FE).
  - [ ] Despliegue automatizado en `Render` (BE).
- [ ] **Criterio de Aceptación Sprint 3**: El sistema es íntegro, moderable y está disponible en producción para la comunidad.
