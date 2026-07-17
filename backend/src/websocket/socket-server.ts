import { Server as HttpServer } from 'http';
import { Message } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Server as SocketServer, Socket } from 'socket.io';
import { z } from 'zod';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface SocketData {
  userId: string;
}

interface JoinChatPayload {
  chatId: string;
}

interface SendMessagePayload extends JoinChatPayload {
  content: string;
}

interface PresenceEvent {
  chatId: string;
  userId: string;
  timestamp: string;
}

interface ServerToClientEvents {
  'user:joined': (event: PresenceEvent) => void;
  'user:left': (event: PresenceEvent) => void;
  'message:new': (message: Message) => void;
}

type EventResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

type Acknowledge<T = undefined> = (result: EventResult<T>) => void;

interface ClientToServerEvents {
  'join:chat': (payload: JoinChatPayload, acknowledge?: Acknowledge) => void;
  'leave:chat': (payload: JoinChatPayload, acknowledge?: Acknowledge) => void;
  'send:message': (payload: SendMessagePayload, acknowledge?: Acknowledge<Message>) => void;
}

type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
type ChatSocketServer = SocketServer<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

const chatPayloadSchema = z.object({ chatId: z.string().uuid() }).strict();
const messagePayloadSchema = chatPayloadSchema
  .extend({ content: z.string().trim().min(1).max(10_000) })
  .strict();

const roomForChat = (chatId: string): string => `chat:${chatId}`;

function fail<T>(acknowledge: Acknowledge<T> | undefined, code: string, message: string): void {
  acknowledge?.({ success: false, error: { code, message } });
}

async function isChatMember(chatId: string, userId: string): Promise<boolean> {
  return Boolean(
    await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } },
      select: { userId: true },
    }),
  );
}

function registerChatEvents(io: ChatSocketServer, socket: ChatSocket): void {
  const userId = socket.data.userId;

  socket.on('join:chat', async (input, acknowledge) => {
    const parsed = chatPayloadSchema.safeParse(input);
    if (!parsed.success) {
      fail(acknowledge, 'INVALID_PAYLOAD', 'chatId must be a valid UUID');
      return;
    }

    const { chatId } = parsed.data;
    try {
      if (!(await isChatMember(chatId, userId))) {
        fail(acknowledge, 'CHAT_ACCESS_DENIED', 'You are not a member of this chat');
        return;
      }

      const room = roomForChat(chatId);
      await socket.join(room);
      const event = { chatId, userId, timestamp: new Date().toISOString() };
      socket.to(room).emit('user:joined', event);
      acknowledge?.({ success: true, data: undefined });
      logger.info('socket joined chat', { chatId, userId });
    } catch (error: unknown) {
      logger.error('socket join failed', { chatId, userId, error });
      fail(acknowledge, 'INTERNAL_ERROR', 'Could not join the chat');
    }
  });

  socket.on('send:message', async (input, acknowledge) => {
    const parsed = messagePayloadSchema.safeParse(input);
    if (!parsed.success) {
      fail(acknowledge, 'INVALID_PAYLOAD', 'chatId and non-empty content are required');
      return;
    }

    const { chatId, content } = parsed.data;
    const room = roomForChat(chatId);
    try {
      if (!socket.rooms.has(room) || !(await isChatMember(chatId, userId))) {
        fail(acknowledge, 'CHAT_ACCESS_DENIED', 'Join the chat before sending messages');
        return;
      }

      const message = await prisma.message.create({
        data: { chatId, authorId: userId, authorType: 'user', content },
      });
      io.to(room).emit('message:new', message);
      acknowledge?.({ success: true, data: message });
    } catch (error: unknown) {
      logger.error('socket message failed', { chatId, userId, error });
      fail(acknowledge, 'INTERNAL_ERROR', 'Could not send the message');
    }
  });

  socket.on('leave:chat', async (input, acknowledge) => {
    const parsed = chatPayloadSchema.safeParse(input);
    if (!parsed.success) {
      fail(acknowledge, 'INVALID_PAYLOAD', 'chatId must be a valid UUID');
      return;
    }

    const { chatId } = parsed.data;
    const room = roomForChat(chatId);
    if (socket.rooms.has(room)) {
      await socket.leave(room);
      io.to(room).emit('user:left', { chatId, userId, timestamp: new Date().toISOString() });
      logger.info('socket left chat', { chatId, userId });
    }
    acknowledge?.({ success: true, data: undefined });
  });
}

export function createSocketServer(httpServer: HttpServer): ChatSocketServer {
  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents, object, SocketData>(
    httpServer,
    {
      cors: { origin: true, credentials: true },
      connectionStateRecovery: { maxDisconnectionDuration: 2 * 60_000 },
    },
  );

  io.use((socket, next) => {
    const authorization = socket.handshake.headers.authorization;
    const bearerToken = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    const authToken = socket.handshake.auth?.token;
    const token = typeof authToken === 'string' ? authToken : bearerToken;

    if (!token) {
      next(new Error('Missing auth token'));
      return;
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
      if (typeof decoded === 'string' || typeof decoded.userId !== 'string' || !decoded.userId) {
        next(new Error('Invalid auth token'));
        return;
      }
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid or expired auth token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('socket connected', { socketId: socket.id, userId: socket.data.userId });
    registerChatEvents(io, socket);
    socket.on('disconnecting', () => {
      const timestamp = new Date().toISOString();
      for (const room of socket.rooms) {
        if (!room.startsWith('chat:')) continue;
        const chatId = room.slice('chat:'.length);
        socket.to(room).emit('user:left', { chatId, userId: socket.data.userId, timestamp });
      }
    });
    socket.on('disconnect', (reason) => {
      logger.info('socket disconnected', { socketId: socket.id, userId: socket.data.userId, reason });
    });
  });

  return io;
}
