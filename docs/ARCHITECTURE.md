# Arquitectura

Ver `ESTRUCTURA_PROYECTO.md` para el árbol de carpetas completo y las dependencias recomendadas.

## Componentes principales

- **Backend** (Express + TypeScript): API REST modular por dominio (`auth`, `users`, `chats`, `agents`, `messages`, `billing`, `webhooks`) + WebSocket (Socket.io) para chat en tiempo real.
- **Frontend** (React + Vite): SPA con Zustand para estado local y TanStack Query para estado de servidor.
- **PostgreSQL**: persistencia principal (Prisma como ORM).
- **Redis**: sesiones, rate limiting, memoria de agentes.
- **BullMQ**: ejecución asíncrona de agentes (job queue) para no bloquear el request HTTP.

## Flujo de ejecución de un agente

1. Un usuario envía un mensaje con `@mención` a un agente en un chat.
2. El backend detecta la mención y encola un job de ejecución (BullMQ).
3. El worker resuelve el proveedor LLM del agente (`services/llm/*`) y ejecuta el prompt con límites de timeout/tokens/retries.
4. La respuesta se persiste como mensaje y se emite por WebSocket al chat.

TODO: ampliar con diagramas de secuencia una vez el flujo esté implementado end-to-end.
