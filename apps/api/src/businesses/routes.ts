import { Router, type Router as RouterType } from 'express';
import {
  createBusinessHandler,
  getMyBusinesses,
  getBusiness,
  updateBusinessHandler,
  deactivateBusinessHandler,
} from './controller';
import { authenticateJWT, requireRole } from '../auth/middleware';

const router: RouterType = Router();

/**
 * @openapi
 * /businesses:
 *   post:
 *     tags: [Businesses]
 *     summary: Crear un negocio (solo comerciantes)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBusinessRequest' }
 *     responses:
 *       201:
 *         description: Negocio creado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Business' }
 *       400: { description: 'Datos inválidos.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Rol insuficiente (requiere merchant).', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       409: { description: 'El comerciante ya tiene un negocio activo (BM-02).', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.post('/', authenticateJWT, requireRole('merchant'), createBusinessHandler);

/**
 * @openapi
 * /businesses/my:
 *   get:
 *     tags: [Businesses]
 *     summary: Listar los negocios del comerciante autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de negocios del comerciante.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Business' } }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Rol insuficiente (requiere merchant).', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.get('/my', authenticateJWT, requireRole('merchant'), getMyBusinesses);

/**
 * @openapi
 * /businesses/{id}:
 *   get:
 *     tags: [Businesses]
 *     summary: Obtener un negocio activo por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Negocio encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Business' }
 *       404: { description: 'Negocio no encontrado o inactivo.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.get('/:id', getBusiness);

/**
 * @openapi
 * /businesses/{id}:
 *   put:
 *     tags: [Businesses]
 *     summary: Actualizar un negocio (dueño o admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBusinessRequest' }
 *     responses:
 *       200:
 *         description: Negocio actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Business' }
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Solo el dueño o un admin pueden actualizar.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'Negocio no encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.put('/:id', authenticateJWT, updateBusinessHandler);

/**
 * @openapi
 * /businesses/{id}:
 *   delete:
 *     tags: [Businesses]
 *     summary: Desactivar un negocio (borrado lógico, BM-03)
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
 *       401: { description: 'No autenticado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       403: { description: 'Solo el dueño o un admin pueden desactivar.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 *       404: { description: 'Negocio no encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.delete('/:id', authenticateJWT, deactivateBusinessHandler);

export const businessRoutes: RouterType = router;