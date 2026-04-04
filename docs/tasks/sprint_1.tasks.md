# Tareas Detalladas: Sprint 1 (Días 1–15)

Este documento contiene el desglose granular de tareas para la fase inicial del proyecto BarrioConecta.

## Fase 1: Infraestructura y Base (Día 1-4)
- [ ] **Configuración de Repositorios**: Crear repositorio en GitHub y configurar ramas `main` y `develop`.
- [ ] **Inicialización del Backend**: 
  - [ ] `npm init` con Express.js.
  - [ ] Configuración de variables de entorno (`dotenv`).
  - [ ] Conexión exitosa a clúster de MongoDB Atlas mediante Mongoose.
- [ ] **Inicialización del Frontend**:
  - [ ] `npx degit` o `npm create vite@latest` con Vue.js 3 + Pinia.
  - [ ] Configuración base de Tailwind CSS y Leaflet.js.

## Fase 2: Autenticación de Usuarios (Día 5-9)
- [ ] **Modelado de Usuario**: Implementar esquema `User` con validaciones de email y roles.
- [ ] **Hashing de Contraseñas**: Integrar `bcrypt` en el pre-save del modelo de usuario.
- [ ] **Endpoints de Auth**:
  - [ ] Implementar `POST /auth/register`.
  - [ ] Implementar `POST /auth/login` con generación de token JWT.
- [ ] **Middlewares de Seguridad**: 
  - [ ] Crear el interceptor `verifyToken`.
  - [ ] Crear el middleware `checkRole(['merchant', 'admin'])`.

## Fase 3: CRUD de Negocios - Core (Día 10-15)
- [ ] **Esquema de Negocio**: Implementar modelo `Business` con índice `2dsphere` para geolocalización.
- [ ] **Carga de Imágenes**:
  - [ ] Configurar almacenamiento (AWS S3 o Cloudinary) para las 3 fotos permitidas.
  - [ ] Validar tamaño de archivos (<= 2MB) en el backend.
- [ ] **Endpoint de Creación**: Implementar `POST /businesses` (Protegido por token y rol).
- [ ] **Criterio de Aceptación Sprint 1**: El comerciante puede registrarse, loguearse y crear su perfil de negocio con éxito.
