import { useUiStore } from '../../store/uiStore';

export function Header() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <button onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>
      <span className="font-semibold">agentes-chat</span>
    </header>
  );
}
