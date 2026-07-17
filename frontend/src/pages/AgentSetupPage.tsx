import { useNavigate } from 'react-router-dom';
import { CreateAgentForm } from '../components/Agents/CreateAgentForm';
import { api } from '../services/api';

export function AgentSetupPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: {
    name: string;
    mentionHandle: string;
    provider: string;
  }): Promise<void> {
    await api.post('/agents', input);
    navigate('/');
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-4">Nuevo agente</h1>
      <CreateAgentForm onSubmit={handleSubmit} />
    </div>
  );
}
