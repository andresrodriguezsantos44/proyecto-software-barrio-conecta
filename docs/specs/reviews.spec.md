# Especificación de Reseñas y Reputación (Reviews)

Este documento define las reglas para la construcción de confianza y reputación digital en la plataforma BarrioConecta.

## Requerimientos Funcionales (RF-08, RF-09)
- **Calificación**: Escala obligatoria de **1 a 5 estrellas** (valor entero).
- **Comentario**: Campo de texto opcional de máximo **300 caracteres**.
- **Identidad**: Las reseñas DEBEN asociarse a un usuario registrado (`user_id`).
- **Respuesta**: El comerciante (`merchant`) DEBE poder responder una sola vez (`merchant_reply`) a cada reseña recibida.

## Lógica de Cálculo de Reputación
- **Promedio Automático**: Cada vez que se guarde una nueva reseña, el sistema DEBE recalcular el campo `avg_rating` en el documento del negocio (`business`).
- **Fórmula**: `(Sumatoria de Ratings) / (Cantidad total de reseñas)`.
- **Previsión de Redondeo**: El promedio DEBE mostrarse con **1 decimal** de precisión (ej. 4.2 estrellas).

## Escenarios de Prueba (Gherkin)

### Escenario 1: Envío de reseña con comentario extenso
**Given** un usuario autenticado en la vista de un negocio
**When** intenta escribir un comentario de "350 caracteres"
**Then** el sistema DEBE truncar el texto o impedir el envío con un error "Máximo 300 caracteres"
**And** NO DEBE guardar la reseña hasta corregir el tamaño

### Escenario 2: Actualización de reputación en tiempo real
**Given** un negocio con 1 reseña de 5 estrellas (Promedio: 5.0)
**When** un segundo usuario califica con "1 estrella"
**Then** el sistema DEBE actualizar el `avg_rating` del negocio a "3.0" inmediatamente
**And** mostrar el cambio en el listado de búsqueda

### Escenario 3: Respuesta del comerciante
**Given** una reseña de un cliente sin respuesta previa
**When** el comerciante del negocio envía un comentario a esa reseña
**Then** el sistema DEBE guardar el campo `merchant_reply` vinculado a la reseña original
**And** mostrar la respuesta debajo del comentario del cliente
