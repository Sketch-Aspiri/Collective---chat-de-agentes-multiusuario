interface AgentStatusProps {
  isOnline: boolean;
}

export function AgentStatus({ isOnline }: AgentStatusProps) {
  return (
    <span className={isOnline ? 'text-green-600' : 'text-gray-400'}>
      {isOnline ? 'En línea' : 'Inactivo'}
    </span>
  );
}
