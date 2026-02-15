import { Request, Response, NextFunction } from 'express';
import { llmService } from '../services/llm.service';
import { success, error, ErrorCode } from '../utils/response';
import { ChatInput } from '../validators/chat.validator';

export class ChatController {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, model, temperature, maxTokens, systemPrompt }: ChatInput = req.body;

      const reply = await llmService.chat(messages, {
        model,
        temperature,
        maxTokens,
        systemPrompt,
      });

      return success(res, { reply }, 'success');
    } catch (err) {
      next(err);
    }
  }

  async chatStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, model, temperature, maxTokens, systemPrompt }: ChatInput = req.body;

      await llmService.chatStream(messages, res, {
        model,
        temperature,
        maxTokens,
        systemPrompt,
      });
    } catch (err) {
      if (!res.headersSent) {
        return error(res, ErrorCode.SERVER_ERROR, '请求失败', 500);
      }
      res.end();
    }
  }
}

export const chatController = new ChatController();
