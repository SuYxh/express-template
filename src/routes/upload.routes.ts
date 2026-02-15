import { Router, type Router as RouterType } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { uploadImage, uploadFile } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: RouterType = Router();

router.post(
  '/image',
  authMiddleware,
  uploadImage.single('file'),
  uploadController.uploadSingle.bind(uploadController)
);

router.post(
  '/images',
  authMiddleware,
  uploadImage.array('files', 10),
  uploadController.uploadMultiple.bind(uploadController)
);

router.post(
  '/file',
  authMiddleware,
  uploadFile.single('file'),
  uploadController.uploadSingle.bind(uploadController)
);

router.post(
  '/files',
  authMiddleware,
  uploadFile.array('files', 10),
  uploadController.uploadMultiple.bind(uploadController)
);

router.delete(
  '/:filename',
  authMiddleware,
  uploadController.deleteFile.bind(uploadController)
);

export default router;
