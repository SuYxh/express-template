import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { success, error, ErrorCode } from '../utils/response';
import { config } from '../config';

export class UploadController {
  async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return error(res, ErrorCode.PARAM_ERROR, '请选择要上传的文件', 400);
      }

      const fileUrl = `${config.serverUrl}/uploads/${req.file.filename}`;

      return success(res, {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      }, '上传成功');
    } catch (err) {
      next(err);
    }
  }

  async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return error(res, ErrorCode.PARAM_ERROR, '请选择要上传的文件', 400);
      }

      const files = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${config.serverUrl}/uploads/${file.filename}`,
      }));

      return success(res, { files }, '上传成功');
    } catch (err) {
      next(err);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;

      if (!filename) {
        return error(res, ErrorCode.PARAM_ERROR, '请提供文件名', 400);
      }

      const filePath = path.join(config.upload.uploadDir, filename);

      if (!fs.existsSync(filePath)) {
        return error(res, ErrorCode.NOT_FOUND, '文件不存在', 404);
      }

      fs.unlinkSync(filePath);

      return success(res, undefined, '删除成功');
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();
