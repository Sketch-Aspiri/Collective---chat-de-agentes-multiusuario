import { Chat, Message } from '../../types';
import { ChatHeader } from './ChatHeader';
import { Thread } from './Thread';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  onSend: (content: string) => void;
}

export function ChatWindow({ chat, messages, onSend }: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader name={chat.name} />
      <Thread messages={messages} onSend={onSend} />
    </div>
  );
}
