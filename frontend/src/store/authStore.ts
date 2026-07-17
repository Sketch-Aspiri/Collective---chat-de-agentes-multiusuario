import { create } from 'zustand';
import { loadToken, saveToken, clearToken } from '../services/storage.service';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: loadToken(),
  user: null,
  setSession: (token, user) => {
    saveToken(token);
    set({ token, user });
  },
  logout: () => {
    clearToken();
    set({ token: null, user: null });
  },
}));
