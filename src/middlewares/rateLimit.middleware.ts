import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis, isRedisConnected } from '../config/redis';

const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}) => {
  const { windowMs, max, keyPrefix = 'rl', message = '请求过于频繁，请稍后再试' } = options;

  const baseOptions = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: 1006, message },
  };

  if (isRedisConnected()) {
    return rateLimit({
      ...baseOptions,
      store: new RedisStore({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sendCommand: (...args: string[]): Promise<any> => {
          const redis = getRedis();
          return redis.call(args[0], ...args.slice(1));
        },
        prefix: keyPrefix,
      }),
    });
  }

  return rateLimit(baseOptions);
};

export const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'rl:login',
  message: '登录尝试次数过多，请15分钟后再试',
});

export const registerRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyPrefix: 'rl:register',
  message: '注册次数过多，请1小时后再试',
});

export const generalRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyPrefix: 'rl:general',
});

export const testRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  keyPrefix: 'rl:test',
  message: '测试接口限流：1分钟最多3次',
});

export { createRateLimiter };
