const AUTH_TOKEN_KEY = 'agentes-chat:token';

export function saveToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function loadToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
