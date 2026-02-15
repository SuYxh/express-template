import { Router, type Router as RouterType } from 'express';
import authRoutes from './auth.routes';
import uploadRoutes from './upload.routes';
import chatRoutes from './chat.routes';

const router: RouterType = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);

export default router;
