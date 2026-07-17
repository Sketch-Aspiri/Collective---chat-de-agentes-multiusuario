import { useAuthStore } from '../store/authStore';
import * as authService from '../services/auth.service';

export function useAuth() {
  const { token, user, setSession, logout } = useAuthStore();

  async function signIn(email: string, password: string) {
    const newToken = await authService.login(email, password);
    setSession(newToken, { id: '', email, name: email.split('@')[0] });
  }

  return { token, user, isAuthenticated: Boolean(token), signIn, logout };
}
