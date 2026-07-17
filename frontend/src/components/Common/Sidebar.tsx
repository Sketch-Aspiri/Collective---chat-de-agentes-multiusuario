import { ReactNode } from 'react';
import { useUiStore } from '../../store/uiStore';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  if (!isSidebarOpen) return null;
  return <aside className="w-64 border-r h-full">{children}</aside>;
}
