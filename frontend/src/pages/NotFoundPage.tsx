import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';

/** Página 404 para rutas no reconocidas. */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h2 className="text-xl font-semibold">Página no encontrada</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        La ruta que buscas no existe.
      </p>
      <Button onClick={() => navigate('/')}>Volver al inicio</Button>
    </div>
  );
}
