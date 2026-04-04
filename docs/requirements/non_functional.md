# Requerimientos No Funcionales (Non-Functional Requirements)

Este documento detalla las restricciones y calidades técnicas del sistema BarrioConecta.

## Resumen de Calidades

| ID | Categoría | Descripción |
|---|---|---|
| **RNF-01** | Seguridad | Cifrado de contraseñas con bcrypt (10 rondas), uso de tokens JWT y validaciones anti-XSS y Inyecciones SQL/NoSQL. |
| **RNF-02** | Rendimiento | Consultas de búsqueda menores a **1.5 segundos** bajo carga de hasta 100 usuarios concurrentes. |
| **RNF-03** | Disponibilidad | Garantizar un **99% de Uptime** en el entorno de producción (máx. 3.65h de inactividad anual). |
| **RNF-04** | Usabilidad | Interfaz responsiva adaptada a dispositivos móviles con principios Mobile-First. |
| **RNF-05** | Escalabilidad | Arquitectura desacoplada preparada para el escalado horizontal del backend (Node.js). |
| **RNF-06** | Mantenibilidad | Uso de ESLint para consistencia, **cobertura de tests unitarios (>= 70%)** y documentación JSDoc. |
| **RNF-07** | Portabilidad | Compatibilidad verificada en Google Chrome, Safari, Mozilla Firefox y Microsoft Edge. |

## Estándares Técnicos
- El código DEBE seguir las guías de estilo de **Airbnb** (ESLint).
- La cobertura de pruebas se medirá mediante herramientas como `c8` o `istanbul/nyc`.
- La arquitectura DEBE respetar el desacoplo absoluto entre Frontend y Backend.
