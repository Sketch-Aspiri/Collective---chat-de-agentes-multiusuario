import { useState } from 'react';

interface Notification {
  id: string;
  message: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function notify(message: string): void {
    setNotifications((prev) => [...prev, { id: crypto.randomUUID(), message }]);
  }

  function dismiss(id: string): void {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return { notifications, notify, dismiss };
}
