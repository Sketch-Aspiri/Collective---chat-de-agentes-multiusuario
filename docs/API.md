# API

Base URL: `http://localhost:4000` (desarrollo).

Todas las respuestas usan el envelope:

```json
{ "success": true, "data": {}, "error": null }
```

## Auth
- `POST /auth/register` — `{ email, password }` → `{ token }`
- `POST /auth/login` — `{ email, password }` → `{ token }`

## Users
- `GET /users/me`
- `PATCH /users/me`

## Chats
- `POST /chats` — `{ name }`
- `GET /chats`
- `GET /chats/:id`
- `POST /chats/:id/members` — `{ userId }`

## Agents
- `POST /agents` — `{ chatId, name, mentionHandle, provider, systemPrompt }`
- `GET /agents/chat/:chatId`
- `POST /agents/:id/execute` — `{ prompt }`

## Messages
- `POST /messages`
- `GET /messages/chat/:chatId?page=&limit=`

## Billing
- `POST /billing/checkout-session` — `{ customerId, priceId }`

## Webhooks
- `POST /webhooks/stripe`

TODO: documentar códigos de error y ejemplos de payload por endpoint conforme se implementen.
