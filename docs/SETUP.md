# Development Setup

Guía para levantar **agentes-chat** en local con Docker.

## Tabla de contenidos
- [Prerequisitos](#prerequisitos)
- [Quickstart (Docker)](#quickstart-docker)
- [Servicios y puertos](#servicios-y-puertos)
- [Variables de entorno](#variables-de-entorno)
- [Comandos útiles](#comandos-útiles)
- [Base de datos (Prisma)](#base-de-datos-prisma)
- [Modo sin Docker (opcional)](#modo-sin-docker-opcional)
- [Troubleshooting](#troubleshooting)

---

## Prerequisitos
- **Docker** 20.10+
- **Docker Compose** v2 (`docker compose`, integrado en Docker Desktop)
- **Node 20+** — solo si quieres correr backend/frontend sin Docker
- En Windows: **Docker Desktop con backend WSL2** iniciado

---

## Quickstart (Docker)

1. **Clonar el repo:**
   ```bash
   git clone <repo-url> agentes-chat
   cd agentes-chat
   ```

2. **Crear el `.env`** a partir de la plantilla:
   ```bash
   cp .env.example .env
   ```
   Los valores por defecto ya funcionan para desarrollo local.

3. **Levantar todo el stack:**
   ```bash
   docker compose up -d --build
   ```
   Esto construye las imágenes y arranca PostgreSQL, Redis, backend y frontend.
   El backend aplica las migraciones de Prisma automáticamente al arrancar
   (`prisma migrate deploy`).

4. **Verificar que los servicios están sanos** (~30s):
   ```bash
   docker compose ps
   ```
   `postgres` y `redis` deben mostrar `(healthy)`.

5. **Abrir en el navegador:**
   - Frontend → http://localhost:5173
   - Backend health → http://localhost:4000/health

---

## Servicios y puertos

| Servicio  | Contenedor              | Puerto host | Puerto interno | Notas |
|-----------|-------------------------|-------------|----------------|-------|
| Frontend  | `agentes-chat-frontend` | 5173        | 5173           | Vite dev server (hot-reload) |
| Backend   | `agentes-chat-backend`  | 4000        | 4000           | Express + Socket.io |
| PostgreSQL| `agentes-chat-db`       | **5433**    | 5432           | 5433 en host para no chocar con un Postgres local |
| Redis     | `agentes-chat-redis`    | 6379        | 6379           | Sesiones, rate limit, colas |

> Dentro de la red de Docker los servicios se resuelven por nombre: el backend
> conecta a `postgres:5432` y `redis:6379`, **no** a `localhost:5433`.

---

## Variables de entorno

Se cargan desde `.env` (nunca commitear; está en `.gitignore`). Plantilla en
[`.env.example`](../.env.example).

| Variable | Descripción | Default dev |
|----------|-------------|-------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del backend | `4000` |
| `DATABASE_URL` | Conexión a Postgres (host) | `postgresql://postgres:postgres@localhost:5433/agentes_chat` |
| `REDIS_URL` | Conexión a Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Secreto de firma JWT (min 8 chars) | `change-me` |
| `JWT_EXPIRES_IN` | Expiración de tokens | `1d` |
| `ENCRYPTION_KEY` | Clave AES para API keys (min 16 chars) | `change-me-32-bytes-min` |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Credenciales del contenedor Postgres | `postgres` / `postgres` / `agentes_chat` |
| `VITE_API_URL` / `VITE_SOCKET_URL` | URL del backend para el frontend | `http://localhost:4000` |

> El `docker-compose.yml` sobreescribe `DATABASE_URL` y `REDIS_URL` con los
> hostnames internos (`postgres`, `redis`) para los contenedores.

---

## Comandos útiles

```bash
# Levantar / reconstruir
docker compose up -d --build

# Ver estado y healthchecks
docker compose ps

# Logs en vivo
docker compose logs -f backend
docker compose logs -f frontend

# Detener sin borrar datos
docker compose down

# Detener y BORRAR volúmenes (resetea la BD)
docker compose down -v

# Ejecutar un comando dentro del backend
docker compose exec backend sh
```

---

## Base de datos (Prisma)

Las tablas las gestiona Prisma. El contenedor de Postgres ejecuta
[`infra/db/init.sql`](../infra/db/init.sql) una sola vez (extensiones
`pgcrypto` y `pg_trgm`) antes de que Prisma aplique las migraciones.

```bash
# Aplicar migraciones manualmente (normalmente lo hace el backend al arrancar)
docker compose exec backend npx prisma migrate deploy

# Poblar la BD con datos de prueba
docker compose exec backend npm run prisma:seed

# Abrir Prisma Studio (desde el host, requiere Node local)
cd backend && npx prisma studio
```

---

## Modo sin Docker (opcional)

Si prefieres correr solo Postgres/Redis en Docker y el código en tu máquina:

```bash
# Solo infraestructura
docker compose up -d postgres redis

# Backend
npm install
npm run dev --workspace backend

# Frontend (otra terminal)
npm run dev --workspace frontend
```

Recuerda que en este modo `DATABASE_URL` usa `localhost:5433`.

---

## Troubleshooting

**`port is already allocated` / puerto ocupado**
```bash
# Ver qué usa el puerto (ej. 4000) y cambiarlo en .env / docker-compose.yml
# Linux/macOS:
lsof -i :4000
# Windows (PowerShell):
Get-NetTCPConnection -LocalPort 4000
```

**El backend no conecta a la BD**
- Espera a que `docker compose ps` muestre `postgres (healthy)`.
- Dentro de contenedores el host es `postgres:5432`, no `localhost:5433`.

**Migraciones fallidas / BD en estado raro**
```bash
docker compose down -v      # borra el volumen de datos
docker compose up -d --build
```

**Hot-reload no funciona en Windows**
- Asegúrate de usar Docker Desktop con WSL2 y tener el repo dentro del sistema
  de archivos de WSL (o habilita polling de Vite si es necesario).

**Reconstruir tras cambiar dependencias**
```bash
docker compose build --no-cache backend
docker compose up -d
```
