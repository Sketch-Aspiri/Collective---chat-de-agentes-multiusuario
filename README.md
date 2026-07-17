# agentes-chat

Plataforma de chat multiusuario con agentes de IA integrados. Los usuarios crean chats, invitan agentes personalizables (vía `@mención`), y los agentes ejecutan tareas usando LLMs conectados a integraciones externas (Google Drive en el MVP; OneDrive, Slack/Teams en fases futuras).

Ver `CLAUDE.md` y `docs/` para especificación funcional, decisiones arquitectónicas y estructura de carpetas.

## Stack

- **Backend**: Node.js 20+, Express, TypeScript, PostgreSQL (Prisma), Redis, BullMQ, Socket.io
- **Frontend**: React 18, Vite, TypeScript, Zustand, TanStack Query, Tailwind CSS, Socket.io-client

## Empezar

```bash
# Instalar dependencias (backend + frontend, vía npm workspaces)
npm install

# Levantar Postgres + Redis local
docker-compose up -d

# Copiar variables de entorno
cp .env.example .env
cp .env.example backend/.env.backend
cp .env.example frontend/.env.frontend

# Desarrollo
npm run dev:backend
npm run dev:frontend
```

## Comandos

```bash
npm run test:backend
npm run test:frontend
npm run lint
npm run format
```

## Documentación

- `docs/REQUISITOS_AGENTES_CHAT.md` — especificación funcional completa
- `docs/PREGUNTAS_ABIERTAS.md` — decisiones arquitectónicas pendientes/tomadas
- `docs/ESTRUCTURA_PROYECTO.md` — árbol de carpetas y dependencias
- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/RUNBOOK.md`, `docs/CONTRIBUTING.md`
