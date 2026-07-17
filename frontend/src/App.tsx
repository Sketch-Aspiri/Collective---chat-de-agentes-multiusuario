import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { AgentSetupPage } from './pages/AgentSetupPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/chats/:chatId" element={<ChatPage />} />
      <Route path="/agents/new" element={<AgentSetupPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
