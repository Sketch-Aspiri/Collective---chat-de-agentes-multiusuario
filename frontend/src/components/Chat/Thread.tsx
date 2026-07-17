import { Message } from '../../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ThreadProps {
  messages: Message[];
  onSend: (content: string) => void;
}

export function Thread({ messages, onSend }: ThreadProps) {
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <MessageInput onSend={onSend} />
    </div>
  );
}
