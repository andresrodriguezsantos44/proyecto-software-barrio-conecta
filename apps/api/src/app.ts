import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { globalErrorHandler } from './shared/error';
import { connectDatabase } from './shared/db';
import { buildConfig } from './shared/config';
import { openapiSpec } from './shared/openapi';
import { authRoutes } from './auth/routes';
import { businessRoutes } from './businesses/routes';
import { searchRoutes } from './search/routes';
import { reviewRoutes } from './reviews/routes';
import { adminRoutes } from './admin/routes';
import { categoryRoutes } from './categories/routes';

const app: Express = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API docs (Swagger UI + spec JSON) ---
app.get('/api/docs.json', (_req, res) => {
  res.json(openapiSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  customSiteTitle: 'BarrioConecta API — Docs',
}));

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Estado del servicio
 *     responses:
 *       200:
 *         description: El servicio está operativo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 timestamp: { type: string, format: date-time }
 */
// --- Health check ---
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/businesses', businessRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);

// --- 404 fallback ---
app.use('/api/v1', (_req, res) => {
  res.status(404).json({ status: 'fail', message: 'Endpoint not found' });
});

// --- Global error handler ---
app.use(globalErrorHandler);

// --- Server bootstrap ---
const PORT = Number(process.env.PORT) || 3000;

async function start(): Promise<void> {
  // Validate config at startup (will throw if required env vars are missing)
  buildConfig();
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 BarrioConecta API running on port ${PORT}`);
  });
}

// Allow direct execution (bun run src/app.ts) and test import
if (import.meta.main) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { app };
export default app;