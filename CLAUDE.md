# CLAUDE.md

Este archivo guía a Claude Code (claude.ai/code) cuando trabaja en este repositorio.

## Resumen del proyecto

**agentes-chat**: plataforma de chat multiusuario con agentes de IA integrados. Los usuarios crean chats, invitan agentes personalizables (vía `@mención`), y los agentes ejecutan tareas usando LLMs conectados a integraciones externas (Google Drive, y en fases futuras OneDrive, Slack/Teams).

Documentos de referencia del proyecto (si existen en `/docs`):
- `REQUISITOS_AGENTES_CHAT.md` — especificación funcional completa
- `ESTRUCTURA_PROYECTO.md` — árbol de carpetas y dependencias

## Stack tecnológico

**Frontend**
- React 18+ con TypeScript, Vite
- Zustand (state) + TanStack Query (server state)
- Socket.io-client (chat en tiempo real)
- Tailwind CSS + Shadcn/ui
- React Router, React Markdown (render de respuestas del LLM)

**Backend**
- Node.js 20+ con **Express** y TypeScript
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
| Comunicación entre agentes | **SÍ: agentes pueden comunicarse/coordinarse entre sí** |
| Límites de ejecución de agente | **Timeout: 60s | Tokens: 10k | Reintentos: 3** |
| Webhooks/triggers externos | **SÍ: ejecución automática de agentes por eventos externos** |
| Confirmación en tiempo real | **SÍ (Opción A): pausa y espera confirmación antes de acciones críticas** |
| Versionado y rollback de agentes | **SÍ: permitir rollback a versiones anteriores** |
| Framework backend | **Express** (no Fastify) |

## Requisitos no funcionales a tener en cuenta

- Rate limiting: 100 req/min por usuario
- Sanitizar inputs (XSS) y usar el ORM para evitar SQL injection
- Chat debe responder <200ms p99; WebSocket <100ms de latencia
- Logging centralizado; no loguear API keys ni datos sensibles en texto plano

## Detalles de implementación (basado en decisiones confirmadas)

### Comunicación entre agentes
- Los agentes pueden enviarse mensajes dentro de un chat y coordinarse
- Implementar mediante un sistema de eventos dentro de BullMQ (job queue)
- Agente A crea un job → Agente B lo consume y ejecuta
- Historial de comunicación agente-agente se guarda en PostgreSQL

### Ejecución de agentes
- **Timeout**: 60 segundos máximo por ejecución
- **Límite de tokens**: 10,000 tokens por respuesta del LLM
- **Reintentos**: Máximo 3 intentos automáticos en caso de fallo
- Implementar con Bull/BullMQ con `delayed` y `attempts` options

### Webhooks y triggers externos
- Agentes pueden registrar webhooks en servicios externos (Google Drive, etc.)
- Cuando ocurre un evento, se crea un job en BullMQ para ejecutar el agente
- Ejemplo: cambio en Google Drive → webhook → ejecuta agente automáticamente
- Almacenar webhooks registrados en tabla `AgentWebhooks` (PostgreSQL)

### Confirmación en tiempo real (Opción A)
- Antes de ejecutar acciones críticas (eliminar, modificar permisos), el agente pausa y envía un mensaje al chat pidiendo confirmación
- El usuario confirma/rechaza vía UI interactiva (botones)
- Si no hay confirmación en 5 minutos (o timeout configurable), la acción se cancela
- Implementar con Socket.io para comunicación bidireccional en tiempo real

### Versionado y rollback de agentes
- Cada vez que se modifica la configuración de un agente, crear una versión en la tabla `AgentVersions`
- Guardar: versión, timestamp, cambios, usuario que lo hizo
- UI debe permitir ver historial de versiones y rollback a cualquier versión anterior
- La versión "actual" es un foreign key en la tabla `Agents` que apunta a `AgentVersions`
