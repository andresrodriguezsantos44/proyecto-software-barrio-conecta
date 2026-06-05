import { Router, type Router as RouterType } from 'express';
import { searchBusinesses } from './controller';

const router: RouterType = Router();

/**
 * @openapi
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Búsqueda geoespacial de negocios activos
 *     description: Ordena por proximidad (GS-02). Devuelve solo negocios activos dentro del radio.
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number, minimum: -90, maximum: 90 }
 *         example: 4.6097
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number, minimum: -180, maximum: 180 }
 *         example: -74.0817
 *       - in: query
 *         name: radius
 *         schema: { type: integer, enum: [500, 1000, 2000], default: 1000 }
 *         description: Radio en metros.
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *         description: Filtrar por categoría (opcional).
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 100 }
 *         description: Texto de búsqueda por nombre (opcional).
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     businesses: { type: array, items: { $ref: '#/components/schemas/Business' } }
 *                     message: { type: string }
 *       400: { description: 'Parámetros inválidos.', content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
router.get('/', searchBusinesses);

export const searchRoutes: RouterType = router;