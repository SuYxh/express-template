import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, '角色名称不能为空').max(50, '角色名称最多50字符'),
  code: z
    .string()
    .min(1, '角色编码不能为空')
    .max(50, '角色编码最多50字符')
    .regex(/^[a-z_]+$/, '角色编码只能包含小写字母和下划线'),
  description: z.string().max(200, '描述最多200字符').optional(),
  permissionIds: z.array(z.number()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  permissionIds: z.array(z.number()).optional(),
});

export const assignRoleSchema = z.object({
  roleIds: z.array(z.number()),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
