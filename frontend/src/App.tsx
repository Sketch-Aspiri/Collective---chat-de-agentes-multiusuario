/**
 * Shell base de la aplicación.
 *
 * El árbol de rutas real (HomePage / ChatPage / NotFoundPage) se incorpora
 * en la Tarea 6 del sprint. Por ahora rendea un placeholder para mantener
 * el build verde mientras se construyen layout, stores y componentes.
 */
export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">agentes-chat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Interfaz en construcción — Sprint 1 Frontend
        </p>
      </div>
    </div>
  );
}
