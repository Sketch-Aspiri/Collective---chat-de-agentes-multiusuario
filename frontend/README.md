# Frontend — agentes-chat

Interfaz web de chat multiusuario con agentes de IA. Construida en **React 18 +
TypeScript + Vite**, estado global con **Zustand**, datos de servidor con
**TanStack Query** y tiempo real con **Socket.io**. Estilos con **Tailwind CSS**
y componentes propios estilo shadcn/ui.

> Estado del sprint 1: UI funcional con **datos mock**. La autenticación real y
> la conexión al backend llegan en fases posteriores. El chat funciona en modo
> offline (eco local) y usa Socket.io cuando hay backend disponible.

## Requisitos

- Node.js 20+
- npm 10+

## Puesta en marcha

```bash
# Desde la raíz del monorepo
npm install

# Variables de entorno del frontend
cp frontend/.env.example frontend/.env

# Levantar el servidor de desarrollo (http://localhost:5173)
npm run dev:frontend
# o, dentro de frontend/
npm run dev
```

### Variables de entorno

| Variable          | Descripción                                | Por defecto             |
| ----------------- | ------------------------------------------ | ----------------------- |
| `VITE_API_URL`    | URL base del backend HTTP (REST API)       | `http://localhost:4000` |
| `VITE_SOCKET_URL` | URL del servidor Socket.io (tiempo real)   | `http://localhost:4000` |

## Scripts

| Script                  | Descripción                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo (Vite)                  |
| `npm run build`         | Type-check (`tsc`) + build de producción       |
| `npm run preview`       | Previsualiza el build de producción            |
| `npm run test`          | Tests unitarios (Vitest + Testing Library)     |
| `npm run test:coverage` | Tests con reporte de cobertura                 |
| `npm run test:e2e`      | Tests end-to-end (Cypress)                     |
| `npm run lint`          | ESLint sobre `src/`                            |

## Estructura

```
src/
├── components/
│   ├── auth/       # RequireAuth (rutas protegidas)
│   ├── chat/       # ChatWindow, MessageList, Message, MessageInput
│   ├── common/     # Button, Input, Textarea, Dialog, Avatar, icons, ...
│   ├── layout/     # MainLayout, Sidebar, Header
│   └── modals/     # NewChatModal, InviteAgentModal
├── context/        # SocketProvider (conexión Socket.io compartida)
├── hooks/          # useChat, useSocket, useMentions, useAuth
├── lib/            # utils (cn), logger, mockData
├── pages/          # HomePage, ChatPage, NotFoundPage
├── services/       # socket (cliente Socket.io)
├── store/          # authStore, chatStore, agentStore, uiStore (Zustand)
├── types/          # tipos de dominio y de API/socket
└── utils/          # mentions, formatting
```

## Convenciones

- **Alias de import**: `@/` apunta a `src/` (configurado en `vite.config.ts` y
  `tsconfig.json`).
- **Inmutabilidad**: los stores actualizan estado con spread, sin mutar.
- **Tema claro/oscuro**: variables CSS + clase `dark` en `<html>` (toggle en el
  header).
- **@menciones**: `@handle` (regex `/@(\w+)/g`) resaltadas en el input.
- **Logging**: usa `logger` (`src/lib/logger.ts`), no `console.log` disperso.

## Testing

Tests unitarios con Vitest + React Testing Library en `tests/unit/`. Cubren los
componentes y hooks clave (MessageInput, ChatWindow, parsing de menciones y
stores). Los tests E2E de Cypress viven en `tests/e2e/` y se ejecutan aparte.
