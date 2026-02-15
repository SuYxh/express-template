import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/role.service';
import { permissionService } from '../services/permission.service';
import { success } from '../utils/response';

export class RoleController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.findAll();
      success(res, roles);
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const role = await roleService.findById(id);
      success(res, role);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.create(req.body);
      success(res, role, '创建成功');
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const role = await roleService.update(id, req.body);
      success(res, role, '更新成功');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await roleService.delete(id);
      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }

  async assignToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId);
      const { roleIds } = req.body;
      const user = await roleService.assignToUser(userId, roleIds);
      success(res, user, '分配成功');
    } catch (err) {
      next(err);
    }
  }

  async getPermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionService.findByModule();
      success(res, permissions);
    } catch (err) {
      next(err);
    }
  }
}

export const roleController = new RoleController();
