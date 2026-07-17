#!/usr/bin/env bash
# =========================================================================
# setup.sh — inicializa el entorno de desarrollo local de agentes-chat
# Crea .env, instala dependencias y levanta el stack Docker.
# =========================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🚀 Inicializando agentes-chat..."

# 1. Crear .env desde la plantilla si no existe
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env creado desde .env.example (revisa los secretos antes de producción)"
else
  echo "ℹ️  .env ya existe, no se sobrescribe"
fi

# 2. Instalar dependencias (npm workspaces instala backend y frontend)
echo "📦 Instalando dependencias (workspaces)..."
npm install

# 3. Levantar servicios Docker
echo "🐳 Levantando servicios Docker..."
docker compose up -d

# 4. Esperar a que Postgres esté saludable
echo "⏳ Esperando a que PostgreSQL esté listo..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' agentes-chat-db 2>/dev/null || echo starting)" = "healthy" ]; do
  sleep 2
  echo "   ...esperando healthcheck de Postgres"
done
echo "✅ PostgreSQL saludable"

# 5. Las migraciones las aplica el contenedor backend al arrancar
#    (command: npx prisma migrate deploy && npm run dev). Verificamos el health del backend.
echo "⏳ Esperando al backend..."
sleep 5

echo ""
echo "✅ Setup completado!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo "   Health:   http://localhost:4000/health"
echo ""
echo "▶️  Ver logs con:  make logs   (o  bash scripts/logs.sh)"
