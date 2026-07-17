#!/usr/bin/env bash
# logs.sh — sigue los logs de un servicio (o de todos si no se pasa argumento).
# Uso: bash scripts/logs.sh [backend|frontend|postgres|redis]
set -euo pipefail
cd "$(dirname "$0")/.."

SERVICE="${1:-}"
if [ -z "$SERVICE" ]; then
  docker compose logs -f
else
  docker compose logs -f "$SERVICE"
fi
