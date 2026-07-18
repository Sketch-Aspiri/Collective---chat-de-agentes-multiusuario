import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '@/components/chat/MessageInput';

describe('MessageInput', () => {
  it('deshabilita el botón de envío cuando está vacío', () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
  });

  it('llama a onSend con el contenido recortado y limpia el campo', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByRole('textbox', { name: 'Mensaje' });
    await user.type(textarea, '  hola equipo  ');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(onSend).toHaveBeenCalledWith('hola equipo');
    expect(textarea).toHaveValue('');
  });

  it('envía con Enter (sin Shift)', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByRole('textbox', { name: 'Mensaje' });
    await user.type(textarea, 'mensaje rápido{Enter}');

    expect(onSend).toHaveBeenCalledWith('mensaje rápido');
  });

  it('muestra el contador de caracteres', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Mensaje' }), 'abc');
    expect(screen.getByText('3/2000')).toBeInTheDocument();
  });

  it('resalta las @menciones en la previsualización', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Mensaje' }), 'hey @planner');
    expect(screen.getByText('@planner')).toBeInTheDocument();
  });
});
