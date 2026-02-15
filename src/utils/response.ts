import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationData<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const success = <T>(res: Response, data?: T, message = 'success'): Response => {
  return res.status(200).json({
    code: 0,
    message,
    data,
  });
};

export const created = <T>(res: Response, data?: T, message = '创建成功'): Response => {
  return res.status(201).json({
    code: 0,
    message,
    data,
  });
};

export const paginated = <T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number
): Response => {
  return res.status(200).json({
    code: 0,
    message: 'success',
    data: {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  });
};

export const error = (
  res: Response,
  code: number,
  message: string,
  statusCode = 400,
  errors?: Array<{ field: string; message: string }>
): Response => {
  return res.status(statusCode).json({
    code,
    message,
    errors,
  });
};

export const ErrorCode = {
  SUCCESS: 0,
  BAD_REQUEST: 1000,
  PARAM_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  ALREADY_EXISTS: 1005,
  TOO_MANY_REQUESTS: 1006,
  SERVER_ERROR: 5000,
} as const;
