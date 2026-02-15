import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import http from 'http';
import { apiReference } from '@scalar/express-api-reference';
import { config } from './config';
import { logger } from './utils/logger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import routes from './routes';
import prisma from './config/database';
import { initRedis, isRedisConnected } from './config/redis';
import { createRateLimiter } from './middlewares/rateLimit.middleware';
import { wsService } from './services/websocket.service';
import { swaggerSpec } from './config/swagger';

const app: Application = express();
const server = http.createServer(app);

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

app.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

app.use(
  '/docs',
  apiReference({
    spec: {
      content: swaggerSpec,
    },
    theme: 'purple',
  })
);

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
      websocket: 'ok',
    },
  });
});

app.use('/api/v1', routes);

const start = async () => {
  try {
    initRedis();

    await prisma.$connect();
    logger.info('Database connected');

    wsService.init(server);

    const testRateLimit = createRateLimiter({
      windowMs: 60 * 1000,
      max: 3,
      keyPrefix: 'rl:test',
      message: '测试接口限流：1分钟最多3次',
    });

    app.get('/api/v1/test/rate-limit', testRateLimit, (_req, res) => {
      res.json({ code: 0, message: 'success', data: { timestamp: new Date().toISOString() } });
    });

    app.get('/api/v1/ws/online-users', (_req, res) => {
      res.json({ code: 0, message: 'success', data: { users: wsService.getOnlineUsers() } });
    });

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Docs: http://localhost:${config.port}/docs`);
      logger.info(`WebSocket endpoint: ws://localhost:${config.port}/ws`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

export { wsService };
export default app;
