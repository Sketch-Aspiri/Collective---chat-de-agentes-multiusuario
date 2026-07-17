import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { CreateChatInput, InviteMemberInput } from './chats.model';

export class ChatsService {
  async create(ownerId: string, input: CreateChatInput) {
    return prisma.chat.create({
      data: {
        name: input.name,
        ownerId,
        members: { create: { userId: ownerId, role: 'owner' } },
      },
    });
  }

  async listForUser(userId: string) {
    return prisma.chat.findMany({ where: { members: { some: { userId } } } });
  }

  async getById(chatId: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundError('Chat');
    }
    return chat;
  }

  async inviteMember(chatId: string, input: InviteMemberInput) {
    await this.getById(chatId);
    return prisma.chatMember.create({
      data: { chatId, userId: input.userId, role: 'member' },
    });
  }
}

export const chatsService = new ChatsService();
