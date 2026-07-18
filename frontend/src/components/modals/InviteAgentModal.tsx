import { useMemo, useState } from 'react';
import { Dialog } from '@/components/common/Dialog';
import { Button } from '@/components/common/Button';
import { useAgentStore } from '@/store/agentStore';
import { useUIStore } from '@/store/uiStore';

/**
 * Modal para invitar un agente al chat actual. Solo lista agentes que aún
 * no están en el chat (evita duplicados).
 */
export function InviteAgentModal() {
  const open = useUIStore((state) => state.modals.inviteAgent);
  const closeModal = useUIStore((state) => state.closeModal);
  const addNotification = useUIStore((state) => state.addNotification);

  const availableAgents = useAgentStore((state) => state.availableAgents);
  const chatAgents = useAgentStore((state) => state.chatAgents);
  const addAgentToChat = useAgentStore((state) => state.addAgentToChat);

  const [selectedId, setSelectedId] = useState('');

  const invitable = useMemo(
    () => availableAgents.filter((agent) => !chatAgents.some((inChat) => inChat.id === agent.id)),
    [availableAgents, chatAgents],
  );

  const handleClose = () => {
    setSelectedId('');
    closeModal('inviteAgent');
  };

  const handleAdd = () => {
    const agent = invitable.find((candidate) => candidate.id === selectedId);
    if (!agent) return;
    addAgentToChat(agent);
    addNotification({ type: 'success', message: `${agent.name} añadido al chat` });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Invitar agente"
      description="Elige un agente para añadirlo a este chat."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={!selectedId}>
            Add to Chat
          </Button>
        </>
      }
    >
      {invitable.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todos los agentes disponibles ya están en el chat.
        </p>
      ) : (
        <>
          <label htmlFor="invite-agent-select" className="mb-1 block text-sm font-medium">
            Agente
          </label>
          <select
            id="invite-agent-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Selecciona un agente…
            </option>
            {invitable.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} (@{agent.mentionHandle})
              </option>
            ))}
          </select>
        </>
      )}
    </Dialog>
  );
}
