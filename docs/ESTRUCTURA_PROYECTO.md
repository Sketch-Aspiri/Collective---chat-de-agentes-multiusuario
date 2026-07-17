# ESTRUCTURA DE PROYECTO RECOMENDADA

```
agentes-chat/
│
├── README.md                          # Overview del proyecto
├── .env.example                       # Variables de entorno (plantilla)
├── .gitignore
├── package.json                       # Dependencias Node
├── tsconfig.json                      # TypeScript config
├── docker-compose.yml                 # Local dev: PostgreSQL, Redis, etc
│
├── docs/                              # Documentación técnica
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── RUNBOOK.md
│   └── CONTRIBUTING.md
│
├── backend/                           # Express/Fastify API
│   ├── src/
│   │   ├── index.ts                  # Entry point
│   │   ├── config/
│   │   │   ├── database.ts           # PostgreSQL connection
│   │   │   ├── redis.ts              # Redis cache
│   │   │   └── env.ts                # Environment variables
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT validation
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── logging.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.model.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.routes.ts
│   │   │   │   └── users.model.ts
│   │   │   │
│   │   │   ├── chats/
│   │   │   │   ├── chats.service.ts
│   │   │   │   ├── chats.controller.ts
│   │   │   │   ├── chats.routes.ts
│   │   │   │   └── chats.model.ts
│   │   │   │
│   │   │   ├── agents/
│   │   │   │   ├── agents.service.ts
│   │   │   │   ├── agents.controller.ts
│   │   │   │   ├── agents.routes.ts
│   │   │   │   ├── agents.model.ts
│   │   │   │   └── agent-execution.ts  # Lógica de llamadas a LLMs
│   │   │   │
│   │   │   ├── messages/
│   │   │   │   ├── messages.service.ts
│   │   │   │   ├── messages.controller.ts
│   │   │   │   ├── messages.routes.ts
│   │   │   │   └── messages.model.ts
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── billing.service.ts
│   │   │   │   ├── billing.controller.ts
│   │   │   │   ├── billing.routes.ts
│   │   │   │   └── stripe.integration.ts
│   │   │   │
│   │   │   └── webhooks/
│   │   │       ├── webhooks.controller.ts
│   │   │       └── webhooks.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── openai.service.ts
│   │   │   │   ├── anthropic.service.ts
│   │   │   │   ├── google.service.ts
│   │   │   │   └── llm.interface.ts
│   │   │   │
│   │   │   ├── storage/
│   │   │   │   ├── google-drive.service.ts
│   │   │   │   ├── s3.service.ts
│   │   │   │   └── storage.interface.ts
│   │   │   │
│   │   │   ├── memory/
│   │   │   │   ├── agent-memory.service.ts  # Redis
│   │   │   │   └── memory.interface.ts
│   │   │   │
│   │   │   ├── encryption/
│   │   │   │   └── crypto.service.ts        # AES-256
│   │   │   │
│   │   │   ├── email/
│   │   │   │   └── sendgrid.service.ts
│   │   │   │
│   │   │   └── job-queue/
│   │   │       └── bull.service.ts          # Async tasks
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   ├── errors.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── websocket/
│   │   │   └── socket-server.ts            # Socket.io setup
│   │   │
│   │   └── types/
│   │       ├── index.ts
│   │       ├── User.ts
│   │       ├── Chat.ts
│   │       ├── Agent.ts
│   │       ├── Message.ts
│   │       └── api-responses.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # Definición del modelo de datos
│   │   └── migrations/                 # Cambios de schema (versionados)
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── auth.test.ts
│   │   │   ├── agents.test.ts
│   │   │   └── ...
│   │   ├── integration/
│   │   │   ├── chat-flow.test.ts
│   │   │   ├── agent-execution.test.ts
│   │   │   └── ...
│   │   └── fixtures/
│   │       └── seed-data.ts
│   │
│   └── .env.backend
│
├── frontend/                          # React + Vite
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── ChatPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AgentSetupPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── LoginPage.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── Thread.tsx
│   │   │   │   └── ChatHeader.tsx
│   │   │   │
│   │   │   ├── Agents/
│   │   │   │   ├── AgentList.tsx
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   ├── CreateAgentForm.tsx
│   │   │   │   └── AgentStatus.tsx
│   │   │   │
│   │   │   ├── Common/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Button.tsx
│   │   │   │
│   │   │   └── Forms/
│   │   │       ├── CreateChatForm.tsx
│   │   │       ├── InviteMembersForm.tsx
│   │   │       └── BillingForm.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useAgents.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useNotifications.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance + endpoints
│   │   │   ├── auth.service.ts
│   │   │   ├── socket.service.ts    # WebSocket
│   │   │   └── storage.service.ts   # LocalStorage
│   │   │
│   │   ├── store/
│   │   │   ├── useStore.ts          # Zustand
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   ├── agentStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts             # Types compartidos con backend
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── themes.css
│   │   │   └── components.css
│   │   │
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   ├── validators.ts
│   │   │   └── logger.ts
│   │   │
│   │   └── constants/
│   │       ├── api.ts
│   │       ├── messages.ts
│   │       └── config.ts
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── hooks.test.tsx
│   │   │   └── components.test.tsx
│   │   └── e2e/
│   │       ├── chat-flow.spec.ts
│   │       └── agent-execution.spec.ts
│   │
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.frontend
│
├── mobile/                            # React Native (Fase 2)
│   ├── app/
│   ├── src/
│   └── package.json
│
├── infra/                             # Infraestructura
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── Dockerfile.nginx
│   │
│   ├── kubernetes/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   │
│   ├── terraform/                     # IaC para AWS/GCP
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── rds.tf
│   │   ├── redis.tf
│   │   └── iam.tf
│   │
│   └── scripts/
│       ├── deploy.sh
│       ├── rollback.sh
│       └── backup.sh
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Testing + lint
│   │   ├── deploy-staging.yml
│   │   ├── deploy-production.yml
│   │   └── security-scan.yml
│   │
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
└── CHANGELOG.md
```

---

## DESCRIPCIÓN DE DIRECTORIOS CLAVE

### `/backend/src/modules/`
Cada módulo es auto-contenido:
- **Service:** Lógica de negocio
- **Controller:** HTTP handlers
- **Routes:** Endpoints
- **Model:** Tipos + DB schema

Ventaja: Escalable. Agregar módulo nuevo = copiar estructura.

### `/backend/src/services/llm/`
Interface común para todos los LLMs:
```typescript
// llm.interface.ts
export interface ILLMProvider {
  sendMessage(prompt: string, context: any): Promise<string>;
  callTool(toolName: string, args: any): Promise<any>;
  getTokenCount(text: string): number;
}

// openai.service.ts
export class OpenAIService implements ILLMProvider { ... }

// anthropic.service.ts
export class AnthropicService implements ILLMProvider { ... }
```

Ventaja: Agregar nuevo LLM = nuevo archivo, sin tocar el resto.

### `/frontend/store/`
Zustand stores separadas por contexto:
- `authStore`: Usuario + autenticación
- `chatStore`: Chats, mensajes, threads
- `agentStore`: Agentes del chat
- `uiStore`: Modales, notificaciones, sidebar

Evita prop-drilling. Cada componente toma solo lo que necesita.

### `/infra/`
Infraestructura como código:
- **Docker:** Containerización local
- **Kubernetes:** Orquestación en prod (si escala)
- **Terraform:** AWS/GCP provisioning automatizado
- **Scripts:** Deploy, rollback, backup

---

## DEPENDENCIAS RECOMENDADAS (MVP)

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "fastify": "^4.20.0",                // O Express, elegir uno
    "typescript": "^5.0.0",
    "prisma": "^5.0.0",                  // ORM
    "@prisma/client": "^5.0.0",
    "socket.io": "^4.6.0",               // WebSocket
    "jsonwebtoken": "^9.0.0",            // JWT
    "bcryptjs": "^2.4.3",                // Hashing
    "redis": "^4.6.0",                   // Cache
    "axios": "^1.4.0",                   // HTTP client (LLM APIs)
    "stripe": "^12.0.0",                 // Billing
    "bull": "^4.10.0",                   // Job queue
    "winston": "^3.8.0",                 // Logging
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@testing-library/jest-dom": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "supertest": "^6.3.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "zustand": "^4.3.0",                 // State management
    "@tanstack/react-query": "^4.0.0",   // Server state
    "axios": "^1.4.0",                   // HTTP
    "socket.io-client": "^4.6.0",        // WebSocket
    "react-router-dom": "^6.0.0",        // Routing
    "tailwindcss": "^3.3.0",             // Styling
    "clsx": "^1.2.0",                    // Classname utility
    "recharts": "^2.7.0",                // Charts (para futuro analytics)
    "react-markdown": "^8.0.0"           // Render markdown desde LLMs
  }
}
```

---

## FLUJO DE TRABAJO (Git)

### Ramas
```
main
  └── staging (merge de features validadas)
       └── feature/chat-messages (Sprint 1)
       └── feature/agents-creation (Sprint 2)
       └── bugfix/auth-flow (Sprint 1)
```

### Commit format
```
feat(agents): add @mention detection
fix(auth): fix JWT expiration bug
docs(readme): update API endpoints
style(frontend): format components
```

---

## PRÓXIMOS PASOS

1. **Clonar repo vacío** (inicializar Git)
2. **Copiar estructura** a la carpeta raíz
3. **Instalar dependencias:** `npm install` en `/backend` y `/frontend`
4. **Setup local dev:** `docker-compose up` (PostgreSQL, Redis, etc)
5. **Crear primera PR:** Configuración inicial de TypeScript + ESLint
6. **Comenzar Sprint 1:** Primeros tickets en orden de prioridad
