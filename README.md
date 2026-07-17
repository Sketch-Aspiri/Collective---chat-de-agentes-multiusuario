# agentes-chat

[![CI](https://github.com/Sketch-Aspiri/Collective---chat-de-agentes-multiusuario/actions/workflows/ci.yml/badge.svg)](https://github.com/Sketch-Aspiri/Collective---chat-de-agentes-multiusuario/actions/workflows/ci.yml)
[![Build](https://github.com/Sketch-Aspiri/Collective---chat-de-agentes-multiusuario/actions/workflows/build.yml/badge.svg)](https://github.com/Sketch-Aspiri/Collective---chat-de-agentes-multiusuario/actions/workflows/build.yml)
[![Format Check](https://github.com/Sketch-Aspiri/Collective---chat-de-agentes-multiusuario/actions/workflows/format.yml/badge.svg)](https://github.com/Sketch-Aspiri/Collective---chat-de-agentes-multiusuario/actions/workflows/format.yml)

Una plataforma de chat multiusuario que integra agentes de IA inteligentes. Invita agentes personalizables mediante @mención para ejecutar tareas complejas usando LLMs conectados a integraciones externas como Google Drive.

📖 Documentación • 🚀 Inicio rápido • 🏗️ Arquitectura • 📋 Requisitos • 🤝 Contribuir


🎯 Características


Chat multiusuario en tiempo real — Conversaciones instantáneas con WebSocket
Agentes inteligentes personalizables — Invoca agentes con @mención para ejecutar tareas
Integración con LLMs — Usa tus propias claves API (Anthropic, OpenAI, etc.)
Almacenamiento en la nube — Conecta con Google Drive para acceso a archivos
Historial aislado — Cada chat tiene su propio contexto, sin compartición
Encriptación de credenciales — AES-256 para API keys almacenadas
Rate limiting y seguridad — Protección contra abuso, sanitización de inputs



🚀 Inicio rápido

Requisitos previos


Node.js 20+ (descargar)
PostgreSQL 15+ (descargar)
Redis 7+ (descargar)
Docker & Docker Compose (opcional, recomendado para desarrollo)


Instalación local


Clonar el repositorio


bash   git clone https://github.com/tu-usuario/agentes-chat.git
   cd agentes-chat


Instalar dependencias


bash   npm install --prefix backend
   npm install --prefix frontend


Levantar servicios locales (Postgres, Redis)


bash   docker-compose up -d


Configurar variables de entorno


bash   # backend/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/agentes_chat
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=tu_secret_aleatorio
   
   # frontend/.env
   VITE_API_URL=http://localhost:3000


Inicializar base de datos


bash   npm run db:migrate --prefix backend
   npm run db:seed --prefix backend    # (opcional) datos de ejemplo


Ejecutar en desarrollo


bash   # Terminal 1 - Backend
   npm run dev --prefix backend
   
   # Terminal 2 - Frontend
   npm run dev --prefix frontend


Acceder a la aplicación


   http://localhost:5173


🏗️ Arquitectura

Stack tecnológico

Backend


Runtime: Node.js 20+ con TypeScript
Framework: Express o Fastify
Base de datos: PostgreSQL 15+ + Prisma ORM
Cache/Sesiones: Redis
Job queue: Bull/BullMQ (ejecución async de agentes)
Comunicación real-time: Socket.io
Autenticación: JWT + Auth0/Firebase Auth


Frontend


Framework: React 18+ + TypeScript
Build tool: Vite
State management: Zustand (app) + TanStack Query (server)
Comunicación: Socket.io-client
Estilos: Tailwind CSS + Shadcn/ui
Routing: React Router
Rendering Markdown: React Markdown


Infraestructura


Containerización: Docker / Docker Compose
Cloud: AWS o Vercel + Supabase
CI/CD: GitHub Actions
Pagos: Stripe
Email: SendGrid / Amazon SES
Búsqueda: ElasticSearch (fase 2)


Estructura del repositorio

agentes-chat/
├── backend/
│   ├── src/
│   │   ├── config/           # Base de datos, Redis, variables de entorno
│   │   ├── middleware/       # Autenticación, manejo de errores, rate limiting
│   │   └── modules/          # Dominios: auth, users, chats, agents
│   │       ├── auth/
│   │       ├── users/
│   │       ├── chats/
│   │       └── agents/
│   ├── tests/                # Jest + Supertest
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React reutilizables
│   │   ├── pages/            # Páginas de la aplicación
│   │   ├── store/            # Zustand stores (auth, chat, agent, ui)
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Funciones utilitarias
│   ├── tests/                # Cypress E2E
│   └── package.json
├── infra/                    # Docker, Kubernetes, Terraform, scripts deploy
├── docs/                     # Documentación del proyecto
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── RUNBOOK.md
├── docker-compose.yml
└── README.md


📋 Requisitos y decisiones arquitectónicas

✅ Ya decidido

TemaDecisiónAPI keys de LLMEl usuario trae su propia key (no se paga desde la plataforma)Historial de chatAislado por chat, no compartido entre chatsCloud storage MVPSolo Google Drive (OneDrive en fase 2)EncriptaciónAES-256 para API keys, TLS en tránsitoTestingJest + Cypress, objetivo 80% coverageScope MVPWeb only (mobile queda para más adelante)

⏳ Pendiente de definir


Comunicación entre agentes (A → A)
Límites de timeout/tokens/retries por ejecución
Webhooks/triggers externos
Confirmación en tiempo real antes de ejecuciones
Versionado de agentes con rollback



⚠️ Estas decisiones no son asumidas. Si trabajas en una tarea que las afecta, consulta antes de implementar.



Non-functional Requirements


Rate limiting: 100 req/min por usuario
Latencia chat: <200ms (p99)
Latencia WebSocket: <100ms
Coverage de tests: 80% objetivo
Seguridad: Sanitizar inputs (XSS), usar ORM (SQL injection), no loguear credenciales



📖 Documentación


ARCHITECTURE.md — Diseño técnico detallado
API.md — Endpoints REST y WebSocket
DEPLOYMENT.md — Guía de deploy a producción
CONTRIBUTING.md — Guía para contribuidores
RUNBOOK.md — Operación y troubleshooting
CLAUDE.md — Guía para Claude Code



🛠️ Comandos útiles

Instalación y setup

bash# Instalar todas las dependencias
npm install --prefix backend && npm install --prefix frontend

# Levantar servicios (PostgreSQL, Redis)
docker-compose up -d

# Inicializar base de datos
npm run db:migrate --prefix backend
npm run db:seed --prefix backend

Desarrollo

bash# Backend
npm run dev --prefix backend          # Servidor en http://localhost:3000

# Frontend
npm run dev --prefix frontend         # App en http://localhost:5173

# Ambos juntos (en la raíz)
npm run dev

Testing

bash# Tests unitarios backend
npm run test --prefix backend

# Tests E2E frontend
npm run test:e2e --prefix frontend

# Coverage
npm run test:coverage --prefix backend

Linting y formatting

bashnpm run lint --prefix backend && npm run lint --prefix frontend
npm run format --prefix backend && npm run format --prefix frontend

Build para producción

bashnpm run build --prefix backend
npm run build --prefix frontend


🔐 Seguridad


Las API keys de LLM se encriptan con AES-256 antes de guardarse en BD
Las contraseñas se hashean con bcrypt (factor mínimo 12)
Todas las conexiones usan HTTPS/TLS en producción
CORS configurado restrictivamente
Rate limiting por IP y usuario
Inputs sanitizados contra XSS
ORM (Prisma) previene SQL injection
Credenciales y datos sensibles nunca se loguean
Autenticación con JWT (tokens corta duración)



🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:


Fork el repositorio
Crea una rama para tu feature (git checkout -b feature/mi-feature)
Commit con Conventional Commits:


bash   git commit -m "feat(agents): add @mention detection"
   git commit -m "fix(auth): fix JWT expiration bug"


Push a tu fork (git push origin feature/mi-feature)
Abre un Pull Request describiendo los cambios


Lee CONTRIBUTING.md para más detalles.

Convenciones de código

Ramas:


main ← staging ← feature/* / bugfix/*


Backend:


Arquitectura modular por dominio: modules/<dominio>/{service,controller,routes,model}.ts
Lógica de negocio en Service, nunca en Controller


Frontend:


Zustand stores separados por contexto
Componentes consumen solo el estado que necesitan



📄 Licencia

Este proyecto está bajo la licencia MIT. Ver LICENSE para más detalles.


📞 Soporte


📧 Email: support@agentes-chat.com
💬 Discussions: GitHub Discussions
🐛 Issues: GitHub Issues



🚀 Roadmap

MVP (v1.0)


 Chat multiusuario en tiempo real
 Agentes personalizables con @mención
 Integración Google Drive
 Encriptación de credenciales


Fase 2


 Integración OneDrive
 ElasticSearch para búsqueda fulltext
 Webhooks y triggers externos
 Versionado de agentes


Fase 3


 App móvil (iOS/Android)
 Más integraciones (Slack, Microsoft Teams)
 Comunicación entre agentes (A → A)



Hecho con ❤️ por [Tu equipo/nombre]
