import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { ErrorCode } from '../utils/response';

export class RoleService {
  async findAll() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                code: true,
                name: true,
                module: true,
              },
            },
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('角色不存在', 404, ErrorCode.NOT_FOUND);
    }

    return role;
  }

  async create(data: { name: string; code: string; description?: string; permissionIds?: number[] }) {
    const existing = await prisma.role.findFirst({
      where: {
        OR: [{ code: data.code }, { name: data.name }],
      },
    });

    if (existing) {
      throw new AppError('角色名称或编码已存在', 409, ErrorCode.ALREADY_EXISTS);
    }

    return prisma.role.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        permissions: data.permissionIds
          ? {
              create: data.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async update(id: number, data: { name?: string; description?: string; permissionIds?: number[] }) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new AppError('角色不存在', 404, ErrorCode.NOT_FOUND);
    }

    if (role.isSystem && data.name) {
      throw new AppError('系统角色不允许修改名称', 400, ErrorCode.BAD_REQUEST);
    }

    if (data.permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });
    }

    return prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? {
              create: data.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new AppError('角色不存在', 404, ErrorCode.NOT_FOUND);
    }

    if (role.isSystem) {
      throw new AppError('系统角色不允许删除', 400, ErrorCode.BAD_REQUEST);
    }

    if (role._count.users > 0) {
      throw new AppError('该角色下还有用户，无法删除', 400, ErrorCode.BAD_REQUEST);
    }

    await prisma.role.delete({
      where: { id },
    });
  }

  async assignToUser(userId: number, roleIds: number[]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('用户不存在', 404, ErrorCode.NOT_FOUND);
    }

    await prisma.userRole.deleteMany({
      where: { userId },
    });

    if (roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      });
    }

    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

export const roleService = new RoleService();
