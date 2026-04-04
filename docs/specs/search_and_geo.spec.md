# Especificación de Búsqueda y Geolocalización (Search)

Este documento define la funcionalidad central de BarrioConecta: conectar al vecino con su entorno local de forma inteligente.

## Estrategia de Localización
- **Detección Automática**: El sistema DEBE solicitar permisos de geolocalización al usuario al cargar la interfaz de búsqueda.
- **Coordenadas**: Se DEBEN capturar latitud (`lat`) y longitud (`lng`) con una precisión de al menos 4 decimales.
- **Fallback**: Si el usuario deniega el permiso, el sistema DEBE permitir el ingreso manual de un punto de referencia en el mapa o mostrar resultados generales (ej. centro del barrio).

## Lógica del Motor de Búsqueda
- **Criterios de Filtrado Combinatorios**:
  - `Categoría`: Filtro único (excluyente) por ID de categoría.
  - `Distancia`: Filtro de radio de acción con las siguientes opciones:
    - 500 metros (A pie - Muy cercano).
    - 1 kilómetro (A pie - Cercano).
    - 2 kilómetros (Radio máximo permitido en el MVP).
- **Algoritmo de Ordenamiento**: Por defecto, los resultados DEBEN aparecer ordenados por **proximidad geográfica** (del más cercano al más lejano).

## Requerimientos de Rendimiento (RNF-02)
- El motor de búsqueda DEBE responder a cualquier consulta combinatoria en un tiempo inferior a **1.5 segundos**.
- Se DEBEN implementar índices geoespaciales (`2dsphere`) en la colección `businesses` para optimizar la consulta.

## Escenarios de Prueba (Gherkin)

### Escenario 1: Búsqueda por categoría y radio
**Given** un usuario ubicado en las coordenadas `(4.60, -74.08)`
**When** selecciona la categoría "Gastronomía" y un radio de "1 km"
**Then** el sistema DEBE retornar solo los negocios de comida cuya distancia sea <= 1000 metros del punto `(4.60, -74.08)`
**And** mostrarlos ordenados por cercanía.

### Escenario 2: Resultados fuera del radio máximo
**Given** un negocio a 3 kilómetros de la ubicación del usuario
**When** el usuario busca con el radio máximo de "2 km"
**Then** el sistema DEBE omitir dicho negocio de la lista de resultados.

### Escenario 3: Interfaz de búsqueda sin permisos de GPS
**Given** que el usuario bloquea el acceso a su ubicación en el navegador
**When** intenta buscar sin ingresar una ubicación manual
**Then** el sistema DEBE mostrar un mensaje informativo: "Por favor, permite el acceso a tu ubicación o selecciona un punto en el mapa para encontrar negocios cercanos."
