# 🎨 Sprint 1: Agente Frontend

## Objetivo General
Construir interfaz base de chat multiusuario con diseño responsivo, estado global con Zustand, y conexión real-time con Socket.io.

---

## 📋 Tareas Prioritarias

### 1️⃣ **Inicializar proyecto React + Stack** [2-3 días]

**Entregable:**
- ✅ `frontend/` con Vite + React 18 + TypeScript setup
- ✅ `package.json` con: React, Zustand, TanStack Query, Socket.io-client, Tailwind, Shadcn/ui
- ✅ Estructura de carpetas lista
- ✅ Alias de imports configurados (`@/*`)
- ✅ Variables de entorno (`.env.example`)

**Checklist:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install zustand @tanstack/react-query axios socket.io-client
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npx tailwindcss init -p
npx shadcn-ui@latest init
```

**Estructura esperada:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ChatHeader.tsx
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBanner.tsx
│   │   │   └── Button.tsx (Shadcn)
│   │   └── modals/
│   │       ├── NewChatModal.tsx
│   │       └── InviteAgentModal.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useSocket.ts
│   │   ├── useAuth.ts
│   │   └── useMentions.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   ├── uiStore.ts
│   │   └── agentStore.ts
│   ├── services/
│   │   ├── api.ts           # axios instance + endpoints
│   │   ├── socket.ts        # Socket.io client setup
│   │   └── queryClient.ts   # TanStack Query config
│   ├── types/
│   │   ├── index.ts         # User, Chat, Agent, Message
│   │   └── api.ts
│   ├── utils/
│   │   ├── formatting.ts    # date, text formatting
│   │   └── validators.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ChatPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── favicon.svg
├── .env.example
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

**vite.config.ts:**
```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**NO hacer en esta tarea:**
- ❌ Integración completa con backend
- ❌ Autenticación real
- ❌ Agentes funcionando

---

### 2️⃣ **Diseño del Layout Principal** [2-3 días]

**Entregable:**
- ✅ `MainLayout.tsx` responsive (sidebar + main content)
- ✅ `Sidebar.tsx` con lista de chats y botón "New Chat"
- ✅ `Header.tsx` con nombre de chat y botones de acción
- ✅ Tailwind + Shadcn configurado con tema consistente
- ✅ Responsive en mobile (breakpoints: sm, md, lg, xl)

**Diseño esperado:**

```
┌─────────────────────────────────────────┐
│ Header (Chat Title | Add Agent | ...)   │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │      Chat Messages           │
│ (Chats)  │      (Scrollable)            │
│          │                              │
│ + New    ├──────────────────────────────┤
│ Chat     │ Message Input & Send         │
└──────────┴──────────────────────────────┘
```

**Componentes:**

1. **MainLayout.tsx**
   - Grid o Flexbox layout
   - Sidebar ancho: 250px (desktop), colapsable en mobile
   - Responsive breakpoints con Tailwind

2. **Sidebar.tsx**
   - Lista de chats (mock data por ahora)
   - Ícono + nombre de cada chat
   - Botón "+ New Chat" en base
   - Highlight del chat activo

3. **Header.tsx**
   - Título del chat
   - Botón "Invite Agent" (abre modal)
   - Botón de menú (settings, delete chat, etc.)
   - Avatar/info del usuario (mock)

4. **ChatWindow.tsx**
   - Renderiza `MessageList` y `MessageInput`
   - Gestiona scroll al fondo con nuevos mensajes

**Checklist:**
- ✅ Responsive: mobile (320px), tablet (768px), desktop (1024px+)
- ✅ Dark mode listo (Tailwind `dark:` classes)
- ✅ Todos los componentes tienen TypeScript props correctas
- ✅ Tailwind purge no rompe build
- ✅ Layout se ve bien sin contenido (skeleton/placeholder)

**NO hacer:**
- ❌ Integración con datos reales
- ❌ Socket.io listeners
- ❌ Agentes rendering

---

### 3️⃣ **Gestión de Estado Global (Zustand)** [2 días]

**Entregable:**
- ✅ 4 stores Zustand: `authStore`, `chatStore`, `uiStore`, `agentStore`
- ✅ Selectors y acciones bien tipadas
- ✅ Mock data para testing manual

**Stores:**

1. **authStore.ts**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}
```

2. **chatStore.ts**
```typescript
interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[]; // del chat actual
  isLoadingMessages: boolean;
  
  // Actions
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chatId: string) => void;
  addMessage: (message: Message) => void;
  addChat: (chat: Chat) => void;
}
```

3. **agentStore.ts**
```typescript
interface AgentState {
  availableAgents: Agent[]; // para invitar
  chatAgents: Agent[];      // agentes en chat actual
  
  // Actions
  setAvailableAgents: (agents: Agent[]) => void;
  setChatAgents: (agents: Agent[]) => void;
  addAgentToChat: (agent: Agent) => void;
}
```

4. **uiStore.ts**
```typescript
interface UIState {
  sidebarOpen: boolean; // mobile
  showNewChatModal: boolean;
  showInviteAgentModal: boolean;
  notificationQueue: Notification[];
  
  // Actions
  toggleSidebar: () => void;
  showModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  addNotification: (notif: Notification) => void;
}
```

**Checklist:**
- ✅ Stores son inmutables (usar spread operator)
- ✅ Selectors memorizados si es necesario
- ✅ Persist middleware para `token` (localStorage)
- ✅ Mock data en cada store
- ✅ TypeScript types exactos para cada action

**Ejemplo de uso en componente:**
```typescript
// components/chat/ChatWindow.tsx
import { useChatStore } from '@/store/chatStore';

export function ChatWindow() {
  const { currentChatId, messages, addMessage } = useChatStore();
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={addMessage} />
    </div>
  );
}
```

**NO hacer:**
- ❌ Redux o Context API (solo Zustand)
- ❌ Sincronización con backend (aún)
- ❌ LocalStorage para todo

---

### 4️⃣ **Componentes de Chat (UI)** [3 días]

**Entregable:**
- ✅ `MessageList.tsx` con scroll infinito prep
- ✅ `MessageInput.tsx` con @mention support básico
- ✅ `Message.tsx` para renderizar cada mensaje
- ✅ Modal para nuevo chat
- ✅ Modal para invitar agente
- ✅ Todos con Shadcn/ui components

**Componentes:**

1. **MessageList.tsx**
   - Renderiza array de mensajes
   - Auto-scroll al último mensaje
   - Loading state si cargando
   - Empty state si no hay mensajes

2. **Message.tsx**
   - Avatar del autor
   - Nombre del autor (usuario o agente)
   - Content con Markdown (usar `react-markdown`)
   - Timestamp formateado
   - Diferente styling para usuario vs agente

3. **MessageInput.tsx**
   - Textarea (auto-expandible)
   - Detección de `@` para menciones
   - Botón Send (deshabilitado si vacío)
   - Indicador de typing (prep para Socket)
   - Máximo 2000 caracteres

4. **NewChatModal.tsx**
   - Input para título
   - Botón "Create"
   - Cierre con ESC

5. **InviteAgentModal.tsx**
   - Dropdown de agentes disponibles
   - Botón "Add to Chat"
   - Validar que no esté ya en el chat

**Checklist:**
- ✅ Shadcn components: Button, Input, Dialog, Textarea, Avatar
- ✅ Markdown rendering en mensajes
- ✅ Timestamps formateos ("2 min ago")
- ✅ Mention regex: `/@\w+/g`
- ✅ Accesibilidad: aria-labels, focus management en modales
- ✅ Responsive: inputs full-width en mobile

**NO hacer:**
- ❌ Enviar mensajes realmente (solo UI)
- ❌ Ejecutar agentes
- ❌ Historial persistente

---

### 5️⃣ **Hooks Custom + Socket.io Integration** [2-3 días]

**Entregable:**
- ✅ `useSocket.ts` hook para manejar conexión
- ✅ `useChat.ts` hook que combina API + Socket
- ✅ `useMentions.ts` para parsear @mentions
- ✅ Socket.io client conectado (sin persistencia aún)
- ✅ Event listeners para: message:new, user:joined, user:left

**Hooks:**

1. **useSocket.ts**
```typescript
export function useSocket() {
  const { token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
    });
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    return () => socket.disconnect();
  }, [token]);
  
  return { isConnected, socket };
}
```

2. **useChat.ts**
```typescript
export function useChat(chatId: string) {
  const { addMessage } = useChatStore();
  const { socket } = useSocket();
  
  useEffect(() => {
    socket?.on('message:new', (msg) => {
      addMessage(msg);
    });
    
    return () => {
      socket?.off('message:new');
    };
  }, [socket, addMessage]);
  
  const sendMessage = (content: string) => {
    socket?.emit('send:message', { chatId, content });
  };
  
  return { sendMessage };
}
```

3. **useMentions.ts**
```typescript
export function useMentions(text: string) {
  const mentions = text.match(/@(\w+)/g) || [];
  return mentions.map(m => m.slice(1)); // remove @
}
```

**Checklist:**
- ✅ Socket conecta con JWT auth
- ✅ Listeners se limpian en useEffect
- ✅ Estados de conexión visible en UI (badge en header)
- ✅ Errores de conexión loguados
- ✅ Reconexión automática (socket.io default)

**NO hacer:**
- ❌ Persistencia de chat en localStorage
- ❌ Ejecución de agentes
- ❌ Búsqueda de historial

---

### 6️⃣ **Routing y Pages Base** [1-2 días]

**Entregable:**
- ✅ React Router v6 setup
- ✅ Páginas: HomePage, ChatPage, NotFoundPage
- ✅ Rutas protegidas (requieren token)
- ✅ Navegación funcional

**Rutas:**
```typescript
// src/App.tsx
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/chat/:chatId', element: <ChatPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

**HomePage:**
- Mostrar lista de chats del sidebar
- Botón "New Chat"
- Si no hay chats: empty state con CTA

**ChatPage:**
- Renderizar `ChatWindow`
- Cargar chat por ID de URL
- Si chatId no existe: error page

**Checklist:**
- ✅ Rutas protegidas si token no existe
- ✅ Parámetros dinámicos en URL
- ✅ Breadcrumbs o back button
- ✅ URL persiste al refrescar

---

### 7️⃣ **Testing + Storybook (opcional)** [1-2 días]

**Entregable:**
- ✅ Suite de tests con Vitest + React Testing Library
- ✅ Tests para componentes key: MessageInput, ChatWindow
- ✅ Tests para hooks: useChat, useSocket
- ✅ Storybook setup (opcional pero recomendado)

**Tests mínimos:**
```
tests/
├── components/
│   ├── MessageInput.test.tsx
│   └── ChatWindow.test.tsx
├── hooks/
│   ├── useChat.test.ts
│   └── useMentions.test.ts
└── setup.ts
```

**Coverage:**
- Componentes principales: 80%+
- Hooks críticos: 100%

**Checklist:**
- ✅ `npm run test` ejecuta suite
- ✅ `npm run test:coverage` genera reporte
- ✅ CI/CD corre tests (GitHub Actions)

---

## 📌 Dependencias y Orden

1. **Tarea 1** → Tarea 2 (estructura base)
2. **Tarea 2** → Tarea 3 (layout para usar stores)
3. **Tarea 3** (paralelo con Tarea 2)
4. **Tarea 4** (componentes pequeños)
5. **Tarea 5** (integración con Socket + hooks)
6. **Tarea 6** (rutas que usan todo)
7. **Tarea 7** (tests finales)

---

## 🔍 Criterios de Aceptación

- [ ] Frontend levanta con `npm run dev` sin errores
- [ ] Layout responsive funciona en 320px a 2560px
- [ ] Zustand stores funcionan y tienen mock data
- [ ] Socket.io conecta (mostrar en console + UI)
- [ ] Componentes usan Shadcn/ui correctamente
- [ ] Markdown renderiza en mensajes
- [ ] @mention parsing funciona (mostrar highlighted)
- [ ] Modales abren/cierran sin errores
- [ ] Todos los tests pasan
- [ ] README actualizado con instrucciones dev

---

## 📚 Referencias

- React 18: https://react.dev
- Zustand: https://github.com/pmndrs/zustand
- TanStack Query: https://tanstack.com/query/latest
- Socket.io Client: https://socket.io/docs/v4/client-api/
- Tailwind CSS: https://tailwindcss.com
- Shadcn/ui: https://ui.shadcn.com
- React Router: https://reactrouter.com
- React Markdown: https://github.com/remarkjs/react-markdown

---

## ⚠️ Notas Importantes

- **No implementar autenticación** — solo mock token en store
- **No conectar a backend real** — excepto Socket para broadcast
- **Usar mock data** en stores inicialmente
- **Responsive first** — mobile design, luego desktop
- **Accesibilidad** — ARIA labels, keyboard navigation
- **Performance** — memoizar componentes si necesario, lazy load si hay muchos mensajes
