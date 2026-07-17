# Deployment

## Entornos

- `staging` ← merges a la rama `staging`
- `production` ← merges a la rama `main`

## Local

```bash
docker-compose up -d
npm run dev:backend
npm run dev:frontend
```

## Docker

```bash
docker build -f infra/docker/Dockerfile.backend -t agentes-chat-backend .
docker build -f infra/docker/Dockerfile.frontend -t agentes-chat-frontend .
```

## CI/CD

Ver `.github/workflows/`:
- `ci.yml` — lint + test en cada PR
- `deploy-staging.yml` / `deploy-production.yml` — despliegue por rama (pendiente de completar)
- `security-scan.yml` — escaneo de dependencias y secretos

TODO: definir el proveedor de hosting final (AWS o Vercel+Supabase) y completar los jobs de deploy.
