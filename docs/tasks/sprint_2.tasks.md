# Tareas Detalladas: Sprint 2 (Días 16–30)

Este documento contiene el desglose granular de tareas para la fase intermedia del proyecto BarrioConecta.

## Fase 4: Motor de Búsqueda y Filtros (Día 16-22)
- [ ] **Lógica de Localización**: Implementar `navigator.geolocation` en la Home de Vue.js.
- [ ] **Implementación de Search**:
  - [ ] Crear endpoint `GET /search` con soporte para `$near` o `$geoWithin`.
  - [ ] Desarrollar filtro por radio de acción (500m, 1km, 2km).
  - [ ] Desarrollar filtro selector por categorías.
- [ ] **Visualización en Mapa**:
  - [ ] Integrar `Leaflet.js` para mostrar pines de ubicación.
  - [ ] Personalizar iconos por categoría.
  - [ ] Implementar ventana emergente (Popup) con detalles rápidos.

## Fase 5: Sistema de Reseñas y Confianza (Día 23-30)
- [ ] **Esquema de Reseñas**: Implementar modelo `Review`.
- [ ] **Cálculo de Promedio**:
  - [ ] Desarrollar middleware `post-save` en Mongoose para recalcular `avgRating`.
- [ ] **Endpoints de Reseñas**:
  - [ ] Implementar `POST /reviews` (Limitado a una reseña por usuario por negocio).
  - [ ] Implementar `PUT /reviews/:id/reply` para el comerciante.
- [ ] **Frontend de Reseñas**:
  - [ ] Listar reseñas en el perfil del negocio.
  - [ ] Formulario de calificación por estrellas interactivo.
- [ ] **Criterio de Aceptación Sprint 2**: El usuario puede buscar negocios cercanos, filtrarlos y dejar su opinión calificada.
