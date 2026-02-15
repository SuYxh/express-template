import { Router, type Router as RouterType } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginRateLimit, registerRateLimit } from '../middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

const router: RouterType = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: 注册成功
 *       400:
 *         description: 参数错误
 *       409:
 *         description: 邮箱已存在
 */
router.post(
  '/register',
  registerRateLimit,
  validateBody(registerSchema),
  authController.register.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: 邮箱或密码错误
 */
router.post(
  '/login',
  loginRateLimit,
  validateBody(loginSchema),
  authController.login.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: 刷新 Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: 刷新成功
 *       401:
 *         description: 无效的 refreshToken
 */
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refresh.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 退出登录
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出成功
 *       401:
 *         description: 未授权
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

export default router;
