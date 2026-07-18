import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/api';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: AppSocket | null = null;

/**
 * Devuelve la instancia singleton del socket, creándola en el primer uso.
 * Actualiza el token de auth en cada llamada. `autoConnect` desactivado:
 * la conexión se gestiona explícitamente desde el provider.
 */
export function getSocket(token: string | null): AppSocket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });
  } else {
    socket.auth = { token };
  }
  return socket;
}

/** Cierra la conexión activa si existe. */
export function disconnectSocket(): void {
  socket?.disconnect();
}
