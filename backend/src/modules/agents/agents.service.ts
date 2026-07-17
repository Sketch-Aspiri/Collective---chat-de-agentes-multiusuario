import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { CreateAgentInput } from './agents.model';

export class AgentsService {
  async create(input: CreateAgentInput) {
    return prisma.agent.create({ data: input });
  }

  async listForChat(chatId: string) {
    return prisma.agent.findMany({ where: { chatId } });
  }

  async getById(id: string) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundError('Agent');
    }
    return agent;
  }
}

export const agentsService = new AgentsService();
