# BarrioConecta - Directorio Digital de Economía Local

![BarrioConecta Logo](https://img.shields.io/badge/Status-In%20Development-blue)
![Stack](https://img.shields.io/badge/Stack-Vue.js%203%20|%20Node.js%20|%20MongoDB-green)

**BarrioConecta** es una plataforma web (Single Page Application) diseñada para revitalizar la economía local. El proyecto centraliza la oferta de productos y servicios de los negocios de barrio (panaderías, ferreterías, talleres, etc.) a través de un directorio inteligente geolocalizado.

---

## 🌟 Propósito del Proyecto
En un mercado dominado por grandes superficies y plataformas internacionales, los micro-negocios locales sufren de una brecha digital crítica. BarrioConecta democratiza el acceso a la visibilidad online, permitiendo que:
- Los **comerciantes** gestionen su identidad digital sin complicaciones.
- Los **vecinos** encuentren lo que necesitan cerca de casa de forma ágil y confiable.

## 🛠️ Stack Tecnológico
Para garantizar escalabilidad, rendimiento y facilidad de mantenimiento, hemos seleccionado:
- **Frontend**: [Vue.js 3](https://vuejs.org/) (Composition API) + [Pinia](https://pinia.vuejs.org/) + [Tailwind CSS](https://tailwindcss.com/).
- **Backend**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/).
- **Base de Datos**: [MongoDB Atlas](https://www.mongodb.com/atlas) (NoSQL) con soporte para consultas geoespaciales.
- **Despliegue**: [Vercel](https://vercel.com/) (Frontend) y [Render](https://render.com/) (Backend).

## 📂 Estructura de Documentación
Toda la ingeniería del proyecto está detallada en la carpeta [`/docs`](./docs):

- **Propuesta**: [`docs/proposal/`](./docs/proposal/) - Alcance y visión inicial.
- **Especificaciones**: [`docs/specs/`](./docs/specs/) - Reglas de negocio detalladas (Auth, Búsqueda, Reseñas).
- **Diseño Técnico**: [`docs/design/`](./docs/design/) - Arquitectura, modelo de datos y endpoints de la API.
- **Requerimientos**: [`docs/requirements/`](./docs/requirements/) - Definición formal de RFs y RNFs.
- **Gestión de Proyecto**: [`docs/project_management/`](./docs/project_management/) - SCRUM, Historias de Usuario (HU).
- **Tareas (Sprints)**: [`docs/tasks/`](./docs/tasks/) - Desglose granular de la ejecución por Sprints.

## 🚀 Funcionalidades Principales
1.  **Gestión de Perfiles (CRUD)**: Los comerciantes registran sus locales con fotos, horarios y coordenadas GPS.
2.  **Motor de Búsqueda Inteligente**: Búsqueda por categorías y radio de distancia (500m a 2km).
3.  **Mapas Interactivos**: Visualización georreferenciada de la oferta local (Leaflet.js).
4.  **Sistema de Reputación**: Reseñas y calificaciones de 1 a 5 estrellas para generar confianza.
5.  **Panel de Administración**: Herramientas de moderación para evitar spam y contenido inapropiado.

## ⚙️ Configuración del Entorno (Guía Rápida)

### Requisitos Previos
- Node.js (v18+)
- MongoDB Atlas (Cluster configurado con índice `2dsphere`)

### Instalación
```bash
# Instalar dependencias del Backend
cd server
npm install

# Instalar dependencias del Frontend
cd client
npm install
```

### Variables de Entorno (.env)
Crea un archivo `.env` en el servidor con los siguientes campos:
```env
PORT=3000
MONGODB_URI=tu_cadena_de_conexion
JWT_SECRET=tu_secreto_seguro
```

---

## 👨‍💻 Autor
**Andrés Alfonso Rodríguez Santos**  
*Ingeniería de Software*  
*Corporación Universitaria Iberoamericana*

## 📜 Licencia
Este proyecto se distribuye bajo la licencia MIT.
