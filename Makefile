# =========================================================================
# Makefile — atajos para el desarrollo local de agentes-chat
# Requiere: Docker + Docker Compose v2 (docker compose), Node 20+, bash.
# En Windows usar Git Bash o WSL.
# =========================================================================
.PHONY: help setup dev up stop down logs logs-backend logs-frontend logs-db \
        db-reset db-seed test lint format clean ps

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Instala dependencias, crea .env y levanta el stack
	bash scripts/setup.sh

dev: ## Levanta el stack y sigue los logs
	bash scripts/dev.sh

up: ## Levanta el stack en segundo plano
	docker compose up -d

stop down: ## Detiene los servicios (conserva los datos)
	bash scripts/stop.sh

ps: ## Estado de los contenedores
	docker compose ps

logs: ## Sigue los logs de todos los servicios
	bash scripts/logs.sh

logs-backend: ## Sigue los logs del backend
	bash scripts/logs.sh backend

logs-frontend: ## Sigue los logs del frontend
	bash scripts/logs.sh frontend

logs-db: ## Sigue los logs de PostgreSQL
	bash scripts/logs.sh postgres

db-reset: ## Resetea la BD (migrate reset --force) ⚠️ borra datos
	bash scripts/db-reset.sh

db-seed: ## Puebla la BD con datos de prueba
	bash scripts/db-seed.sh

test: ## Corre los tests de backend y frontend
	bash scripts/test-local.sh

lint: ## Linter de backend y frontend
	npm run lint

format: ## Formatea el código con Prettier
	npm run format

clean: ## Detiene el stack, borra volúmenes y node_modules ⚠️ destructivo
	docker compose down -v
	rm -rf node_modules backend/node_modules frontend/node_modules
