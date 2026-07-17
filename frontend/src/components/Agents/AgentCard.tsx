import { Agent } from '../../types';
import { AgentStatus } from './AgentStatus';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="border rounded p-3 flex items-center justify-between">
      <div>
        <p className="font-medium">{agent.name}</p>
        <p className="text-sm text-gray-500">@{agent.mentionHandle}</p>
      </div>
      <AgentStatus isOnline />
    </div>
  );
}
