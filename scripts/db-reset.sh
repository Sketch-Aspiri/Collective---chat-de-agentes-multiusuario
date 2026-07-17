#!/usr/bin/env bash
# db-reset.sh — resetea la base de datos: borra el esquema, reaplica migraciones y seeds.
# ⚠️  Destruye todos los datos de la BD de desarrollo.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "⚠️  Esto BORRARÁ todos los datos de la base de datos de desarrollo."
echo "🗄️  Reseteando base de datos (prisma migrate reset)..."
docker compose exec backend npx prisma migrate reset --force
echo "✅ Base de datos reseteada, migrada y sembrada"
