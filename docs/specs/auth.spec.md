# Especificación de Autenticación y Autorización (Auth)

Este documento define el comportamiento esperado para la seguridad y control de acceso del sistema BarrioConecta.

## Requerimientos de Seguridad (RNF-01)
- **Cifrado**: Las contraseñas DEBEN ser almacenadas utilizando `bcrypt` con un costo de sal de 10.
- **Sesión**: Se DEBEN utilizar JSON Web Tokens (JWT) firmados con el algoritmo `HS256`.
- **Expiración**: El token de acceso DEBE expirar en un máximo de 24 horas (`24h`).
- **Middleware**: Todas las peticiones a endpoints protegidos DEBEN pasar por un middleware de autenticación que verifique la firma y la fecha de expiración del token.

## Roles del Sistema
1.  **Merchant (Comerciante)**:
    - Permiso para gestionar su propio perfil de negocio (CRUD).
    - Permiso para responder reseñas de su propio negocio.
    - Acceso a su dashboard personal.
2.  **Admin (Administrador)**:
    - Permiso para moderar (desactivar) cualquier perfil de negocio.
    - Permiso para gestionar reportes de spam o contenido inapropiado.
    - Acceso a métricas globales del sistema.
3.  **Vecino (Anónimo)**:
    - Sin necesidad de registro para búsqueda y visualización de negocios.
    - Requiere registro/login temporal (o cuenta de usuario básica) si desea reportar contenido o dejar reseñas (a definir en Sprint 2).

## Escenarios de Prueba (Gherkin)

### Escenario 1: Registro exitoso de Comerciante
**Given** que el usuario accede al formulario de registro
**When** ingresa un email válido, una contraseña segura (mín. 8 caracteres) y confirma los datos
**Then** el sistema DEBE crear el registro en la base de datos
**And** retornar un mensaje de éxito indicando que ya puede iniciar sesión

### Escenario 2: Intento de acceso con credenciales incorrectas
**Given** que existe un usuario registrado con el email `comercio@ejemplo.com`
**When** el usuario intenta iniciar sesión con el email `comercio@ejemplo.com` pero con una contraseña errónea
**Then** el sistema DEBE denegar el acceso con un error genérico (ej. "Credenciales inválidas")
**And** NO DEBE revelar si el usuario existe o no por razones de seguridad

### Escenario 3: Acceso a recurso protegido sin token
**Given** un endpoint protegido como `/api/business/create`
**When** un usuario anónimo intenta realizar una petición `POST` sin el header `Authorization`
**Then** el sistema DEBE retornar un código de estado `401 Unauthorized`
