import { Router, type Router as RouterType } from 'express';
import { register, login } from './controller';

const router: RouterType = Router();

/**
 * POST /auth/register — Create a new account
 * POST /auth/login    — Authenticate and get JWT
 */
router.post('/register', register);
router.post('/login', login);

export const authRoutes: RouterType = router;