# Deployment

Guía de despliegue de **agentes-chat**. Para levantar el entorno local ver
[SETUP.md](./SETUP.md); para operaciones ver [RUNBOOK.md](./RUNBOOK.md).

## Tabla de contenidos
- [Entornos y ramas](#entornos-y-ramas)
- [Build de imágenes Docker](#build-de-imágenes-docker)
- [Fase 1 — Staging (Vercel + Railway + Supabase)](#fase-1--staging)
- [Fase 2 — Production (AWS)](#fase-2--production)
- [Variables de entorno requeridas](#variables-de-entorno-requeridas)
- [CI/CD](#cicd)

---

## Entornos y ramas

| Entorno | Rama | Trigger |
|---|---|---|
| Staging | `staging` | push → `deploy-staging.yml` |
| Production | `main` | push → `deploy-production.yml` + `build.yml` |

Las ramas de trabajo (`staging-backend`, `staging-frontend`, `staging-devops`)
se integran a `staging` y luego a `main`.

---

## Build de imágenes Docker

Las imágenes de producción se construyen desde la raíz del repo usando el
stage `production` de cada Dockerfile multistage:

```bash
docker build -f infra/docker/Dockerfile.backend  --target production -t agentes-chat-backend:latest  .
docker build -f infra/docker/Dockerfile.frontend --target production -t agentes-chat-frontend:latest .
```

- **Backend** (`production`): imagen Node 20 con solo dependencias de runtime,
  cliente Prisma pre-generado, arranca con `node dist/server.js` (puerto 4000).
- **Frontend** (`production`): estáticos de Vite servidos por nginx
  (ver [`infra/docker/nginx.conf`](../infra/docker/nginx.conf), puerto 80).

El workflow [`build.yml`](../.github/workflows/build.yml) valida ambos builds en
cada push a `main`.

---

## Fase 1 — Staging

Objetivo: entorno de validación barato y rápido.

- **Frontend** → Vercel
- **Backend** → Railway
- **DB** → Supabase (PostgreSQL gestionado)
- **Auth** → Firebase (provisional)

### Vercel (frontend)
1. Conectar el repo en vercel.com.
2. Root directory: `frontend/`.
3. Build command: `npm run build` — Output: `dist/`.
4. Env vars: `VITE_API_URL`, `VITE_SOCKET_URL` apuntando al backend de Railway.

### Railway (backend)
1. Deploy desde GitHub, root `backend/`.
2. Build: `npm ci && npm run build` — Start: `node dist/server.js`.
3. Aplicar migraciones en el deploy: `npx prisma migrate deploy`.
4. Env vars: ver [tabla de abajo](#variables-de-entorno-requeridas).

---

## Fase 2 — Production

Objetivo: infraestructura propia y escalable (post-Sprint 1).

- **Cloud**: AWS (ECS/EC2 + RDS PostgreSQL + ElastiCache Redis + S3).
- **Registro de imágenes**: ECR.
- **Pipeline**: GitHub Actions → build → push a ECR → deploy a ECS.
- **TLS**: terminación en el ALB / CloudFront; nginx del frontend detrás.

> Decisión de proveedor final pendiente de cerrar tras Sprint 1.

---

## Variables de entorno requeridas

Nunca se commitean; se cargan como secretos del proveedor / GitHub Secrets.
Plantilla completa en [`.env.example`](../.env.example).

| Variable | Servicio | Notas |
|---|---|---|
| `DATABASE_URL` | backend | cadena de conexión Postgres |
| `REDIS_URL` | backend | cadena de conexión Redis |
| `JWT_SECRET` | backend | firma de tokens |
| `ENCRYPTION_KEY` | backend | AES-256 para API keys (≥32 bytes) |
| `FRONTEND_URL` | backend | origen permitido por CORS |
| `VITE_API_URL` / `VITE_SOCKET_URL` | frontend | URL pública del backend |

---

## CI/CD

`.github/workflows/`:
- [`ci.yml`](../.github/workflows/ci.yml) — lint + tests (backend con Postgres/Redis, frontend) en cada PR/push.
- [`build.yml`](../.github/workflows/build.yml) — compila apps y construye imágenes Docker en push a `main`.
- [`format.yml`](../.github/workflows/format.yml) — `prettier --check` en cada PR.
- `deploy-staging.yml` / `deploy-production.yml` — despliegue por rama (jobs a completar con el proveedor final).
- `security-scan.yml` — escaneo de dependencias y secretos.
