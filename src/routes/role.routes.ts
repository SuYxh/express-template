import { Router, type Router as RouterType } from 'express';
import { roleController } from '../controllers/role.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { createRoleSchema, updateRoleSchema, assignRoleSchema } from '../validators/role.validator';
import { PERMISSIONS } from '../config/permissions';

const router: RouterType = Router();

/**
 * @openapi
 * /api/v1/roles:
 *   get:
 *     tags: [Role]
 *     summary: 获取角色列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get(
  '/',
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE_READ),
  roleController.findAll.bind(roleController)
);

/**
 * @openapi
 * /api/v1/roles/permissions:
 *   get:
 *     tags: [Role]
 *     summary: 获取权限列表（按模块分组）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get(
  '/permissions',
  authMiddleware,
  requirePermission(PERMISSIONS.PERMISSION_READ),
  roleController.getPermissions.bind(roleController)
);

/**
 * @openapi
 * /api/v1/roles/{id}:
 *   get:
 *     tags: [Role]
 *     summary: 获取角色详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE_READ),
  roleController.findById.bind(roleController)
);

/**
 * @openapi
 * /api/v1/roles:
 *   post:
 *     tags: [Role]
 *     summary: 创建角色
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 编辑员
 *               code:
 *                 type: string
 *                 example: editor
 *               description:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 */
router.post(
  '/',
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE_CREATE),
  validateBody(createRoleSchema),
  roleController.create.bind(roleController)
);

/**
 * @openapi
 * /api/v1/roles/{id}:
 *   put:
 *     tags: [Role]
 *     summary: 更新角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE_UPDATE),
  validateBody(updateRoleSchema),
  roleController.update.bind(roleController)
);

/**
 * @openapi
 * /api/v1/roles/{id}:
 *   delete:
 *     tags: [Role]
 *     summary: 删除角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE_DELETE),
  roleController.delete.bind(roleController)
);

/**
 * @openapi
 * /api/v1/roles/assign/{userId}:
 *   post:
 *     tags: [Role]
 *     summary: 给用户分配角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleIds]
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       200:
 *         description: 分配成功
 */
router.post(
  '/assign/:userId',
  authMiddleware,
  requirePermission(PERMISSIONS.PERMISSION_ASSIGN),
  validateBody(assignRoleSchema),
  roleController.assignToUser.bind(roleController)
);

export default router;
