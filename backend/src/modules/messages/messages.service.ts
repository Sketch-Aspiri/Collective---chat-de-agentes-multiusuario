import { prisma } from '../../config/database';
import { CreateMessageInput } from './messages.model';

export class MessagesService {
  async create(input: CreateMessageInput) {
    return prisma.message.create({ data: input });
  }

  async listForChat(chatId: string, page: number, limit: number) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}

export const messagesService = new MessagesService();
