# Historias de Usuario (User Stories)

Este documento detalla las Historias de Usuario (HU) que guían el desarrollo de BarrioConecta.

## Sprint 1

### HU-01: Registro de Comerciante
- **Como**: Comerciante (Merchant).
- **Quiero**: Registrar mi local con nombre, fotos, horarios, categoría y ubicación.
- **Para**: Que los vecinos puedan encontrarme fácilmente y sepan cuándo visitarme.
- **Criterios de Aceptación**:
  - [ ] Validación de campos obligatorios (Nombre, Categoría, Coordenadas).
  - [ ] Carga exitosa de hasta 3 imágenes en formato JPG/PNG.
  - [ ] Ubicación ingresada manualmente o capturada por GPS.

## Sprint 2

### HU-02: Búsqueda y Filtros
- **Como**: Usuario (Vecino).
- **Quiero**: Filtrar negocios por categoría y por distancia desde mi ubicación.
- **Para**: Encontrar la opción más cercana y relevante sin perder tiempo.
- **Criterios de Aceptación**:
  - [ ] Detección automática de ubicación con permiso del navegador.
  - [ ] Filtros combinables de categoría y distancia.
  - [ ] Respuesta en menos de 1.5s al aplicar filtros.

### HU-03: Visualización de Reseñas
- **Como**: Usuario (Vecino).
- **Quiero**: Ver las calificaciones y comentarios de otros clientes sobre un negocio.
- **Para**: Tomar una decisión informada antes de visitar el lugar.
- **Criterios de Aceptación**:
  - [ ] Calificación promedio (1-5 estrellas) visible con conteo total.
  - [ ] Listado de reseñas ordenado por fecha descendente.
  - [ ] Respuestas del comerciante visibles debajo del comentario original.

### HU-06: Visualización de Listado y Detalles
- **Como**: Usuario (Vecino).
- **Quiero**: Ver los negocios en un listado vertical y acceder a su perfil completo.
- **Para**: Tener una referencia clara de los establecimientos disponibles.
- **Criterios de Aceptación**:
  - [ ] Listado vertical con Nombre, Categoría y Rating.
  - [ ] Al hacer clic, desplegar ficha técnica con horarios, fotos y mapa.

## Sprint 3

### HU-04: Panel de Moderación
- **Como**: Administrador (Admin).
- **Quiero**: Desactivar perfiles falsos y gestionar reportes de contenido inapropiado.
- **Para**: Mantener la integridad y confianza de la plataforma.
- **Criterios de Aceptación**:
  - [ ] Vista de reportes pendientes con estado (Nuevo / En Revisión / Resuelto).
  - [ ] Botón de desactivación inmediata que oculte el negocio en búsquedas.

### HU-05: Notificación de Reseñas
- **Como**: Comerciante (Merchant).
- **Quiero**: Recibir una notificación cuando alguien escriba una reseña sobre mi negocio.
- **Para**: Dar seguimiento oportuno a mis clientes.
- **Criterios de Aceptación**:
  - [ ] Aviso visual en el panel del comerciante para nuevas valoraciones.
  - [ ] Posibilidad de marcar notificaciones como leídas.

### HU-07: Reporte de Contenido
- **Como**: Usuario (Vecino).
- **Quiero**: Reportar un negocio o reseña que considere falsa o inapropiada.
- **Para**: Proteger a la comunidad de información engañosa.
- **Criterios de Aceptación**:
  - [ ] Formulario de reporte integrado en cada perfil y reseña.
  - [ ] Confirmación de recepción tras el envío del reporte.
