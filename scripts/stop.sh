#!/usr/bin/env bash
# stop.sh — detiene los servicios sin borrar volúmenes (los datos persisten).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "🛑 Deteniendo servicios (los volúmenes de datos se conservan)..."
docker compose down
echo "✅ Servicios detenidos"
