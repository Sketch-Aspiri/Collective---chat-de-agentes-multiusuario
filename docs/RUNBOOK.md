# Runbook

Operaciones comunes de **agentes-chat** en desarrollo local (Docker Compose).
Para el setup inicial ver [SETUP.md](./SETUP.md); para deploy ver
[DEPLOYMENT.md](./DEPLOYMENT.md).

## Tabla de contenidos
- [Estado del stack](#estado-del-stack)
- [Logs](#logs)
- [Health check](#health-check)
- [Servicio caído](#servicio-caído)
- [Base de datos: backup y restore](#base-de-datos-backup-y-restore)
- [Base de datos: reset y seed](#base-de-datos-reset-y-seed)
- [Escalado](#escalado)
- [Rollback](#rollback)

---

## Estado del stack

```bash
docker compose ps          # estado y salud de los contenedores
make ps                    # atajo equivalente
```

Contenedores: `agentes-chat-db`, `agentes-chat-redis`, `agentes-chat-backend`,
`agentes-chat-frontend`.

---

## Logs

```bash
make logs             # todos los servicios
make logs-backend     # solo backend
make logs-db          # solo PostgreSQL
docker compose logs -f redis
```

> Los logs del backend salen por Winston (JSON en archivo + consola en dev).
> Nunca se loguean API keys ni contraseñas — ver [SECURITY](#).

---

## Health check

```bash
curl http://localhost:4000/health
```

Respuesta `200` = ok; `503` = degradado (revisar campos `database` / `redis`
en el JSON para localizar el subsistema afectado).

---

## Servicio caído

1. `docker compose ps` — identificar el contenedor no saludable.
2. `make logs-<servicio>` — revisar el error.
3. `curl http://localhost:4000/health` — ver qué dependencia falla.
4. Reiniciar el servicio afectado:
   ```bash
   docker compose restart backend
   ```
5. Si persiste, recrear el contenedor:
   ```bash
   docker compose up -d --force-recreate backend
   ```

---

## Base de datos: backup y restore

```bash
# Backup
docker compose exec postgres pg_dump -U postgres agentes_chat > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres agentes_chat < backup.sql
```

---

## Base de datos: reset y seed

```bash
make db-reset    # ⚠️ borra datos: prisma migrate reset --force (migra + siembra)
make db-seed     # solo re-siembra datos de prueba
```

---

## Escalado

```bash
docker compose up -d --scale backend=3
```

> Requiere quitar `container_name` fijo del servicio backend y un balanceador
> delante (nginx) para repartir. Válido para pruebas locales de concurrencia.

---

## Rollback

En local, volver a una versión anterior del código y recrear:

```bash
git checkout <commit-o-tag>
docker compose up -d --build
```

En staging/production el rollback lo gestiona el proveedor (Railway/Vercel:
redeploy de una build previa; AWS ECS: task definition anterior).

> TODO: añadir alertas, dashboards y contactos de guardia cuando exista
> infraestructura de monitoreo (Sentry, etc.).
