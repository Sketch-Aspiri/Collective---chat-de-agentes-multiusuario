export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  authorType: 'user' | 'agent';
  content: string;
  createdAt: Date;
}
