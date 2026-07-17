# Seguridad de red y secretos

Prácticas de seguridad de infraestructura de **agentes-chat**. Complementa
[DEPLOYMENT.md](./DEPLOYMENT.md) y [RUNBOOK.md](./RUNBOOK.md).

## Tabla de contenidos
- [Gestión de secretos](#gestión-de-secretos)
- [GitHub Secrets](#github-secrets)
- [CORS](#cors)
- [Rate limiting](#rate-limiting)
- [Headers de seguridad](#headers-de-seguridad)
- [HTTPS / TLS](#https--tls)

---

## Gestión de secretos

- **Nunca** se commitean secretos. `.env`, `.env.backend`, `.env.frontend` y
  `*.log` están en [`.gitignore`](../.gitignore).
- La plantilla pública es [`.env.example`](../.env.example) (solo placeholders).
- Las API keys de LLM de cada usuario se guardan cifradas con **AES-256**
  (`ENCRYPTION_KEY`); TLS en tránsito.
- Validación de entorno al arranque con Zod ([`config/env.ts`](../backend/src/config/env.ts)):
  el proceso falla rápido si falta un secreto requerido.

---

## GitHub Secrets

Configurar en **Settings → Secrets and variables → Actions** del repo. Los
workflows y despliegues consumen estos valores; nunca van en el YAML:

| Secret | Uso |
|---|---|
| `DATABASE_URL` | conexión a Postgres en staging/prod |
| `REDIS_URL` | conexión a Redis |
| `JWT_SECRET` | firma de tokens |
| `ENCRYPTION_KEY` | AES-256 para API keys (≥32 bytes) |
| `DB_PASSWORD` | password de la BD gestionada |
| `SENDGRID_API_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | integraciones |

> En CI los tests usan valores dummy (ver `ci.yml`), nunca secretos reales.

---

## CORS

El backend restringe el origen al frontend configurado (`FRONTEND_URL`), tanto
en Express como en Socket.io — no se refleja cualquier origen:

```ts
app.use(cors({ origin: env.frontendUrl, credentials: true }));
// Socket.io: cors: { origin: env.frontendUrl, credentials: true }
```

En producción, `FRONTEND_URL` debe ser el dominio público del frontend.

---

## Rate limiting

- **Aplicación**: middleware de rate limiting sobre Redis (100 req/min por
  usuario, requisito no funcional).
- **Borde (nginx, producción)**: [`infra/docker/nginx.conf`](../infra/docker/nginx.conf)
  aplica `limit_req_zone ... rate=100r/m` con `burst=20 nodelay` en `/api/`.

---

## Headers de seguridad

- Backend: [`helmet`](https://helmetjs.github.io/) + `x-powered-by` deshabilitado.
- nginx: `X-Frame-Options`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `server_tokens off`.

---

## HTTPS / TLS

- **Local**: HTTP plano (o certificado self-signed si se necesita probar TLS).
- **Staging/Production**: TLS terminado en el proveedor (Vercel/Railway) o en el
  ALB/CloudFront (AWS). nginx del frontend queda detrás del terminador TLS.
- Forzar redirección HTTP→HTTPS y `Strict-Transport-Security` a nivel de borde
  en producción.
