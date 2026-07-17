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
5. Inicia el backend con `npm run dev:backend`.

El health check queda disponible en `GET http://localhost:4000/health`.

## Comandos

- `npm run build:backend`: compila TypeScript.
- `npm run test:backend`: ejecuta pruebas.
- `npm run lint --workspace backend`: ejecuta ESLint.
