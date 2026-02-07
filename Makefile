.PHONY: help start stop restart build rebuild logs logs-f status clean clean-all db kafka health dev-infra dev-backend dev-frontend

# Variables
COMPOSE=docker-compose
COMPOSE_DEV=docker-compose -f docker-compose.dev.yml

help: ## Muestra esta ayuda
	@echo "🚀 CMPC-TEST - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Comandos principales (Producción/Completo)
start: ## Inicia todos los servicios
	@echo "🚀 Iniciando servicios..."
	$(COMPOSE) up -d
	@echo "✅ Servicios iniciados"
	@make status

stop: ## Detiene todos los servicios
	@echo "🛑 Deteniendo servicios..."
	$(COMPOSE) down
	@echo "✅ Servicios detenidos"

restart: ## Reinicia todos los servicios
	@echo "🔄 Reiniciando servicios..."
	$(COMPOSE) restart
	@echo "✅ Servicios reiniciados"

build: ## Construye todas las imágenes
	@echo "🔨 Construyendo imágenes..."
	$(COMPOSE) build
	@echo "✅ Imágenes construidas"

rebuild: ## Reconstruye y reinicia todos los servicios
	@echo "🔨 Reconstruyendo servicios..."
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d
	@echo "✅ Servicios reconstruidos"
	@make status

# Logs
logs: ## Muestra logs de todos los servicios
	$(COMPOSE) logs --tail=100

logs-f: ## Muestra logs en tiempo real
	$(COMPOSE) logs -f

# Estado
status: ## Muestra el estado de los servicios
	@echo "📊 Estado de los servicios:"
	@$(COMPOSE) ps

# Limpieza
clean: ## Detiene y elimina contenedores
	@echo "🧹 Limpiando contenedores..."
	$(COMPOSE) down --remove-orphans
	@echo "✅ Limpieza completa"

clean-all: ## Limpieza completa (incluye volúmenes e imágenes)
	@echo "⚠️  ¿Estás seguro de realizar una limpieza completa? [y/N] " && read ans && [ $${ans:-N} = y ]
	@echo "🧹 Realizando limpieza completa..."
	$(COMPOSE) down -v --rmi all --remove-orphans
	@echo "✅ Limpieza completa realizada"

# Utilidades
db: ## Conecta a la base de datos PostgreSQL
	@echo "🗄️  Conectando a PostgreSQL..."
	docker exec -it cmpc-postgres psql -U postgres -d cmpc_db

kafka: ## Abre la consola de Redpanda
	@echo "📡 Abriendo consola de Redpanda..."
	@command -v xdg-open > /dev/null && xdg-open http://localhost:8080 || \
	 command -v open > /dev/null && open http://localhost:8080 || \
	 echo "Abre manualmente: http://localhost:8080"

health: ## Verifica el health de los servicios
	@echo "🏥 Verificando salud de los servicios..."
	@./docker.sh health

# Desarrollo (solo infraestructura)
dev-start: ## Inicia solo infraestructura (DB + Kafka) para desarrollo
	@echo "🚀 Iniciando infraestructura de desarrollo..."
	$(COMPOSE_DEV) up -d
	@echo "✅ Infraestructura iniciada"
	@echo ""
	@echo "📚 Servicios disponibles:"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - Redpanda (Kafka): localhost:19092"
	@echo "  - Redpanda Console: http://localhost:8080"
	@echo "  - PgAdmin: http://localhost:5050"
	@echo ""
	@echo "Ejecuta los servicios localmente:"
	@echo "  npm run dev:auth"
	@echo "  npm run dev:catalog"
	@echo "  nx serve analytics-service"
	@echo "  nx serve analytics-worker"
	@echo "  npm run dev:frontend"

dev-stop: ## Detiene infraestructura de desarrollo
	@echo "🛑 Deteniendo infraestructura..."
	$(COMPOSE_DEV) down
	@echo "✅ Infraestructura detenida"

dev-logs: ## Muestra logs de infraestructura
	$(COMPOSE_DEV) logs -f

# Servicios específicos (Producción)
start-infra: ## Inicia solo postgres y redpanda
	@echo "🚀 Iniciando infraestructura..."
	$(COMPOSE) up -d postgres redpanda console
	@echo "✅ Infraestructura iniciada"

start-backend: ## Inicia servicios backend
	@echo "🚀 Iniciando backend..."
	$(COMPOSE) up -d postgres redpanda auth-service catalog-service analytics-service analytics-worker
	@echo "✅ Backend iniciado"

start-frontend: ## Inicia solo frontend
	@echo "🚀 Iniciando frontend..."
	$(COMPOSE) up -d frontend
	@echo "✅ Frontend iniciado"

# Tests
test: ## Ejecuta todos los tests
	npm test

test-cov: ## Ejecuta tests con coverage
	npm run test:cov

# Build local
build-all: ## Build de todos los proyectos Nx
	npm run build:all

# Información
info: ## Muestra información de URLs de servicios
	@echo "🌐 URLs de servicios:"
	@echo ""
	@echo "  🔐 Auth Service:      http://localhost:3001/api/docs"
	@echo "  📚 Catalog Service:   http://localhost:3002/api/docs"
	@echo "  📊 Analytics Service: http://localhost:3003/api/docs"
	@echo "  🎨 Frontend:          http://localhost:4200"
	@echo "  📡 Redpanda Console:  http://localhost:8080"
	@echo "  🗄️  PostgreSQL:        localhost:5433"
	@echo ""

# Default
.DEFAULT_GOAL := help
