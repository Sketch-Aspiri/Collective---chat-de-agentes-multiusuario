# CLAUDE.md

Este archivo guía a Claude Code (claude.ai/code) cuando trabaja en este repositorio.

## Resumen del proyecto

**agentes-chat**: plataforma de chat multiusuario con agentes de IA integrados. Los usuarios crean chats, invitan agentes personalizables (vía `@mención`), y los agentes ejecutan tareas usando LLMs conectados a integraciones externas (Google Drive, y en fases futuras OneDrive, Slack/Teams).

Documentos de referencia del proyecto (si existen en `/docs`):
- `REQUISITOS_AGENTES_CHAT.md` — especificación funcional completa
- `PREGUNTAS_ABIERTAS.md` — decisiones arquitectónicas pendientes/tomadas
- `ESTRUCTURA_PROYECTO.md` — árbol de carpetas y dependencias

## Stack tecnológico

**Frontend**
- React 18+ con TypeScript, Vite
- Zustand (state) + TanStack Query (server state)
- Socket.io-client (chat en tiempo real)
- Tailwind CSS + Shadcn/ui
- React Router, React Markdown (render de respuestas del LLM)

**Backend**
- Node.js 20+ con Express o Fastify (elegir uno, no mezclar), TypeScript
- PostgreSQL 15+ (Prisma como ORM) — datos de usuarios, chats, agentes
- Redis — sesiones, rate limiting, memoria de agente
- Bull/BullMQ — ejecución async de agentes (job queue)
- Socket.io — WebSocket para chat en tiempo real
- ElasticSearch — búsqueda fulltext de historial (fase 2)

**Infra**
- Docker / docker-compose para desarrollo local (Postgres, Redis)
- AWS o Vercel+Supabase para hosting
- Stripe (billing), Auth0/Firebase Auth, SendGrid/SES
- GitHub Actions para CI/CD

## Estructura del repositorio

```
agentes-chat/
├── backend/src/
│   ├── config/        # database, redis, env
│   ├── middleware/     # auth, errorHandler, rateLimiter, logging
│   └── modules/        # auth, users, chats, agents (cada uno: service/controller/routes/model)
├── frontend/
│   └── store/          # authStore, chatStore, agentStore, uiStore (Zustand)
├── infra/               # Docker, Kubernetes, Terraform, scripts de deploy
└── docs/                 # ARCHITECTURE, API, DEPLOYMENT, RUNBOOK, CONTRIBUTING
```

## Comandos habituales

```bash
# Instalar dependencias
npm install --prefix backend
npm install --prefix frontend

# Levantar servicios locales (Postgres, Redis)
docker-compose up

# Desarrollo
npm run dev --prefix backend
npm run dev --prefix frontend

# Tests
npm run test --prefix backend      # Jest + Supertest
npm run test:e2e --prefix frontend # Cypress

# Lint / format
npm run lint
npm run format
```

> Nota: ajustar estos comandos a los `package.json` reales una vez inicializado el repo; este es el layout planeado, no confirmado.

## Convenciones

**Commits** (Conventional Commits):
```
feat(agents): add @mention detection
fix(auth): fix JWT expiration bug
docs(readme): update API endpoints
```

**Ramas**: `main` ← `staging` ← `feature/*` / `bugfix/*`

**Backend**: arquitectura modular por dominio (`modules/<dominio>/{service,controller,routes,model}.ts`). No lógica de negocio en controllers.

**Frontend**: stores de Zustand separados por contexto para evitar prop-drilling; cada componente consume solo lo que necesita.

## Decisiones arquitectónicas ya tomadas

| Tema | Decisión |
|---|---|
| API keys de LLM | El usuario trae su propia key (no se paga desde la plataforma) |
| Historial de chat | Aislado por chat, no compartido entre chats |
| Cloud storage MVP | Solo Google Drive (OneDrive queda para fase 2) |
| Encriptación | AES-256 para API keys guardadas, TLS en tránsito |
| Testing | Jest + Cypress, objetivo 80% coverage |
| Mobile | Fuera de alcance del MVP (web only) |

## Decisiones pendientes (⏳ — no asumir, preguntar si es relevante al task)

- Comunicación entre agentes (agente → agente): recomendado NO en MVP
- Límites de timeout/tokens/retries por ejecución de agente: propuesto 60s / 10k tokens / 3 retries, sin validar
- Webhooks/triggers externos: NO en MVP
- Confirmación en tiempo real antes de que un agente ejecute una acción: NO en MVP (solo logs post-ejecución)
- Versionado de agentes con rollback: NO en MVP

Si una tarea toca alguno de estos puntos, señalarlo explícitamente en vez de asumir un comportamiento.

## Requisitos no funcionales a tener en cuenta

- Rate limiting: 100 req/min por usuario
- Sanitizar inputs (XSS) y usar el ORM para evitar SQL injection
- Chat debe responder <200ms p99; WebSocket <100ms de latencia
- Logging centralizado; no loguear API keys ni datos sensibles en texto plano
