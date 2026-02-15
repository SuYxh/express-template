import { Router, type Router as RouterType } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginRateLimit, registerRateLimit } from '../middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

const router: RouterType = Router();

router.post(
  '/register',
  registerRateLimit,
  validateBody(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  loginRateLimit,
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refresh.bind(authController)
);

router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

export default router;
