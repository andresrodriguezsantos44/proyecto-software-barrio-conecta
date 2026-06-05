import { Router, type Router as RouterType } from 'express';
import { createReviewHandler, getBusinessReviews, replyToReviewHandler } from './controller';
import { authenticateJWT, requireRole } from '../auth/middleware';

const router: RouterType = Router();

/**
 * @openapi
 * /reviews/{businessId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Listar reseñas de un negocio (más nuevas primero)
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de reseñas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Review' } }
 *       404: { description: 'Negocio no encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.get('/:businessId', getBusinessReviews);

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear una reseña (usuario autenticado)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReviewRequest' }
 *     responses:
 *       201:
 *         description: Reseña creada; recalcula avgRating (RV-02).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400: { description: 'Datos inválidos o negocio inactivo.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'Negocio no encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.post('/', authenticateJWT, createReviewHandler);

/**
 * @openapi
 * /reviews/{reviewId}/reply:
 *   put:
 *     tags: [Reviews]
 *     summary: Responder una reseña (solo el dueño del negocio, RV-03)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReplyRequest' }
 *     responses:
 *       200:
 *         description: Respuesta agregada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400: { description: 'La reseña ya tiene respuesta o datos inválidos.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Solo el dueño del negocio puede responder.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'Reseña no encontrada.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.put('/:reviewId/reply', authenticateJWT, requireRole('merchant'), replyToReviewHandler);

export const reviewRoutes: RouterType = router;