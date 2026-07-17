#!/usr/bin/env bash
# db-seed.sh — puebla la base de datos con datos de prueba (prisma/seed.ts).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "🌱 Sembrando base de datos con datos de prueba..."
docker compose exec backend npm run prisma:seed
echo "✅ Seed completado"
