# Propuesta de Alcance Inicial: BarrioConecta

## Resumen Ejecutivo
BarrioConecta es una plataforma web (Single Page Application) diseñada para revitalizar la economía local mediante la digitalización y centralización de la oferta de micro-negocios de barrio (panaderías, ferreterías, talleres, etc.). El sistema actúa como un directorio inteligente geolocalizado que conecta a comerciantes con sus vecinos más cercanos.

## Contexto del Problema
- **Brecha Digital**: Más del 70% de los pequeños comercios en Latinoamérica carecen de presencia en la red (CEPAL, 2022).
- **Fuga de Capital**: La falta de visibilidad empuja a los consumidores hacia grandes cadenas y plataformas internacionales, debilitando el tejido local.
- **Invisibilidad Local**: Si un servicio no aparece en una pantalla, para el consumidor moderno, no existe.

## Objetivos Estratégicos
1.  **Visibilidad**: Incrementar en un 40% la presencia digital de los negocios locales.
2.  **Eficiencia**: Reducir el tiempo de búsqueda de servicios locales a menos de 2 minutos.
3.  **Confianza**: Construir reputación digital mediante reseñas verificadas por la comunidad.
4.  **Escalabilidad**: Crear una arquitectura replicable para otros barrios o municipios.

## Alance Funcional (MVP)
- **Capa de Usuarios**: Registro/Login para Comerciantes y Administradores. Navegación anónima para Vecinos.
- **Capa de Negocios**: Gestión completa (CRUD) de perfiles comerciales con coordenadas GPS y material gráfico.
- **Motor de Búsqueda**: Filtros combinados por categoría y radio de acción (500m - 2km).
- **Sistema de Reputación**: Valoración con estrellas y comentarios para generar confianza comunitaria.
- **Panel de Control**: Herramientas de moderación para asegurar la integridad de la información.

## Exclusiones del Proyecto
- Pasarelas de pago (Transacciones monetarias directas).
- Módulos de logística o delivery propios.
- Aplicaciones móviles nativas (Se prioriza Web SPA Responsiva).
- Chats en tiempo real (WebSockets).

## Justificación Tecnológica
El uso de **Vue.js 3, Node.js y MongoDB Atlas** permite una solución de alto rendimiento, bajo costo de mantenimiento y optimizada para búsquedas geoespaciales, asegurando tiempos de respuesta menores a 1.5s.
