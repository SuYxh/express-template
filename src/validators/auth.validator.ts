import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(20, '密码最多20位')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '密码必须包含字母和数字'),
  confirmPassword: z.string(),
  nickname: z.string().min(2, '昵称至少2位').max(20, '昵称最多20位').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
  rememberMe: z.boolean().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '请提供 refreshToken'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
