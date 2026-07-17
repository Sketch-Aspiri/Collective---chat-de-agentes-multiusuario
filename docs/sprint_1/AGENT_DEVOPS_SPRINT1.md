# ⚙️ Sprint 1: Agente DevOps / Infraestructura

## Objetivo General
Construir base de infraestructura local con Docker, scripts de setup, CI/CD inicial, y documentación de deploy.

---

## 📋 Tareas Prioritarias

### 1️⃣ **Docker & docker-compose para desarrollo local** [2 días]

**Entregable:**
- ✅ `docker-compose.yml` con PostgreSQL 15+ y Redis
- ✅ `Dockerfile` para backend (multistage)
- ✅ `Dockerfile` para frontend (build + serve)
- ✅ `.dockerignore` optimizado
- ✅ Scripts de inicialización (seeds, migrations)
- ✅ README de setup en `/docs/SETUP.md`

**docker-compose.yml:**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: agentes-chat-db
    environment:
      POSTGRES_DB: ${DB_NAME:-agentes_chat}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: agentes-chat-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: ./infra/backend.Dockerfile
      target: development
    container_name: agentes-chat-backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-dev-secret}
      API_PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: .
      dockerfile: ./infra/frontend.Dockerfile
      target: development
    container_name: agentes-chat-frontend
    environment:
      VITE_API_URL: http://localhost:3000
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

**backend.Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Stage 2: Development
FROM node:20-alpine AS development
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/src ./src
COPY backend/tsconfig.json ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**frontend.Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Development
FROM node:20-alpine AS development
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./infra/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**.env.example:**
```env
# Backend
NODE_ENV=development
API_PORT=3000
JWT_SECRET=your-jwt-secret-change-in-prod
LOG_LEVEL=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=agentes_chat

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_URL=http://localhost:3000
```

**Checklist:**
- ✅ `docker-compose up -d` levanta servicios
- ✅ Healthchecks pasan después de 30s
- ✅ Backend conecta a DB y Redis
- ✅ Frontend accesible en `localhost:5173`
- ✅ Volumes persistidos (DB data, Redis data)
- ✅ Hot-reload funciona en desarrollo
- ✅ Networks entre servicios funcionan
- ✅ `.env` se carga desde archivo

**NO hacer:**
- ❌ Kubernetes (solo Docker local)
- ❌ Secrets en versioncontrol (usar `.env.example`)
- ❌ Production images multistage sin optimizar

---

### 2️⃣ **Scripts de Setup y Utilidad** [1 día]

**Entregable:**
- ✅ `scripts/` con shell scripts de utilidad
- ✅ Makefile para comandos comunes
- ✅ Package.json con scripts root
- ✅ Documentación en README

**Estructura:**
```
scripts/
├── setup.sh          # instalar dependencias, crear .env
├── dev.sh            # docker-compose up + logs
├── stop.sh           # docker-compose down
├── logs.sh           # seguir logs de servicio
├── db-reset.sh       # truncar BD y aplicar migrations
├── db-seed.sh        # popular BD con datos de prueba
└── test-local.sh     # correr tests locales
```

**setup.sh:**
```bash
#!/bin/bash
set -e

echo "🚀 Inicializando agentes-chat..."

# Copiar .env si no existe
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env creado desde .env.example"
fi

# Instalar dependencias
echo "📦 Instalando dependencias backend..."
npm install --prefix backend

echo "📦 Instalando dependencias frontend..."
npm install --prefix frontend

# Levantar servicios
echo "🐳 Levantando Docker services..."
docker-compose up -d

# Esperar a que DB esté lista
echo "⏳ Esperando a PostgreSQL..."
sleep 10

# Aplicar migrations
echo "🗄️ Aplicando migrations..."
npm run migrate --prefix backend

echo "✅ Setup completado!"
echo "▶️ Para desarrollo, corre: npm run dev"
```

**Makefile:**
```makefile
.PHONY: setup dev stop logs db-reset db-seed test lint clean

setup:
	bash scripts/setup.sh

dev:
	docker-compose up -d
	docker-compose logs -f

stop:
	docker-compose down

logs-backend:
	docker-compose logs -f backend

logs-db:
	docker-compose logs -f postgres

db-reset:
	docker-compose exec backend npm run migrate:reset

db-seed:
	docker-compose exec backend npm run db:seed

test:
	docker-compose exec backend npm run test
	docker-compose exec frontend npm run test

lint:
	docker-compose exec backend npm run lint
	docker-compose exec frontend npm run lint

clean:
	docker-compose down -v
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
```

**Checklist:**
- ✅ `make setup` funciona end-to-end
- ✅ `make dev` levanta stack y muestra logs
- ✅ `make stop` detiene sin perder datos
- ✅ `make db-reset` y `make db-seed` funcionan
- ✅ Scripts son ejecutables (`chmod +x scripts/*.sh`)
- ✅ Documentadas todas las variables de entorno

---

### 3️⃣ **CI/CD con GitHub Actions** [2 días]

**Entregable:**
- ✅ Workflow para tests en PR
- ✅ Workflow para build en merge a main
- ✅ Workflow de lint/format
- ✅ Matrix test (Node 20, PostgreSQL 15, Redis 7)
- ✅ Badge de CI en README

**Workflows:**

1. **.github/workflows/test.yml** (PR)
```yaml
name: Tests

on:
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: agentes_chat_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies (backend)
        working-directory: backend
        run: npm ci

      - name: Install dependencies (frontend)
        working-directory: frontend
        run: npm ci

      - name: Lint backend
        working-directory: backend
        run: npm run lint

      - name: Lint frontend
        working-directory: frontend
        run: npm run lint

      - name: Test backend
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/agentes_chat_test
          REDIS_URL: redis://localhost:6379
        run: npm run test

      - name: Test frontend
        working-directory: frontend
        run: npm run test

      - name: Generate coverage report
        working-directory: backend
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
```

2. **.github/workflows/build.yml** (main)
```yaml
name: Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build backend
        working-directory: backend
        run: |
          npm ci
          npm run build

      - name: Build frontend
        working-directory: frontend
        run: |
          npm ci
          npm run build

      - name: Build Docker images
        run: |
          docker build -f infra/backend.Dockerfile --target production -t agentes-chat-backend:latest .
          docker build -f infra/frontend.Dockerfile --target production -t agentes-chat-frontend:latest .
```

3. **.github/workflows/format.yml**
```yaml
name: Format Check

on:
  pull_request:

jobs:
  format:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Check format
        run: npm run format:check
```

**Checklist:**
- ✅ Workflows ejecutan en cada PR
- ✅ Tests pasan antes de merge
- ✅ Coverage mínimo 70% (configurable)
- ✅ Lint pasa sin warnings
- ✅ Build Docker completa sin errores
- ✅ Badges en README muestran estado

---

### 4️⃣ **Documentación de Infraestructura** [1-2 días]

**Entregable:**
- ✅ `/docs/SETUP.md` — desarrollo local
- ✅ `/docs/DEPLOYMENT.md` — guía AWS/Vercel
- ✅ `/docs/RUNBOOK.md` — operaciones comunes
- ✅ `/docs/ARCHITECTURE.md` — diagrama infra
- ✅ `/docs/CONTRIBUTING.md` — para contribuidores

**SETUP.md:**
```markdown
# Development Setup

## Prerequisitos
- Docker 20.10+
- Docker Compose 2.0+
- Node 20+ (opcional, si quieres sin Docker)

## Quickstart

1. Clonar repo:
\`\`\`bash
git clone https://github.com/yourorg/agentes-chat.git
cd agentes-chat
\`\`\`

2. Setup inicial:
\`\`\`bash
make setup
\`\`\`

3. Abrir en navegador:
\`\`\`
http://localhost:5173  # Frontend
http://localhost:3000  # Backend API
\`\`\`

## Comandos útiles

\`\`\`bash
make dev              # Levantar stack
make stop             # Detener servicios
make logs-backend     # Ver logs de backend
make db-reset         # Resetear BD
make test             # Correr tests
\`\`\`

## Troubleshooting

**Error: port 5432 already in use**
\`\`\`bash
# Encontrar y matar proceso
lsof -i :5432
kill -9 <PID>

# O cambiar puerto en .env
DB_PORT=5433
\`\`\`

**Error: migrations failed**
\`\`\`bash
make db-reset
\`\`\`

Ver `/docs/TROUBLESHOOTING.md` para más.
```

**DEPLOYMENT.md:**
```markdown
# Deployment Guide

## Fases

### Fase 1: Staging (semana 2-3 del sprint)
- Cloud: Vercel (frontend) + Railway (backend)
- DB: Supabase PostgreSQL
- Auth: Firebase (provisional)

### Fase 2: Production (post-Sprint 1)
- Cloud: AWS (EC2 + RDS + S3)
- CI/CD: GitHub Actions → ECR → ECS

## Vercel (Frontend)

1. Conectar repo en vercel.com
2. Seleccionar `frontend/` como root
3. Build: `npm run build`
4. Env vars: copiar de `.env.example`

## Railway (Backend)

1. Deploy desde GitHub
2. Build: `npm run build`
3. Start: `node dist/server.js`
4. Env vars: DATABASE_URL, REDIS_URL, JWT_SECRET

Ver `/docs/DEPLOYMENT.md` para AWS y production.
```

**RUNBOOK.md:**
```markdown
# Operations Runbook

## Backup BD

\`\`\`bash
docker-compose exec postgres pg_dump -U postgres agentes_chat > backup.sql
\`\`\`

## Restore BD

\`\`\`bash
docker-compose exec -T postgres psql -U postgres < backup.sql
\`\`\`

## Ver logs en tiempo real

\`\`\`bash
docker-compose logs -f backend
docker-compose logs -f postgres
\`\`\`

## Escalar a múltiples replicas

\`\`\`bash
docker-compose up -d --scale backend=3
\`\`\`

## Health check

\`\`\`bash
curl http://localhost:3000/health
\`\`\`
```

**Checklist:**
- ✅ Documentación completa en `/docs/`
- ✅ Cada doc tiene tabla de contenidos
- ✅ Ejemplos de comando copy-paste
- ✅ Screenshots si es necesario
- ✅ Links cruzados entre docs
- ✅ README principal apunta a `/docs/SETUP.md`

---

### 5️⃣ **Health Checks y Monitoring Base** [1-2 días]

**Entregable:**
- ✅ Endpoint `/health` en backend
- ✅ Health checks en Docker Compose
- ✅ Logs centralizados con Winston
- ✅ Métricas básicas (request count, latency)
- ✅ Alertas en stderr (Sentry prep)

**backend/src/routes/health.ts:**
```typescript
import { Router, Request, Response } from 'express';
import { db } from '@/config/database';
import { redis } from '@/config/redis';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    redis: 'unknown',
  };

  // Check DB
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (err) {
    checks.database = 'error';
    checks.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch (err) {
    checks.redis = 'error';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});

export default router;
```

**backend/src/config/logger.ts:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'agentes-chat-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

**Checklist:**
- ✅ `GET /health` retorna status correcto
- ✅ Docker health checks funcionan
- ✅ Logs en archivo y console
- ✅ No loguear API keys ni passwords
- ✅ Métricas básicas de request (latency, count)

---

### 6️⃣ **Network Security y Secrets** [1 día]

**Entregable:**
- ✅ `.env` en `.gitignore`
- ✅ GitHub Secrets configurados
- ✅ CORS configurado en backend
- ✅ Rate limiting en nginx (production prep)
- ✅ HTTPS ready (self-signed cert local, TLS en prod)

**backend/src/app.ts (CORS):**
```typescript
import cors from 'cors';

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
```

**infra/nginx.conf (production):**
```nginx
upstream backend {
  server backend:3000;
}

server {
  listen 80;
  server_name _;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
  limit_req zone=api burst=20 nodelay;

  location /api {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

**Checklist:**
- ✅ `.env` en `.gitignore`
- ✅ GitHub Secrets: DB_PASSWORD, JWT_SECRET, etc.
- ✅ CORS solo permite frontend
- ✅ Rate limiting en prod
- ✅ HTTPS ready (TLS certs)

---

## 📌 Dependencias y Orden

1. **Tarea 1** → Base de todo (Docker setup)
2. **Tarea 2** → Facilita Tarea 1 (scripts)
3. **Tarea 3** (CI/CD) puede ser paralelo
4. **Tarea 4** → Documenta todo lo anterior
5. **Tarea 5** → Validar setup
6. **Tarea 6** → Asegurar infraestructura

---

## 🔍 Criterios de Aceptación

- [ ] `docker-compose up -d` levanta stack sin errores
- [ ] `make setup` funciona en máquina limpia (Linux, macOS, Windows+WSL)
- [ ] PostgreSQL y Redis saludan en healthcheck
- [ ] Frontend accesible en `localhost:5173`
- [ ] Backend accesible en `localhost:3000`
- [ ] `GET /health` retorna 200 OK
- [ ] Logs aparecen en console y archivo
- [ ] GitHub Actions corre tests en cada PR
- [ ] Build Docker funciona para staging
- [ ] Documentación `/docs/` es completa y clara
- [ ] `.env` en `.gitignore` y `.env.example` actualizado
- [ ] No hay secrets en versioncontrol
- [ ] CORS configurado para frontend

---

## 📚 Referencias

- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://www.postgresql.org/docs/
- Redis: https://redis.io/docs/
- GitHub Actions: https://docs.github.com/actions
- Winston Logger: https://github.com/winstonjs/winston
- Nginx: https://nginx.org/en/docs/

---

## ⚠️ Notas Importantes

- **Desarrollo**: usar docker-compose para consistencia
- **No push de secrets**: `.env`, `.pem`, tokens → `.gitignore`
- **Health checks**: crítico para orchestration futura (Kubernetes)
- **Logs**: centralizado desde el inicio (fácil debugging)
- **CI/CD**: setup ahora, expande en sprint 2
- **Documentación**: vive en `/docs/`, no en README (para escala)
- **Testing**: GitHub Actions must-pass antes de merge
- **Production**: decidir entre AWS/Vercel después de sprint 1
