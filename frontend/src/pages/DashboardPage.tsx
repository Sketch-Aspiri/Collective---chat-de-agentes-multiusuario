import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Common/Header';
import { Sidebar } from '../components/Common/Sidebar';
import { CreateChatForm } from '../components/Forms/CreateChatForm';
import { useChat } from '../hooks/useChat';

export function DashboardPage() {
  const { chats, fetchChats } = useChat();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <div className="flex h-screen">
      <Sidebar>
        <nav className="p-4 space-y-2">
          {chats.map((chat) => (
            <Link key={chat.id} to={`/chats/${chat.id}`} className="block">
              {chat.name}
            </Link>
          ))}
        </nav>
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4">
          <CreateChatForm onSubmit={() => fetchChats()} />
        </div>
      </div>
    </div>
  );
}
