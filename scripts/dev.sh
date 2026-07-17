#!/usr/bin/env bash
# dev.sh — levanta el stack en segundo plano y sigue los logs.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "🐳 Levantando stack de desarrollo..."
docker compose up -d
echo "📜 Siguiendo logs (Ctrl+C para dejar de seguir; los servicios siguen corriendo)..."
docker compose logs -f
