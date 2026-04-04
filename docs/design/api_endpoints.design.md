# Especificación de Endpoints (API REST)

Este documento define los contratos de comunicación entre el frontend (Vue.js) y el backend (Node.js/Express) para el proyecto BarrioConecta.

## Protocolo de Comunicación
- **Base URL**: `https://api.barrioconecta.com/v1`
- **Formato**: `application/json`
- **Autenticación**: `Bearer <token>` en el header `Authorization`.

## Recursos y Endpoints

### 1. Autenticación (Auth)
- `POST /auth/register`: Registro de nuevos comerciantes.
  - **Body**: `{ email, password, name, role: 'merchant' }`
- `POST /auth/login`: Autenticación de usuarios.
  - **Body**: `{ email, password }`
  - **Response**: `{ token, user: { id, email, role, name } }`

### 2. Gestión de Negocios (Businesses)
- `GET /businesses/my`: Obtener el perfil del negocio del comerciante autenticado.
- `POST /businesses`: Crear un nuevo perfil de negocio (Rol: Merchant).
- `PUT /businesses/:id`: Actualizar datos del negocio (Rol: Merchant / Admin).
- `DELETE /businesses/:id`: Desactivación lógica del negocio (Rol: Merchant / Admin).

### 3. Motor de Búsqueda (Search)
- `GET /search`: Búsqueda avanzada de negocios.
  - **Query Params**: `cat` (ID), `lat`, `lng`, `radius` (metros), `q` (query string).
  - **Response**: Array de objetos `business` con el campo `distance` calculado.

### 4. Reseñas y Reputación (Reviews)
- `GET /reviews/:businessId`: Listar todas las reseñas de un negocio específico.
- `POST /reviews`: Crear una nueva reseña (Rol: User/Merchant/Admin).
  - **Body**: `{ businessId, rating, comment }`
- `PUT /reviews/:reviewId/reply`: Responder a una reseña (Rol: Merchant propietario).
  - **Body**: `{ replyContent }`

### 5. Administración y Moderación (Admin)
- `GET /admin/reports`: Listar reportes de spam/contenido inapropiado.
- `PATCH /admin/reports/:reportId`: Cambiar estado del reporte (`IN_REVIEW`, `RESOLVED`).
- `GET /admin/stats`: Métricas generales del sistema (usuarios, negocios, reviews totales).

## Códigos de Respuesta Estándar
- `200 OK`: Petición exitosa.
- `201 Created`: Recurso creado con éxito.
- `400 Bad Request`: Error de validación en los datos enviados.
- `401 Unauthorized`: Token faltante o inválido.
- `403 Forbidden`: El usuario no tiene permisos para este recurso.
- `404 Not Found`: El recurso solicitado no existe.
- `500 Internal Server Error`: Falla genérica en el servidor.
