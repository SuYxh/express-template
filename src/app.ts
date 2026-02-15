import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import routes from './routes';
import prisma from './config/database';
import { initRedis, isRedisConnected } from './config/redis';
import { createRateLimiter } from './middlewares/rateLimit.middleware';

const app: Application = express();

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(compression({
  filter: (req, res) => {
    if (req.headers.accept === 'text/event-stream') {
      return false;
    }
    return compression.filter(req, res);
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  res.status(dbStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: isRedisConnected() ? 'ok' : 'disconnected',
    },
  });
});

app.use('/api/v1', routes);

const start = async () => {
  try {
    initRedis();

    await prisma.$connect();
    logger.info('Database connected');

    const testRateLimit = createRateLimiter({
      windowMs: 60 * 1000,
      max: 3,
      keyPrefix: 'rl:test',
      message: '测试接口限流：1分钟最多3次',
    });

    app.get('/api/v1/test/rate-limit', testRateLimit, (_req, res) => {
      res.json({ code: 0, message: 'success', data: { timestamp: new Date().toISOString() } });
    });

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

export default app;
