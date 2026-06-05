import { Router, type Router as RouterType } from 'express';
import {
  getReportsHandler,
  createReportHandler,
  updateReportHandler,
  deactivateBusinessHandler,
  getStatsHandler,
} from './controller';
import { authenticateJWT, requireRole } from '../auth/middleware';

const router: RouterType = Router();

/**
 * Admin routes — all require admin role (AD-04).
 * - GET    /admin/reports            — list reports (optional ?status= filter)
 * - POST   /admin/reports            — create a report (any authenticated user)
 * - PATCH  /admin/reports/:reportId  — update report status
 * - PATCH  /admin/business/:id/deactivate — deactivate a business
 * - GET    /admin/stats              — dashboard stats
 */

/**
 * @openapi
 * /admin/reports:
 *   post:
 *     tags: [Admin]
 *     summary: Crear un reporte (cualquier usuario autenticado)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReportRequest' }
 *     responses:
 *       201:
 *         description: Reporte creado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Report' }
 *       400: { description: 'Datos inválidos.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'El objetivo reportado no existe.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
// Report creation is available to any authenticated user
router.post('/reports', authenticateJWT, createReportHandler);

// All other admin routes require admin role
router.use(authenticateJWT, requireRole('admin'));

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Listar reportes (solo admin, AD-01)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [NEW, IN_REVIEW, RESOLVED] }
 *         description: Filtrar por estado (opcional).
 *     responses:
 *       200:
 *         description: Lista de reportes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Report' } }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Requiere rol admin (AD-04).', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.get('/reports', getReportsHandler);

/**
 * @openapi
 * /admin/reports/{reportId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Actualizar el estado de un reporte (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateReportRequest' }
 *     responses:
 *       200:
 *         description: Reporte actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Report' }
 *       400: { description: 'Estado inválido.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Requiere rol admin.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'Reporte no encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.patch('/reports/:reportId', updateReportHandler);

/**
 * @openapi
 * /admin/business/{id}/deactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Desactivar un negocio por moderación (solo admin, AD-02)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Negocio desactivado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     isActive: { type: boolean, example: false }
 *       403: { description: 'Requiere rol admin.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'Negocio no encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.patch('/business/:id/deactivate', deactivateBusinessHandler);

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Estadísticas del panel (solo admin, AD-03)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Métricas agregadas del sistema.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/AdminStats' }
 *       403: { description: 'Requiere rol admin.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.get('/stats', getStatsHandler);

export const adminRoutes: RouterType = router;