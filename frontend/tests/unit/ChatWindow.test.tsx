import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { SocketContext } from '@/context/SocketProvider';
import { useChatStore } from '@/store/chatStore';
import { MOCK_MESSAGES } from '@/lib/mockData';

/** Renderiza ChatWindow con un socket desconectado (modo offline/mock). */
function renderChatWindow(chatId: string) {
  return render(
    <SocketContext.Provider value={{ socket: null, isConnected: false }}>
      <ChatWindow chatId={chatId} />
    </SocketContext.Provider>,
  );
}

describe('ChatWindow', () => {
  beforeEach(() => {
    // Restaura los mensajes mock para aislar cada test.
    useChatStore.setState({
      messagesByChat: structuredClone(MOCK_MESSAGES),
      isLoadingMessages: false,
    });
  });

  it('renderiza los mensajes del chat con su autor', () => {
    renderChatWindow('chat-1');
    expect(screen.getByText('Planner')).toBeInTheDocument();
    expect(screen.getByText(/Arranquemos/)).toBeInTheDocument();
  });

  it('muestra estado vacío cuando el chat no tiene mensajes', () => {
    useChatStore.setState({ messagesByChat: { 'chat-empty': [] } });
    renderChatWindow('chat-empty');
    expect(screen.getByText(/No hay mensajes todavía/)).toBeInTheDocument();
  });

  it('añade el mensaje enviado a la lista en modo offline', async () => {
    const user = userEvent.setup();
    renderChatWindow('chat-1');

    await user.type(screen.getByRole('textbox', { name: 'Mensaje' }), 'nuevo mensaje de prueba');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(screen.getByText('nuevo mensaje de prueba')).toBeInTheDocument();
  });
});
