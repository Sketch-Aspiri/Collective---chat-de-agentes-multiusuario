import { MainLayout } from '@/components/layout/MainLayout';

/**
 * Shell base de la aplicación.
 *
 * El árbol de rutas real (HomePage / ChatPage / NotFoundPage) se incorpora
 * en la Tarea 6 del sprint. Por ahora monta el MainLayout responsivo para
 * validar el layout mientras se construyen stores y componentes de chat.
 */
export default function App() {
  return <MainLayout />;
}
