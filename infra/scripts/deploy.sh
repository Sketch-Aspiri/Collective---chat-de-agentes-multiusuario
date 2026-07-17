#!/usr/bin/env bash
set -euo pipefail

echo "Building images..."
docker build -f infra/docker/Dockerfile.backend -t agentes-chat-backend .
docker build -f infra/docker/Dockerfile.frontend -t agentes-chat-frontend .

echo "TODO: push images and trigger deployment for the target environment."
