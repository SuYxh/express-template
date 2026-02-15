import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { success } from '../utils/response';
import { verifyRefreshToken } from '../utils/token';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterInput = req.body;
      const result = await authService.register(data);
      return success(res, result, '注册成功');
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginInput = req.body;
      const result = await authService.login(data);
      return success(res, result, '登录成功');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      const payload = verifyRefreshToken(refreshToken);
      const tokens = await authService.refreshToken(payload.userId);
      return success(res, tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return success(res, undefined, '登出成功');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
