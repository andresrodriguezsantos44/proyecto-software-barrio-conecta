import { Router, type Router as RouterType } from 'express';
import { getCategories } from './controller';

const router: RouterType = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Listar todas las categorías
 *     responses:
 *       200:
 *         description: Catálogo de categorías.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Category' } }
 */
router.get('/', getCategories);

export const categoryRoutes: RouterType = router;