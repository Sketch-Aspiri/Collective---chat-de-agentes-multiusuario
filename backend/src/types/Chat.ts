export interface Chat {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMember {
  chatId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}
