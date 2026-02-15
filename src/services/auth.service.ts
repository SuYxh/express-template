import prisma from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokens, TokenPayload } from '../utils/token';
import { AppError } from '../middlewares/error.middleware';
import { ErrorCode } from '../utils/response';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  private async getUserPermissions(userId: number) {
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return { roles: [], permissions: [] };
    }

    const roles = userWithRoles.roles.map((ur) => ur.role.code);
    const permissionSet = new Set<string>();

    userWithRoles.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissionSet.add(rp.permission.code);
      });
    });

    return {
      roles,
      permissions: Array.from(permissionSet),
    };
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('该邮箱已被注册', 409, ErrorCode.ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const defaultRole = await prisma.role.findUnique({
      where: { code: 'user' },
    });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nickname: data.nickname,
        roles: defaultRole
          ? {
              create: { roleId: defaultRole.id },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        createdAt: true,
      },
    });

    const { roles, permissions } = await this.getUserPermissions(user.id);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles,
      permissions,
    };

    const tokens = generateTokens(payload);

    return {
      user: {
        ...user,
        roles,
      },
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

    const { roles, permissions } = await this.getUserPermissions(user.id);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles,
      permissions,
    };

    const tokens = generateTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        roles,
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
        status: true,
      },
    });

    if (!user) {
      throw new AppError('用户不存在', 404, ErrorCode.NOT_FOUND);
    }

    if (user.status === 'DISABLED') {
      throw new AppError('账号已被禁用', 403, ErrorCode.FORBIDDEN);
    }

    const { roles, permissions } = await this.getUserPermissions(user.id);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles,
      permissions,
    };

    return generateTokens(payload);
  }
}

export const authService = new AuthService();
