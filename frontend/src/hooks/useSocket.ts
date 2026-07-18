import { useContext } from 'react';
import { SocketContext, type SocketContextValue } from '@/context/SocketProvider';

/**
 * Acceso a la conexión Socket.io compartida y su estado.
 * Debe usarse dentro de <SocketProvider>.
 */
export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
