import { Router, type Router as RouterType } from 'express';
import authRoutes from './auth.routes';
import uploadRoutes from './upload.routes';

const router: RouterType = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

export default router;
