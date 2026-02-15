import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyAccessToken } from '../utils/token';
import { logger } from '../utils/logger';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

interface WsMessage {
  type: string;
  data?: unknown;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<number, Set<AuthenticatedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Token required');
        return;
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        ws.close(4002, 'Invalid token');
        return;
      }

      ws.userId = payload.userId;
      ws.isAlive = true;

      this.addClient(payload.userId, ws);
      logger.info(`WebSocket connected: user ${payload.userId}`);

      this.send(ws, { type: 'connected', data: { userId: payload.userId } });

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const message: WsMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch {
          this.send(ws, { type: 'error', data: { message: 'Invalid message format' } });
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          this.removeClient(ws.userId, ws);
          logger.info(`WebSocket disconnected: user ${ws.userId}`);
        }
      });

      ws.on('error', (err) => {
        logger.error(`WebSocket error: ${err.message}`);
      });
    });

    this.startHeartbeat();
    logger.info('WebSocket server initialized on /ws');
  }

  private addClient(userId: number, ws: AuthenticatedWebSocket) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);
  }

  private removeClient(userId: number, ws: AuthenticatedWebSocket) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WsMessage) {
    switch (message.type) {
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;
      default:
        this.send(ws, { type: 'echo', data: message });
    }
  }

  private send(ws: WebSocket, message: WsMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss?.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  sendToUser(userId: number, message: WsMessage) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((ws) => {
        this.send(ws, message);
      });
      return true;
    }
    return false;
  }

  broadcast(message: WsMessage, excludeUserId?: number) {
    this.clients.forEach((userClients, userId) => {
      if (excludeUserId !== undefined && userId === excludeUserId) return;
      userClients.forEach((ws) => {
        this.send(ws, message);
      });
    });
  }

  getOnlineUsers(): number[] {
    return Array.from(this.clients.keys());
  }

  isUserOnline(userId: number): boolean {
    return this.clients.has(userId);
  }

  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss?.close();
  }
}

export const wsService = new WebSocketService();
