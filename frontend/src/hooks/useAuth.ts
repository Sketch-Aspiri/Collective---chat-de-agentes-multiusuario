import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { MOCK_TOKEN, MOCK_USER } from '@/lib/mockData';

/**
 * Helper de autenticación sobre authStore. En el sprint la sesión es mock:
 * `login()` establece un usuario y token de ejemplo. La autenticación real
 * (Auth0/Firebase) llega en una fase posterior.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const logout = useAuthStore((state) => state.logout);

  const login = useCallback(() => {
    setUser(MOCK_USER);
    setToken(MOCK_TOKEN);
  }, [setUser, setToken]);

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };
}
