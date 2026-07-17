import http from 'http';
import jwt from 'jsonwebtoken';
import { AddressInfo } from 'net';
import { io as createClient, Socket as ClientSocket } from 'socket.io-client';
import { env } from '../../src/config/env';
import { prisma } from '../../src/config/database';
import { createSocketServer } from '../../src/websocket/socket-server';

jest.mock('../../src/config/database', () => ({
  prisma: {
    chatMember: { findUnique: jest.fn() },
    message: { create: jest.fn() },
  },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const chatId = '11111111-1111-4111-8111-111111111111';
const userId = 'user-1';
const token = jwt.sign({ userId }, env.jwtSecret, { algorithm: 'HS256', expiresIn: '5m' });
const findMember = prisma.chatMember.findUnique as jest.Mock;
const createMessage = prisma.message.create as jest.Mock;

function once<T>(socket: ClientSocket, event: string): Promise<T> {
  return new Promise((resolve) => socket.once(event, resolve));
}

describe('Socket.io chat events', () => {
  let httpServer: http.Server;
  let socketServer: ReturnType<typeof createSocketServer>;
  let url: string;
  const clients: ClientSocket[] = [];

  beforeEach((done) => {
    jest.clearAllMocks();
    findMember.mockResolvedValue({ userId });
    httpServer = http.createServer();
    socketServer = createSocketServer(httpServer);
    httpServer.listen(0, '127.0.0.1', () => {
      const address = httpServer.address() as AddressInfo;
      url = `http://127.0.0.1:${address.port}`;
      done();
    });
  });

  afterEach((done) => {
    clients.forEach((client) => client.disconnect());
    clients.length = 0;
    socketServer.close(() => done());
  });

  function connect(authToken = token): ClientSocket {
    const client = createClient(url, {
      auth: { token: authToken },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    clients.push(client);
    return client;
  }

  it('rejects unauthenticated connections', async () => {
    const client = connect('invalid-token');
    const error = await once<Error>(client, 'connect_error');
    expect(error.message).toBe('Invalid or expired auth token');
  });

  it('persists and broadcasts a message to authenticated room members', async () => {
    const sender = connect();
    const receiver = connect();
    await Promise.all([once(sender, 'connect'), once(receiver, 'connect')]);

    const join = (client: ClientSocket) =>
      new Promise<Record<string, unknown>>((resolve) =>
        client.emit('join:chat', { chatId }, resolve),
      );
    await expect(join(sender)).resolves.toMatchObject({ success: true });
    await expect(join(receiver)).resolves.toMatchObject({ success: true });

    const storedMessage = {
      id: 'message-1',
      chatId,
      authorId: userId,
      authorType: 'user',
      content: 'Hola equipo',
      metadata: null,
      createdAt: new Date(),
    };
    createMessage.mockResolvedValue(storedMessage);
    const received = once<typeof storedMessage>(receiver, 'message:new');
    const startedAt = performance.now();

    const acknowledged = new Promise<Record<string, unknown>>((resolve) =>
      sender.emit('send:message', { chatId, content: '  Hola equipo  ' }, resolve),
    );

    await expect(received).resolves.toMatchObject({ id: 'message-1', content: 'Hola equipo' });
    expect(performance.now() - startedAt).toBeLessThan(100);
    await expect(acknowledged).resolves.toMatchObject({ success: true });
    expect(createMessage).toHaveBeenCalledWith({
      data: { chatId, authorId: userId, authorType: 'user', content: 'Hola equipo' },
    });
  });

  it('denies joining a chat when the user is not a member', async () => {
    findMember.mockResolvedValue(null);
    const client = connect();
    await once(client, 'connect');

    const result = await new Promise<Record<string, unknown>>((resolve) =>
      client.emit('join:chat', { chatId }, resolve),
    );

    expect(result).toMatchObject({
      success: false,
      error: { code: 'CHAT_ACCESS_DENIED' },
    });
  });

  it('validates payloads and requires joining before sending', async () => {
    const client = connect();
    await once(client, 'connect');

    const invalidJoin = await new Promise<Record<string, unknown>>((resolve) =>
      client.emit('join:chat', { chatId: 'invalid' }, resolve),
    );
    expect(invalidJoin).toMatchObject({ success: false, error: { code: 'INVALID_PAYLOAD' } });

    const sendWithoutJoining = await new Promise<Record<string, unknown>>((resolve) =>
      client.emit('send:message', { chatId, content: 'hello' }, resolve),
    );
    expect(sendWithoutJoining).toMatchObject({
      success: false,
      error: { code: 'CHAT_ACCESS_DENIED' },
    });

    const invalidMessage = await new Promise<Record<string, unknown>>((resolve) =>
      client.emit('send:message', { chatId, content: '   ' }, resolve),
    );
    expect(invalidMessage).toMatchObject({
      success: false,
      error: { code: 'INVALID_PAYLOAD' },
    });
  });

  it('broadcasts presence when users leave explicitly or disconnect', async () => {
    const observer = connect();
    const member = connect();
    await Promise.all([once(observer, 'connect'), once(member, 'connect')]);

    const join = (client: ClientSocket) =>
      new Promise<Record<string, unknown>>((resolve) =>
        client.emit('join:chat', { chatId }, resolve),
      );
    await join(observer);
    const joined = once<Record<string, unknown>>(observer, 'user:joined');
    await join(member);
    await expect(joined).resolves.toMatchObject({ chatId, userId });

    const explicitlyLeft = once<Record<string, unknown>>(observer, 'user:left');
    const leaveResult = new Promise<Record<string, unknown>>((resolve) =>
      member.emit('leave:chat', { chatId }, resolve),
    );
    await expect(leaveResult).resolves.toMatchObject({ success: true });
    await expect(explicitlyLeft).resolves.toMatchObject({ chatId, userId });

    await join(member);
    const disconnected = once<Record<string, unknown>>(observer, 'user:left');
    member.disconnect();
    await expect(disconnected).resolves.toMatchObject({ chatId, userId });
  });

  it('returns an internal error when persistence fails', async () => {
    const client = connect();
    await once(client, 'connect');
    await new Promise((resolve) => client.emit('join:chat', { chatId }, resolve));
    createMessage.mockRejectedValue(new Error('database unavailable'));

    const result = await new Promise<Record<string, unknown>>((resolve) =>
      client.emit('send:message', { chatId, content: 'hello' }, resolve),
    );
    expect(result).toMatchObject({ success: false, error: { code: 'INTERNAL_ERROR' } });
  });
});
