import prisma from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokens, TokenPayload } from '../utils/token';
import { AppError } from '../middlewares/error.middleware';
import { ErrorCode } from '../utils/response';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('该邮箱已被注册', 409, ErrorCode.ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nickname: data.nickname,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    return {
      user,
      ...tokens,
    };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('账号或密码错误', 401, ErrorCode.UNAUTHORIZED);
    }

    if (user.status === 'DISABLED') {
      throw new AppError('账号已被禁用', 403, ErrorCode.FORBIDDEN);
    }

    const isPasswordValid = await verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('账号或密码错误', 401, ErrorCode.UNAUTHORIZED);
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError('用户不存在', 404, ErrorCode.NOT_FOUND);
    }

    if (user.status === 'DISABLED') {
      throw new AppError('账号已被禁用', 403, ErrorCode.FORBIDDEN);
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return generateTokens(payload);
  }
}

export const authService = new AuthService();
