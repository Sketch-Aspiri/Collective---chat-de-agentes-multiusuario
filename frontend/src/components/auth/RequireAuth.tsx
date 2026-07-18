import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

/**
 * Puerta de rutas protegidas. Si no hay token, muestra una pantalla de acceso.
 * En el sprint la sesión es mock: "Entrar (demo)" establece usuario y token.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="text-2xl font-semibold">agentes-chat</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Inicia sesión para acceder a tus chats con agentes de IA.
          </p>
        </div>
        <Button size="lg" onClick={login}>
          Entrar (demo)
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
