# 🎨 Sprint 2: Agente Frontend

**Duración:** Jul 18–31 | **Objetivo del sprint:** Chat en tiempo real | **Entregable:** Usuarios pueden chatear

## Objetivo General
Construir la interfaz de chat completa: lista de chats, vista de conversación, envío/recepción de mensajes en tiempo real vía Socket.io, threads, e indicadores de estado (escribiendo, conectado).

## Contexto (ya resuelto en Sprint 1)
- Setup de Vite + React 18 + TypeScript + Tailwind + Shadcn/ui funcionando
- Layout responsivo base y routing con React Router
- `authStore` (Zustand) con JWT ya integrado

## 📌 Tareas principales

### Tarea 1 — `chatStore` (Zustand)
- [ ] Estado: lista de chats, chat activo, mensajes por chat, estado de conexión del socket
- [ ] Acciones: `setActiveChat`, `addMessage`, `prependMessages` (para historial), `setTypingUser`
- [ ] Mantener store de chat separado de `authStore`/`uiStore` (convención del proyecto)

### Tarea 2 — Cliente Socket.io
- [ ] Inicializar conexión autenticada (token JWT) al iniciar sesión
- [ ] Suscribirse a `message:new`, `message:typing`, eventos de conexión/desconexión
- [ ] Reconexión automática con backoff; al reconectar, re-unirse a la room del chat activo
- [ ] Aislar la lógica de socket en un hook (`useChatSocket`) o servicio dedicado, no en componentes

### Tarea 3 — Lista de chats (sidebar)
- [ ] `GET /chats` vía TanStack Query, cache y refetch al reconectar
- [ ] Mostrar último mensaje y timestamp por chat
- [ ] Estado activo resaltado, click para cambiar de chat

### Tarea 4 — Vista de conversación
- [ ] Lista de mensajes con scroll infinito hacia atrás (paginación por cursor, `GET /chats/:id/messages`)
- [ ] Renderizado de contenido con React Markdown (ya en el stack, preparar para respuestas de agentes en Sprint 3)
- [ ] Auto-scroll al fondo en mensajes nuevos, salvo que el usuario haya scrolleado hacia arriba

### Tarea 5 — Input de mensaje y threads
- [ ] Caja de texto con envío (Enter) y salto de línea (Shift+Enter)
- [ ] Soporte visual de respuesta a un mensaje específico (thread / `parentMessageId`)
- [ ] Indicador de "usuario escribiendo..." con debounce al tipear

### Tarea 6 — Miembros del chat
- [ ] UI para invitar/agregar miembros a un chat (`POST /chats/:id/members`)
- [ ] Mostrar avatares/nombres de miembros y estado de conexión (online/offline)

### Tarea 7 — Testing
- [ ] React Testing Library para componentes clave (lista de chats, input, mensaje)
- [ ] Cypress: flujo E2E de enviar y recibir un mensaje entre dos sesiones simuladas
- [ ] Cobertura objetivo: 80%

## 🚫 No toca en este sprint
- UI de creación/gestión de agentes (Sprint 3)
- @menciones (Sprint 3)
- Integraciones con Google Drive
- Billing/Stripe UI

## 📌 Dependencias y Orden
1. **Tarea 1** (store) → base de todo lo demás
2. **Tarea 2** (socket) → depende del store, y del backend de Sprint 2 ya disponible
3. **Tareas 3 y 4** → pueden ir en paralelo una vez lista Tarea 2
4. **Tarea 5** → depende de Tarea 4
5. **Tarea 6** → puede ir en paralelo con Tarea 5
6. **Tarea 7** → continuo, no dejar para el final

## 🔍 Criterios de Aceptación
- [ ] Un usuario ve sus chats y puede abrir una conversación
- [ ] Los mensajes enviados aparecen instantáneamente en todos los clientes conectados a ese chat
- [ ] El historial carga con scroll hacia atrás sin recargar la página
- [ ] El indicador de "escribiendo..." aparece y desaparece correctamente
- [ ] La UI se recupera de una desconexión de red sin perder mensajes
- [ ] Chat debe responder visualmente en <200ms tras interacción del usuario
- [ ] Tests E2E de Cypress pasan en CI

## 📚 Referencias
- Socket.io client: https://socket.io/docs/v4/client-api/
- TanStack Query (infinite queries): https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
- Zustand: https://docs.pmnd.rs/zustand/getting-started/introduction

## ⚠️ Notas Importantes
- Coordinar con el agente Backend los nombres exactos de eventos de socket antes de implementar (evitar desalineación de payloads)
- No duplicar lógica de auth: reusar `authStore` existente para el token del socket
- Cada componente debe consumir solo lo que necesita del store (evitar prop-drilling, convención del proyecto)
- Cualquier duda sobre el diseño visual (colores, iconografía) consultar antes de asumir un estilo definitivo
