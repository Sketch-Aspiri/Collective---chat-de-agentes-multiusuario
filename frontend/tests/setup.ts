import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom no implementa scrollIntoView; MessageList lo usa para auto-scroll.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Limpia el DOM renderizado entre tests para evitar fugas de estado.
afterEach(() => {
  cleanup();
});
