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
