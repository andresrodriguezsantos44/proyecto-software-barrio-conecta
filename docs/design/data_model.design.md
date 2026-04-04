# Diseño del Modelo de Datos (Data Model)

Este documento define la estructura de las colecciones integradas en MongoDB para soportar la lógica de BarrioConecta.

## Esquemas Mongoose Detallados

### 1. Colección: `users`
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | `ObjectId` | Sí | PK Autogenerada |
| `email` | `String` | Sí | Único, Indexado, MinLength 5 |
| `password` | `String` | Sí | Hash bcrypt (10 rondas) |
| `role` | `Enum` | Sí | `merchant`, `admin` |
| `name` | `String` | Sí | Nombre completo del titular |
| `createdAt` | `Date` | Sí | Default `Date.now` |

### 2. Colección: `businesses`
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | `ObjectId` | Sí | PK Autogenerada |
| `name` | `String` | Sí | Nombre comercial, MinLength 3 |
| `description` | `String` | No | MaxLength 500 characters |
| `category` | `ObjectId` | Sí | FK → `categories` |
| `owner` | `ObjectId` | Sí | FK → `users` |
| `location` | `Object` | Sí | `{ type: "Point", coordinates: [lng, lat] }` |
| `photos` | `[String]` | No | URLs de imágenes (máximo 3) |
| `schedule` | `Object` | Sí | `{ mon-sun: { open, close } }` |
| `isActive` | `Boolean` | Sí | Default `true` |
| `avgRating` | `Number` | Sí | Decimal, range 1-5, Default 0 |

### 3. Colección: `categories`
- `name`: String (Gastronomía, Salud, Hogar, Tecnología, Educación, Otros).
- `icon`: String (Nombre del icono de librería de estilos).

### 4. Colección: `reviews`
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | `ObjectId` | Sí | PK Autogenerada |
| `business` | `ObjectId` | Sí | FK → `businesses` |
| `user` | `ObjectId` | Sí | FK → `users` |
| `rating` | `Number` | Sí | Entero 1 a 5 |
| `comment` | `String` | No | MaxLength 300 characters |
| `reply` | `String` | No | Respuesta del comerciante (Max 300) |
| `createdAt` | `Date` | Sí | Default `Date.now` |

### 5. Colección: `reports`
- `reporter`: ObjectId (FK → `users`).
- `targetType`: Enum (`business`, `review`).
- `targetId`: ObjectId (ID del elemento reportado).
- `reason`: Enum (`spam`, `false_info`, `inappropriate`, `other`).
- `status`: Enum (`new`, `in_review`, `resolved`).

## Indices Geoespaciales
Para que las búsquedas por radio de acción sean eficientes, la colección **businesses** DEBE contar con el siguiente índice en la capa de persistencia:
```javascript
businessSchema.index({ location: '2dsphere' });
```
