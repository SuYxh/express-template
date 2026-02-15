import { Router, type Router as RouterType } from 'express';
import { chatController } from '../controllers/chat.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chatSchema } from '../validators/chat.validator';

const router: RouterType = Router();

/**
 * @openapi
 * /api/v1/chat:
 *   post:
 *     tags: [Chat]
 *     summary: AI 对话
 *     description: 发送消息给 AI，返回完整回复
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: 对话成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       401:
 *         description: 未授权
 */
router.post(
  '/',
  authMiddleware,
  validateBody(chatSchema),
  chatController.chat.bind(chatController)
);

/**
 * @openapi
 * /api/v1/chat/stream:
 *   post:
 *     tags: [Chat]
 *     summary: AI 流式对话
 *     description: 以 SSE 流式返回回复
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: SSE 流式响应
 *         content:
 *           text/event-stream:
 *             example: |
 *               data: {"content":"你"}
 *               data: {"content":"好"}
 *               data: [DONE]
 *       401:
 *         description: 未授权
 */
router.post(
  '/stream',
  authMiddleware,
  validateBody(chatSchema),
  chatController.chatStream.bind(chatController)
);

export default router;
