import { useEffect, useMemo, useRef } from 'react';
import type { Message as MessageType } from '@/types';
import { Message } from './Message';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAgentStore } from '@/store/agentStore';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

/**
 * Lista scrollable de mensajes con auto-scroll al último, estado de carga
 * y estado vacío. Resuelve el color de avatar de cada agente autor.
 */
export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const availableAgents = useAgentStore((state) => state.availableAgents);
  const chatAgents = useAgentStore((state) => state.chatAgents);

  const agentColorById = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const agent of [...availableAgents, ...chatAgents]) {
      map[agent.id] = agent.avatarColor;
    }
    return map;
  }, [availableAgents, chatAgents]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner label="Cargando mensajes" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
        No hay mensajes todavía. ¡Escribe el primero!
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          avatarColor={message.authorType === 'agent' ? agentColorById[message.authorId] : undefined}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
