import { create } from 'zustand';
import type { Notification, NotificationType } from '@/types';

export type ModalName = 'newChat' | 'inviteAgent';

interface UIState {
  sidebarOpen: boolean;
  modals: Record<ModalName, boolean>;
  notifications: Notification[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (name: ModalName) => void;
  closeModal: (name: ModalName) => void;
  addNotification: (input: { type: NotificationType; message: string }) => void;
  removeNotification: (id: string) => void;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  modals: { newChat: false, inviteAgent: false },
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (name) => set((state) => ({ modals: { ...state.modals, [name]: true } })),
  closeModal: (name) => set((state) => ({ modals: { ...state.modals, [name]: false } })),
  addNotification: (input) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: createId(), createdAt: new Date().toISOString(), ...input },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    })),
}));
