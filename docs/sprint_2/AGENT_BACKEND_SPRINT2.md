# 🚀 Sprint 2: Agente Backend

**Duración:** Jul 18–31 | **Objetivo del sprint:** Chat en tiempo real | **Entregable:** Usuarios pueden chatear

## Objetivo General
Sobre la base de infraestructura y auth del Sprint 1, construir el módulo de **chats** completo: modelo de datos, servicio de mensajería, WebSocket real-time con Socket.io, y persistencia de historial aislado por chat.

## Contexto (ya resuelto en Sprint 1)
- Auth: JWT + bcrypt, middleware ya implementado
- Prisma + PostgreSQL configurado y migraciones corriendo
- Socket.io montado sobre el servidor Express (handshake básico)
- Docker/CI operativos

## 📌 Tareas principales

### Tarea 1 — Modelo de datos de chats y mensajes
- [ ] Definir en `schema.prisma`: `Chat`, `ChatMember`, `Message` (con `parentMessageId` para threads)
- [ ] Relación `Chat` 1—N `Message`, `Chat` N—N `User` vía `ChatMember`
- [ ] Índices en `chatId` + `createdAt` para paginación eficiente
- [ ] Migración y seed de datos de prueba

### Tarea 2 — Servicio y controlador de chats (`modules/chats`)
- [ ] `service.ts`: crear chat, listar chats del usuario, agregar/quitar miembros
- [ ] `controller.ts` + `routes.ts`: `POST /chats`, `GET /chats`, `GET /chats/:id`, `POST /chats/:id/members`
- [ ] Toda la lógica de negocio vive en el service, no en el controller (convención del proyecto)
- [ ] Autorización: solo miembros del chat pueden leer/escribir en él

### Tarea 3 — Mensajería vía Socket.io
- [ ] Namespace o rooms por `chatId` (`socket.join(chatId)`)
- [ ] Evento `message:send` → persiste en DB → emite `message:new` a la room
- [ ] Evento `message:typing` (indicador de "escribiendo...")
- [ ] Autenticar el socket handshake con el JWT existente (reusar middleware de auth)
- [ ] Reconexión: al reconectar, el cliente debe poder re-unirse a sus rooms activas

### Tarea 4 — Historial y paginación
- [ ] `GET /chats/:id/messages?cursor=&limit=` con paginación por cursor (no offset)
- [ ] Historial aislado por chat (decisión ya tomada — no compartido entre chats)
- [ ] Orden cronológico ascendente al cargar más mensajes antiguos

### Tarea 5 — Rate limiting y validación
- [ ] Aplicar rate limiting existente (100 req/min) también a eventos de socket
- [ ] Sanitizar contenido de mensajes (XSS) antes de persistir y antes de emitir
- [ ] Validar tamaño máximo de mensaje (proponer 10k caracteres, confirmar con el equipo)

### Tarea 6 — Testing
- [ ] Jest + Supertest para endpoints REST de chats
- [ ] Tests de integración de Socket.io (conexión, join room, envío/recepción de eventos)
- [ ] Cobertura objetivo: 80% en `modules/chats`

## 🚫 No toca en este sprint
- Agentes de IA / @menciones (Sprint 3)
- Integraciones externas (Google Drive, LLMs)
- ElasticSearch (fase 2)
- Confirmación en tiempo real antes de acciones de agente (no aplica aún)

## 📌 Dependencias y Orden
1. **Tarea 1** → base de todo (schema)
2. **Tarea 2** → depende del schema
3. **Tarea 3** → depende de Tarea 2 (reusa lógica de persistencia)
4. **Tarea 4** → puede ir en paralelo con Tarea 3
5. **Tarea 5** → transversal, aplicar sobre la marcha
6. **Tarea 6** → al cierre de cada tarea, no solo al final

## 🔍 Criterios de Aceptación
- [ ] Un usuario puede crear un chat e invitar a otros miembros
- [ ] Los mensajes enviados por WebSocket llegan en tiempo real a todos los miembros conectados
- [ ] El historial de un chat es visible solo para sus miembros
- [ ] Reconectar el socket no duplica mensajes ni pierde eventos
- [ ] Latencia de WebSocket <100ms en entorno local (requisito no funcional del proyecto)
- [ ] Endpoints REST responden <200ms p99
- [ ] No hay API keys ni datos sensibles en logs
- [ ] Tests pasan en CI con ≥80% cobertura en el módulo

## 📚 Referencias
- Socket.io rooms: https://socket.io/docs/v4/rooms/
- Prisma relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- Cursor pagination: https://www.prisma.io/docs/orm/prisma-client/queries/pagination

## ⚠️ Notas Importantes
- Reutilizar el middleware de auth de Sprint 1, no reimplementar JWT
- Mantener arquitectura modular por dominio (`modules/chats/{service,controller,routes,model}.ts`)
- Documentar eventos de socket en `/docs/API.md` (nombre del evento, payload, respuesta)
- Cualquier decisión sobre límites de mensaje o threads que no esté clara: preguntar antes de asumir
