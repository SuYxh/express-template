import { Request, Response, NextFunction } from 'express';
import { error, ErrorCode } from '../utils/response';
import type { PermissionCode } from '../config/permissions';
import type { TokenPayload } from '../utils/token';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const requirePermission = (...permissions: PermissionCode[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];

    const hasPermission = permissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return error(res, ErrorCode.FORBIDDEN, '无操作权限');
    }

    next();
  };
};

export const requireAllPermissions = (...permissions: PermissionCode[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];

    const hasAllPermissions = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return error(res, ErrorCode.FORBIDDEN, '无操作权限');
    }

    next();
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];

    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return error(res, ErrorCode.FORBIDDEN, '无操作权限');
    }

    next();
  };
};
