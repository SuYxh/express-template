import { z } from 'zod';

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1, '消息内容不能为空'),
    })
  ).min(1, '消息列表不能为空'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  systemPrompt: z.string().optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
