# Especificación de Gestión de Negocios (CRUD)

Este documento define la lógica de negocio y reglas para la administración de perfiles de micro-negocios en la plataforma.

## Reglas de Negocio
- **Unicidad**: Cada comerciante (email asociado) DEBE tener máximo un perfil de negocio activo en esta fase inicial.
- **Campos Mandatorios**:
  - `Nombre`: Mínimo 3 caracteres, obligatorio.
  - `Categoría`: DEBE pertenecer a la lista maestra predefinida (Gastronomía, Salud, Hogar, etc.).
  - `Horarios`: Objeto JSON con apertura/cierre obligatorio para cada día de la semana.
  - `Coordenadas`: Latitud y Longitud obtenidas del GPS del dispositivo o ingreso manual mediante mapa interactivo.
- **Material Gráfico**:
  - `Fotos`: Se permite un máximo de **3 imágenes** por negocio.
  - `Tamaño`: Máximo 2 MB por archivo.
  - `Formato`: Únicamente JPG, PNG, WEBP.
- **Estado de Registro**: El negocio puede estar en estado `Activo` o `Inactivo` (suspendido por administración).

## Flujo de Trabajo (CRUD)
1.  **Creación**: Solo usuarios con rol `Merchant` pueden registrar un negocio.
2.  **Edición**: El comerciante puede actualizar cualquier campo en tiempo real, garantizando que los cambios se reflejen de inmediato para el vecino.
3.  **Eliminación**: El borrado es lógico (`is_active: false`), no físico, para mantener trazabilidad histórica de reseñas y reportes.

## Escenarios de Prueba (Gherkin)

### Escenario 1: Registro de negocio con datos incompletos
**Given** un comerciante autenticado en su panel
**When** intenta guardar un negocio sin el campo obligatorio `Nombre`
**Then** el sistema DEBE mostrar un error de validación "El nombre del negocio es requerido"
**And** NO DEBE crear ninguna entrada en la base de datos

### Escenario 2: Límite de carga de imágenes superado
**Given** un comerciante editando su perfil
**When** intenta subir 4 imágenes simultáneamente
**Then** el sistema DEBE rechazar la operación con un error "Se permite un máximo de 3 fotos"
**And** conservar solo las 3 primeras imágenes válidas

### Escenario 3: Actualización de horarios de atención
**Given** un negocio existente con horario "08:00 - 18:00"
**When** el comerciante cambia el cierre a las "20:00" y guarda los cambios
**Then** el vecino DEBE ver el nuevo horario actualizado de forma inmediata al consultar el perfil
