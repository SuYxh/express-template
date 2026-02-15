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

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
    },
  });
});

app.use('/api/v1', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

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
