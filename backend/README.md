# Backend

Base Node.js + Express escrita en TypeScript.

## Requisitos

- Node.js 20+
- Docker con Compose

## Inicio local

1. Copia `backend/.env.example` a `backend/.env`.
2. Desde la raiz, inicia PostgreSQL y Redis con `docker compose up -d`.
3. Instala dependencias con `npm install`.
4. Genera el cliente de Prisma con `npm run prisma:generate --workspace backend`.
5. Aplica las migraciones con `npm run prisma:migrate --workspace backend`.
6. Carga datos locales con `npm run prisma:seed --workspace backend`.
7. Inicia el backend con `npm run dev:backend`.

El health check queda disponible en `GET http://localhost:4000/health`.

## Chat en tiempo real

Socket.io usa la misma URL del backend. El cliente debe enviar el JWT `HS256` en
`auth.token` (o como `Authorization: Bearer <token>`). Los eventos disponibles son:

- `join:chat` con `{ chatId }`: valida que el usuario sea miembro y entra a `chat:<chatId>`.
- `send:message` con `{ chatId, content }`: persiste el mensaje y emite `message:new` a la sala.
- `leave:chat` con `{ chatId }`: sale de la sala y emite `user:left` a los demás miembros.

`join:chat` también emite `user:joined`. Los tres eventos aceptan un acknowledgement con
`{ success, data }` o `{ success: false, error: { code, message } }`. Socket.io conserva el
estado ante desconexiones breves de hasta dos minutos; tras una reconexión no recuperable,
el cliente debe volver a emitir `join:chat`.

## Comandos

- `npm run build:backend`: compila TypeScript.
- `npm run test:backend`: ejecuta pruebas.
- `npm run lint --workspace backend`: ejecuta ESLint.
- `npm run prisma:migrate --workspace backend`: crea y aplica migraciones en desarrollo.
- `npm run prisma:seed --workspace backend`: crea tres usuarios, dos chats y un agente de prueba.

## Relaciones de datos

- Un usuario puede ser propietario y miembro de múltiples chats.
- Un usuario puede crear múltiples agentes.
- Cada chat contiene miembros y mensajes.
- `ChatAgentLink` representa la relación muchos-a-muchos entre chats y agentes.
- Al eliminar un chat se eliminan en cascada sus membresías, mensajes y enlaces de agentes.

## Seguridad HTTP base

- Las rutas protegidas validan tokens JWT `HS256` enviados como `Authorization: Bearer <token>`.
- El payload autenticado queda disponible como `req.user` y `req.userId`.
- Redis limita cada usuario a 100 solicitudes por minuto y devuelve `429` con `Retry-After` al exceder la cuota.
- Los endpoints públicos de autenticación se limitan a 10 intentos por minuto y dirección IP.
- Si Redis no está disponible, las rutas protegidas responden `503` para evitar que el límite falle de forma abierta.
