import { Router, type Router as RouterType } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { uploadImage, uploadFile } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: RouterType = Router();

/**
 * @openapi
 * /api/v1/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: 上传单张图片
 *     description: 支持 JPG、PNG、GIF、WebP，最大 5MB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 上传成功
 *       401:
 *         description: 未授权
 */
router.post(
  '/image',
  authMiddleware,
  uploadImage.single('file'),
  uploadController.uploadSingle.bind(uploadController)
);

/**
 * @openapi
 * /api/v1/upload/images:
 *   post:
 *     tags: [Upload]
 *     summary: 上传多张图片
 *     description: 最多 10 张，单张最大 5MB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 上传成功
 *       401:
 *         description: 未授权
 */
router.post(
  '/images',
  authMiddleware,
  uploadImage.array('files', 10),
  uploadController.uploadMultiple.bind(uploadController)
);

/**
 * @openapi
 * /api/v1/upload/file:
 *   post:
 *     tags: [Upload]
 *     summary: 上传单个文件
 *     description: 支持图片、PDF、Word、Excel 等，最大 10MB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 上传成功
 *       401:
 *         description: 未授权
 */
router.post(
  '/file',
  authMiddleware,
  uploadFile.single('file'),
  uploadController.uploadSingle.bind(uploadController)
);

/**
 * @openapi
 * /api/v1/upload/files:
 *   post:
 *     tags: [Upload]
 *     summary: 上传多个文件
 *     description: 最多 10 个，单个最大 10MB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 上传成功
 *       401:
 *         description: 未授权
 */
router.post(
  '/files',
  authMiddleware,
  uploadFile.array('files', 10),
  uploadController.uploadMultiple.bind(uploadController)
);

/**
 * @openapi
 * /api/v1/upload/{filename}:
 *   delete:
 *     tags: [Upload]
 *     summary: 删除文件
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 文件不存在
 */
router.delete(
  '/:filename',
  authMiddleware,
  uploadController.deleteFile.bind(uploadController)
);

export default router;
