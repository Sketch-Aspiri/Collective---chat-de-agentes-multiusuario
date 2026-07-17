#!/usr/bin/env bash
# test-local.sh — corre la suite de tests de backend y frontend localmente.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "🧪 Tests backend..."
npm run test:backend

echo "🧪 Tests frontend..."
npm run test:frontend

echo "✅ Todos los tests pasaron"
