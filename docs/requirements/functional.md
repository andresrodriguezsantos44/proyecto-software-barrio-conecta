# Requerimientos Funcionales (Functional Requirements)

Este documento detalla todas las funcionalidades del sistema BarrioConecta, agrupadas por su impacto y prioridad.

## Matriz de Requerimientos

| ID | Nombre | Descripción | Prioridad |
|---|---|---|---|
| **RF-01** | Registro de Usuarios | Permitir el registro de comerciantes con email y contraseña. | **Alta** |
| **RF-02** | Autenticación Segura | Acceso mediante JWT y cifrado de contraseñas con bcrypt. | **Alta** |
| **RF-03** | Registro de Negocios | CRUD completo de perfiles comerciales (Nombre, Cat, Foto, GPS). | **Alta** |
| **RF-04** | Edición de Perfil | Modificación en tiempo real de los datos del negocio por el dueño. | **Alta** |
| **RF-05** | Buscador por Categoría | Filtrado de negocios por rubros específicos (Salud, Gastronomía, etc). | **Alta** |
| **RF-06** | Búsqueda por Proximidad | Filtro por radio de distancia (500m, 1km, 2km). | **Alta** |
| **RF-07** | Visualización en Mapa | Mostrar pines de ubicación usando Leaflet.js y OSM. | **Media** |
| **RF-08** | Módulo de Reseñas | Sistema de calificación (1-5 estrellas) y comentarios. | **Alta** |
| **RF-09** | Cálculo de Reputación | Promedio automático de ratings reflejado en el perfil comercial. | **Media** |
| **RF-10** | Notificaciones | Avisos in-app para nuevas reseñas recibidas por el comerciante. | **Media** |
| **RF-11** | Panel de Admin | Dashboard para moderación de perfiles y reportes de spam. | **Alta** |
| **RF-12** | Reporte de Contenido | Permitir que los vecinos denuncien información falsa o inapropiada. | **Baja** |

## Criterios de Aceptación Generales
- Todas las entradas de datos DEBEN ser validadas tanto en frontend como en el backend (`Joi`/`Vuelidate`).
- Las peticiones que requieran rol de comerciante o admin DEBEN ser denegadas con `403 Forbidden` si el JWT no es válido.
