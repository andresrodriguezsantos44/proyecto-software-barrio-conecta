// ============================================================================
// OpenAPI / Swagger configuration
// Builds the spec from JSDoc @openapi annotations in the route files and
// exposes a Swagger UI. The shared component schemas (DTOs, envelopes) live
// here as the single source of truth referenced via $ref from each route.
// ============================================================================

import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'BarrioConecta API',
      version: '1.0.0',
      description:
        'API REST de BarrioConecta — directorio digital de economía local. ' +
        'Autenticación JWT (Bearer). Todas las rutas cuelgan de `/api/v1`.',
    },
    servers: [{ url: '/api/v1', description: 'Base path de la API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // --- Envelopes -----------------------------------------------------
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['fail', 'error'], example: 'fail' },
            message: { type: 'string', example: 'Business not found' },
          },
        },
        // --- Auth ----------------------------------------------------------
        UserRole: { type: 'string', enum: ['merchant', 'admin', 'neighbor'] },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'maria@barrio.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            name: { type: 'string', example: 'María Comerciante' },
            role: { $ref: '#/components/schemas/UserRole' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'maria@barrio.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiI...' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    role: { $ref: '#/components/schemas/UserRole' },
                  },
                },
              },
            },
          },
        },
        // --- Geo / schedule ------------------------------------------------
        GeoPoint: {
          type: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: { type: 'string', enum: ['Point'] },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2,
              example: [-74.0817, 4.6097],
              description: '[longitud, latitud] (orden GeoJSON)',
            },
          },
        },
        ScheduleDay: {
          type: 'object',
          required: ['open', 'close'],
          properties: {
            open: { type: 'string', example: '08:00' },
            close: { type: 'string', example: '18:00' },
          },
        },
        ScheduleWeek: {
          type: 'object',
          description: 'Horario por día (mon–sun).',
          properties: {
            mon: { $ref: '#/components/schemas/ScheduleDay' },
            tue: { $ref: '#/components/schemas/ScheduleDay' },
            wed: { $ref: '#/components/schemas/ScheduleDay' },
            thu: { $ref: '#/components/schemas/ScheduleDay' },
            fri: { $ref: '#/components/schemas/ScheduleDay' },
            sat: { $ref: '#/components/schemas/ScheduleDay' },
            sun: { $ref: '#/components/schemas/ScheduleDay' },
          },
        },
        // --- Business ------------------------------------------------------
        CreateBusinessRequest: {
          type: 'object',
          required: ['name', 'categoryId', 'location', 'schedule'],
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100, example: 'Panadería Doña María' },
            description: { type: 'string', maxLength: 500 },
            categoryId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            location: { $ref: '#/components/schemas/GeoPoint' },
            schedule: { $ref: '#/components/schemas/ScheduleWeek' },
            photos: { type: 'array', items: { type: 'string', format: 'uri' }, maxItems: 3 },
          },
        },
        Business: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            categoryId: { type: 'string' },
            ownerId: { type: 'string' },
            location: {
              type: 'object',
              properties: { lat: { type: 'number' }, lng: { type: 'number' } },
            },
            photos: { type: 'array', items: { type: 'string' } },
            schedule: { $ref: '#/components/schemas/ScheduleWeek' },
            isActive: { type: 'boolean' },
            avgRating: { type: 'number', example: 4.5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // --- Category ------------------------------------------------------
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Panadería' },
            icon: { type: 'string', example: '🥖' },
          },
        },
        // --- Review --------------------------------------------------------
        CreateReviewRequest: {
          type: 'object',
          required: ['businessId', 'rating'],
          properties: {
            businessId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', maxLength: 300 },
          },
        },
        ReplyRequest: {
          type: 'object',
          required: ['replyContent'],
          properties: {
            replyContent: { type: 'string', minLength: 1, maxLength: 300 },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            businessId: { type: 'string' },
            userId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            reply: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // --- Reports / admin ----------------------------------------------
        CreateReportRequest: {
          type: 'object',
          required: ['targetType', 'targetId', 'reason'],
          properties: {
            targetType: { type: 'string', enum: ['business', 'review'] },
            targetId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            reason: { type: 'string', enum: ['spam', 'false_info', 'inappropriate', 'other'] },
            description: { type: 'string', maxLength: 500 },
          },
        },
        UpdateReportRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['IN_REVIEW', 'RESOLVED'] },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            reporterId: { type: 'string' },
            targetType: { type: 'string', enum: ['business', 'review'] },
            targetId: { type: 'string' },
            reason: { type: 'string', enum: ['spam', 'false_info', 'inappropriate', 'other'] },
            description: { type: 'string' },
            status: { type: 'string', enum: ['NEW', 'IN_REVIEW', 'RESOLVED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AdminStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            usersByRole: {
              type: 'object',
              properties: {
                merchant: { type: 'integer' },
                admin: { type: 'integer' },
                neighbor: { type: 'integer' },
              },
            },
            totalBusinesses: {
              type: 'object',
              properties: { active: { type: 'integer' }, inactive: { type: 'integer' } },
            },
            totalReviews: { type: 'integer' },
            globalAvgRating: { type: 'number' },
            pendingReports: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registro y autenticación' },
      { name: 'Businesses', description: 'Gestión de negocios' },
      { name: 'Search', description: 'Búsqueda geoespacial' },
      { name: 'Reviews', description: 'Reseñas y respuestas' },
      { name: 'Admin', description: 'Moderación y estadísticas' },
      { name: 'Categories', description: 'Catálogo de categorías' },
      { name: 'Health', description: 'Estado del servicio' },
    ],
  },
  // Escanea las anotaciones @openapi en las rutas y el bootstrap.
  apis: ['./src/**/routes.ts', './src/app.ts'],
};

export const openapiSpec = swaggerJSDoc(options) as Record<string, unknown>;
