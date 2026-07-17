import { getLLMProvider } from '../../services/llm/llm.interface';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { LLMProvider } from '../../types/Agent';

const EXECUTION_TIMEOUT_MS = 60_000;
const MAX_TOKENS = 10_000;
const MAX_RETRIES = 3;

export async function executeAgentMention(agentId: string, prompt: string): Promise<string> {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    throw new NotFoundError('Agent');
  }

  const provider = getLLMProvider(agent.provider as LLMProvider);

  let attempt = 0;
  let lastError: unknown;

  while (attempt < MAX_RETRIES) {
    try {
      return await Promise.race([
        provider.sendMessage(prompt, { systemPrompt: agent.systemPrompt }),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Agent execution timed out')), EXECUTION_TIMEOUT_MS),
        ),
      ]);
    } catch (err) {
      lastError = err;
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Agent execution failed');
}

export const AGENT_EXECUTION_LIMITS = { EXECUTION_TIMEOUT_MS, MAX_TOKENS, MAX_RETRIES };
