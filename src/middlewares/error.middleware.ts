import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { error, ErrorCode } from '../utils/response';

export class AppError extends Error {
  statusCode: number;
  code: number;

  constructor(message: string, statusCode = 400, code: number = ErrorCode.PARAM_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return error(res, err.code, err.message, err.statusCode);
  }

  return error(res, ErrorCode.SERVER_ERROR, '服务器内部错误', 500);
};

export const notFoundMiddleware = (req: Request, res: Response) => {
  return error(res, ErrorCode.NOT_FOUND, `路由 ${req.originalUrl} 不存在`, 404);
};
