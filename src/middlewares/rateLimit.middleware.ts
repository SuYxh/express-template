import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../config/redis';
import { error, ErrorCode } from '../utils/response';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, keyPrefix = 'rate' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedis();
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${keyPrefix}:${ip}:${req.path}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        return error(res, ErrorCode.TOO_MANY_REQUESTS, '请求过于频繁，请稍后再试', 429);
      }

      next();
    } catch {
      next();
    }
  };
};

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'login',
});

export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyPrefix: 'register',
});

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyPrefix: 'general',
});
