import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

let redis: Redis | null = null;
let connected = false;

export const initRedis = (): Redis | null => {
  if (!config.redis.host) {
    logger.warn('Redis host not configured, using memory store');
    return null;
  }

  try {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis connection failed, using memory store');
          return null;
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      connected = true;
      logger.info('Redis connected');
    });

    redis.on('error', (err) => {
      connected = false;
      logger.error('Redis error:', err.message);
    });

    redis.on('close', () => {
      connected = false;
    });

    redis.connect().catch(() => {
      connected = false;
      logger.warn('Redis connection failed, using memory store');
    });

    return redis;
  } catch {
    logger.warn('Redis init failed, using memory store');
    return null;
  }
};

export const getRedis = (): Redis => {
  if (!redis) {
    redis = initRedis() as Redis;
  }
  return redis;
};

export const isRedisConnected = (): boolean => {
  return connected && redis !== null;
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    connected = false;
  }
};

export default getRedis;
