export interface CreateMessageInput {
  chatId: string;
  authorId: string;
  authorType: 'user' | 'agent';
  content: string;
}
