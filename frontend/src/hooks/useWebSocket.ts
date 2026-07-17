import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket.service';
import { useAuthStore } from '../store/authStore';

export function useWebSocket(): void {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;
    connectSocket(token);
    return () => disconnectSocket();
  }, [token]);
}
