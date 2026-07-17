import { api } from './api';
import { ApiResponse } from '../types';

interface AuthResult {
  token: string;
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<ApiResponse<AuthResult>>('/auth/login', { email, password });
  if (!data.data) throw new Error(data.error ?? 'Login failed');
  return data.data.token;
}

export async function register(email: string, password: string): Promise<string> {
  const { data } = await api.post<ApiResponse<AuthResult>>('/auth/register', {
    email,
    password,
  });
  if (!data.data) throw new Error(data.error ?? 'Registration failed');
  return data.data.token;
}
