import { Message } from '../../types';
import { formatTimestamp } from '../../utils/format';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ul className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <li key={message.id}>
          <span className="text-xs text-gray-500 mr-2">{formatTimestamp(message.createdAt)}</span>
          {message.content}
        </li>
      ))}
    </ul>
  );
}
