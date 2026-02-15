import { Router, type Router as RouterType } from 'express';
import { chatController } from '../controllers/chat.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chatSchema } from '../validators/chat.validator';

const router: RouterType = Router();

router.post(
  '/',
  authMiddleware,
  validateBody(chatSchema),
  chatController.chat.bind(chatController)
);

router.post(
  '/stream',
  authMiddleware,
  validateBody(chatSchema),
  chatController.chatStream.bind(chatController)
);

export default router;
