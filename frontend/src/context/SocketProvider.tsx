import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSocket, type AppSocket } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/lib/logger';

export interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

/**
 * Provee una única conexión Socket.io al árbol. Se conecta con el token JWT
 * del authStore, sigue el estado de conexión y limpia listeners al desmontar.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const activeSocket = getSocket(token);
    setSocket(activeSocket);

    // Sin token no intentamos conectar: evita reintentos ruidosos antes del login.
    if (!token) {
      setIsConnected(false);
      return;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (error: Error) => {
      logger.error('[socket] error de conexión:', error.message);
    };

    activeSocket.on('connect', handleConnect);
    activeSocket.on('disconnect', handleDisconnect);
    activeSocket.on('connect_error', handleError);
    activeSocket.connect();

    return () => {
      activeSocket.off('connect', handleConnect);
      activeSocket.off('disconnect', handleDisconnect);
      activeSocket.off('connect_error', handleError);
      activeSocket.disconnect();
    };
  }, [token]);

  const value = useMemo<SocketContextValue>(
    () => ({ socket, isConnected }),
    [socket, isConnected],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
