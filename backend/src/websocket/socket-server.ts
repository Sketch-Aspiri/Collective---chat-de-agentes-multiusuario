import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
}

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string') {
      next(new Error('Missing auth token'));
      return;
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid auth token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('socket connected', { userId: socket.data.userId });

    socket.on('chat:join', (chatId: string) => {
      socket.join(chatId);
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on('disconnect', () => {
      logger.info('socket disconnected', { userId: socket.data.userId });
    });
  });

  return io;
}
