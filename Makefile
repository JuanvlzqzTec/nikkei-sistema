# Makefile para proyecto Nikkei Sistema
# Variables
FRONTEND_DIR = frontend
BACKEND_DIR = backend
COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
COMPOSE_PROD = docker-compose -f docker-compose.prod.yml

BLUE = \033[36m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
NC = \033[0m 

.PHONY: help install dev build clean test logs backup

help: 
	@echo "$(BLUE)Sistema Nikkei - Comandos Disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Ejemplos de uso:$(NC)"
	@echo "  make install     # Instalar todas las dependencias"
	@echo "  make dev        # Iniciar desarrollo completo"
	@echo "  make logs       # Ver logs en tiempo real"

# Instalación
install: ## Instalar todas las dependencias
	@echo "$(BLUE)Instalando dependencias...$(NC)"
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		echo "$(GREEN)Frontend:$(NC) Instalando dependencias Node.js"; \
		cd $(FRONTEND_DIR) && pnpm install; \
	fi
	@if [ -d "$(BACKEND_DIR)" ]; then \
		echo "$(GREEN)Backend:$(NC) Descargando módulos Go"; \
		cd $(BACKEND_DIR) && go mod download && go mod tidy; \
	fi
	@echo "$(GREEN)Dependencias instaladas correctamente$(NC)"

# Servicios de desarrollo
dev-services: ## Levantar servicios de desarrollo (PostgreSQL, Redis)
	@echo "$(BLUE)Iniciando servicios de desarrollo...$(NC)"
	$(COMPOSE_DEV) up -d postgres redis
	@echo "$(GREEN)Servicios iniciados:$(NC)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"
	@echo "  PgAdmin: http://localhost:5050 (admin@nikkei.dev / admin123)"
	@echo "  Redis Commander: http://localhost:8081"

# Frontend desarrollo
dev-frontend: 
	@echo "$(BLUE)Iniciando frontend (Next.js)...$(NC)"
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		cd $(FRONTEND_DIR) && pnpm dev; \
	else \
		echo "$(RED)Directorio frontend no existe$(NC)"; \
	fi

# Backend desarrollo
dev-backend: 
	@echo "$(BLUE)Iniciando backend (Go + Air)...$(NC)"
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && air; \
	else \
		echo "$(RED)Directorio backend no existe$(NC)"; \
	fi

# Desarrollo completo
dev:
	@echo "$(BLUE)Iniciando desarrollo completo...$(NC)"
	@make dev-services
	@echo ""
	@echo "$(YELLOW)Esperando que los servicios estén listos...$(NC)"
	@sleep 5
	@echo ""
	@echo "$(GREEN)URLs importantes:$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:8080"
	@echo "  PgAdmin: http://localhost:5050"
	@echo "  Redis Commander: http://localhost:8081"
	@echo ""
	@echo "$(YELLOW)En terminales separadas ejecuta:$(NC)"
	@echo "  make dev-frontend    # Terminal 1"
	@echo "  make dev-backend     # Terminal 2"

# Construcción
build: 
	@echo "$(BLUE)Construyendo aplicación...$(NC)"
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		echo "$(GREEN)Frontend:$(NC) Construyendo Next.js"; \
		cd $(FRONTEND_DIR) && pnpm build; \
	fi
	@if [ -d "$(BACKEND_DIR)" ]; then \
		echo "$(GREEN)Backend:$(NC) Compilando binario Go"; \
		cd $(BACKEND_DIR) && go build -ldflags="-w -s" -o bin/nikkei-api ./cmd/main.go; \
	fi
	@echo "$(GREEN)Aplicación construida$(NC)"

# Testing
test: 
	@echo "$(BLUE)Ejecutando tests...$(NC)"
	@make test-frontend
	@make test-backend

test-frontend: 
	@if [ -d "$(FRONTEND_DIR)" ]; then \
		echo "$(GREEN)Frontend:$(NC) Ejecutando tests"; \
		cd $(FRONTEND_DIR) && pnpm test; \
	fi

test-backend: 
	@if [ -d "$(BACKEND_DIR)" ]; then \
		echo "$(GREEN)Backend:$(NC) Ejecutando tests Go"; \
		cd $(BACKEND_DIR) && go test -v ./...; \
	fi

# Base de datos
migrate: ## Ejecutar migraciones de base de datos
	@echo "$(BLUE)Ejecutando migraciones...$(NC)"
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && go run cmd/migrate.go; \
	fi

seed: ## Cargar datos de prueba
	@echo "$(BLUE)Cargando datos de prueba...$(NC)"
	@if [ -d "$(BACKEND_DIR)" ]; then \
		cd $(BACKEND_DIR) && go run cmd/seed.go; \
	fi

# Utilidades
logs: ## Ver logs de todos los servicios
	@echo "$(BLUE)Mostrando logs en tiempo real...$(NC)"
	$(COMPOSE_DEV) logs -f

logs-db: ## Ver logs de PostgreSQL
	$(COMPOSE_DEV) logs -f postgres

logs-redis: ## Ver logs de Redis
	$(COMPOSE_DEV) logs -f redis

# Limpieza

db-connect: ## Conectar directamente a PostgreSQL
	docker exec -it nikkei_postgres_dev psql -U nikkei_user -d nikkei_dev

db-reset: ## Reiniciar base de datos (CUIDADO: borra todos los datos)
	@echo "$(RED)ADVERTENCIA: Esto eliminará TODOS los datos$(NC)"
	@read -p "¿Estás seguro? Escribe 'SI' para continuar: " confirm; \
	if [ "$$confirm" = "SI" ]; then \
		echo "$(YELLOW)Eliminando base de datos...$(NC)"; \
		make clean; \
		make dev-services; \
		sleep 5; \
		echo "$(GREEN)Base de datos reiniciada$(NC)"; \
	else \
		echo "$(YELLOW)Operación cancelada$(NC)"; \
	fi

db-tables: ## Mostrar todas las tablas de la base de datos
	docker exec -it nikkei_postgres_dev psql -U nikkei_user -d nikkei_dev -c "\dt"

db-count: ## Contar registros en todas las tablas
	docker exec -it nikkei_postgres_dev psql -U nikkei_user -d nikkei_dev -c "\
		SELECT schemaname,tablename,n_tup_ins-n_tup_del as rowcount \
		FROM pg_stat_user_tables \
		ORDER BY rowcount DESC;"

clean: ## Limpiar containers y volúmenes de desarrollo
	@echo "$(YELLOW)Limpiando contenedores y volúmenes...$(NC)"
	$(COMPOSE_DEV) down -v --remove-orphans
	@echo "$(GREEN)Limpieza completada$(NC)"

clean-build: ## Limpiar archivos de construcción
	@echo "$(YELLOW)Limpiando archivos de construcción...$(NC)"
	@if [ -d "$(FRONTEND_DIR)/.next" ]; then rm -rf $(FRONTEND_DIR)/.next; fi
	@if [ -d "$(BACKEND_DIR)/bin" ]; then rm -rf $(BACKEND_DIR)/bin; fi
	@echo "$(GREEN)Archivos de construcción eliminados$(NC)"

# Backup y restauración
db-backup: ## Crear backup de la base de datos
	@echo "$(BLUE)Creando backup de la base de datos...$(NC)"
	@mkdir -p backups
	$(COMPOSE_DEV) exec postgres pg_dump -U nikkei_user -d nikkei_dev > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup creado en directorio backups/$(NC)"

db-restore: ## Restaurar backup de base de datos (requiere archivo BACKUP_FILE)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Especifica el archivo: make restore BACKUP_FILE=backups/backup_xxx.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restaurando backup: $(BACKUP_FILE)$(NC)"
	$(COMPOSE_DEV) exec -T postgres psql -U nikkei_user -d nikkei_dev < $(BACKUP_FILE)
	@echo "$(GREEN)Backup restaurado$(NC)"

# Información del sistema
status: ## Mostrar estado de servicios
	@echo "$(BLUE)Estado de servicios:$(NC)"
	$(COMPOSE_DEV) ps

health: ## Verificar salud de servicios
	@echo "$(BLUE)Verificando salud de servicios...$(NC)"
	@echo "$(GREEN)PostgreSQL:$(NC)"
	@$(COMPOSE_DEV) exec postgres pg_isready -U nikkei_user -d nikkei_dev || echo "$(RED)PostgreSQL no disponible$(NC)"
	@echo "$(GREEN)Redis:$(NC)"
	@$(COMPOSE_DEV) exec redis redis-cli ping || echo "$(RED)Redis no disponible$(NC)"

# Setup inicial
setup: ## Configuración inicial del proyecto
	@echo "$(BLUE)Configuración inicial del Sistema Nikkei$(NC)"
	@echo ""
	@echo "$(YELLOW)Este script configurará:$(NC)"
	@echo "  ✓ Estructura de directorios"
	@echo "  ✓ Archivos de configuración"
	@echo "  ✓ Variables de entorno"
	@echo "  ✓ Base de datos inicial"
	@echo ""
	@read -p "¿Continuar? (y/N): " continue; \
	if [ "$$continue" = "y" ] || [ "$$continue" = "Y" ]; then \
		echo "$(GREEN)Iniciando configuración...$(NC)"; \
		make install; \
		make dev-services; \
		sleep 10; \
		make migrate; \
		make seed; \
		echo "$(GREEN)¡Configuración completada!$(NC)"; \
		echo ""; \
		echo "$(BLUE)Próximos pasos:$(NC)"; \
		echo "  1. make dev-frontend    # En terminal 1"; \
		echo "  2. make dev-backend     # En terminal 2"; \
		echo "  3. Abrir http://localhost:3000"; \
	else \
		echo "$(YELLOW)Configuración cancelada$(NC)"; \
	fi

# Información adicional
info: ## Mostrar información del proyecto
	@echo "$(BLUE)Sistema Nikkei - Información del Proyecto$(NC)"
	@echo ""
	@echo "$(GREEN)Stack Tecnológico:$(NC)"
	@echo "  Frontend: Next.js 15 + TypeScript + Tailwind CSS"
	@echo "  Backend: Go + Gin + GORM"
	@echo "  Base de Datos: PostgreSQL + Redis"
	@echo "  DevOps: Docker + Air (live reload)"
	@echo ""
	@echo "$(GREEN)Puertos:$(NC)"
	@echo "  3000 - Frontend (Next.js)"
	@echo "  8080 - Backend API (Go)"
	@echo "  5432 - PostgreSQL"
	@echo "  6379 - Redis"
	@echo "  5050 - PgAdmin"
	@echo "  8081 - Redis Commander"
	@echo ""
	@echo "$(GREEN)Comandos útiles:$(NC)"
	@echo "  make dev           # Desarrollo completo"
	@echo "  make logs          # Ver logs"
	@echo "  make clean         # Limpiar todo"
	@echo "  make help          # Ver todos los comandos"