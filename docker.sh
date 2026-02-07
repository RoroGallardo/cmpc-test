#!/bin/bash

# Script de gestión para Docker Compose de CMPC-TEST
# Uso: ./docker.sh [comando]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
🚀 CMPC-TEST Docker Management Script

Uso: ./docker.sh [comando]

Comandos disponibles:
  start         Inicia todos los servicios
  stop          Detiene todos los servicios
  restart       Reinicia todos los servicios
  build         Construye todas las imágenes
  rebuild       Reconstruye y reinicia todos los servicios
  logs          Muestra logs de todos los servicios
  logs-f        Muestra logs en tiempo real
  status        Muestra el estado de los servicios
  clean         Detiene y elimina contenedores
  clean-all     Limpieza completa (incluye volúmenes e imágenes)
  db            Conecta a la base de datos PostgreSQL
  kafka         Abre la consola de Redpanda
  health        Verifica el health de los servicios
  help          Muestra esta ayuda

Servicios individuales:
  start-infra   Inicia solo infraestructura (postgres, redpanda)
  start-backend Inicia solo servicios backend
  start-frontend Inicia solo frontend

Ejemplos:
  ./docker.sh start
  ./docker.sh logs-f auth-service
  ./docker.sh rebuild
EOF
}

# Función para verificar si docker-compose está disponible
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "El daemon de Docker no está corriendo"
        exit 1
    fi
}

# Función para iniciar servicios
start_services() {
    print_info "Iniciando servicios..."
    docker-compose up -d
    print_success "Servicios iniciados"
    show_status
}

# Función para detener servicios
stop_services() {
    print_info "Deteniendo servicios..."
    docker-compose down
    print_success "Servicios detenidos"
}

# Función para reiniciar servicios
restart_services() {
    print_info "Reiniciando servicios..."
    docker-compose restart
    print_success "Servicios reiniciados"
}

# Función para construir imágenes
build_images() {
    print_info "Construyendo imágenes..."
    docker-compose build
    print_success "Imágenes construidas"
}

# Función para rebuild completo
rebuild_services() {
    print_info "Reconstruyendo y reiniciando servicios..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Servicios reconstruidos y reiniciados"
    show_status
}

# Función para mostrar logs
show_logs() {
    if [ -n "$1" ]; then
        docker-compose logs "$1"
    else
        docker-compose logs --tail=100
    fi
}

# Función para mostrar logs en tiempo real
show_logs_follow() {
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Función para mostrar estado
show_status() {
    print_info "Estado de los servicios:"
    docker-compose ps
}

# Función para limpieza
clean_services() {
    print_warning "Limpiando contenedores..."
    docker-compose down --remove-orphans
    print_success "Contenedores eliminados"
}

# Función para limpieza completa
clean_all() {
    print_warning "¿Estás seguro de realizar una limpieza completa? (s/N)"
    read -r response
    if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
        print_info "Realizando limpieza completa..."
        docker-compose down -v --rmi all --remove-orphans
        print_success "Limpieza completa realizada"
    else
        print_info "Limpieza cancelada"
    fi
}

# Función para conectar a la base de datos
connect_db() {
    print_info "Conectando a PostgreSQL..."
    docker exec -it cmpc-postgres psql -U postgres -d cmpc_db
}

# Función para abrir consola Kafka
open_kafka_console() {
    print_info "Abriendo consola de Redpanda en el navegador..."
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8080
    elif command -v open &> /dev/null; then
        open http://localhost:8080
    else
        print_info "Abre manualmente: http://localhost:8080"
    fi
}

# Función para verificar health
check_health() {
    print_info "Verificando salud de los servicios..."
    
    services=("auth-service:3001" "catalog-service:3002" "analytics-service:3003" "frontend:4200")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if curl -f -s -o /dev/null "http://localhost:$port/health" 2>/dev/null || \
           curl -f -s -o /dev/null "http://localhost:$port" 2>/dev/null; then
            print_success "$name está saludable"
        else
            print_warning "$name no responde en puerto $port"
        fi
    done
}

# Función para iniciar solo infraestructura
start_infra() {
    print_info "Iniciando infraestructura..."
    docker-compose up -d postgres redpanda console
    print_success "Infraestructura iniciada"
}

# Función para iniciar solo backend
start_backend() {
    print_info "Iniciando servicios backend..."
    docker-compose up -d postgres redpanda auth-service catalog-service analytics-service analytics-worker
    print_success "Servicios backend iniciados"
}

# Función para iniciar solo frontend
start_frontend() {
    print_info "Iniciando frontend..."
    docker-compose up -d frontend
    print_success "Frontend iniciado"
}

# Main
check_docker

case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    build)
        build_images
        ;;
    rebuild)
        rebuild_services
        ;;
    logs)
        show_logs "$2"
        ;;
    logs-f)
        show_logs_follow "$2"
        ;;
    status)
        show_status
        ;;
    clean)
        clean_services
        ;;
    clean-all)
        clean_all
        ;;
    db)
        connect_db
        ;;
    kafka)
        open_kafka_console
        ;;
    health)
        check_health
        ;;
    start-infra)
        start_infra
        ;;
    start-backend)
        start_backend
        ;;
    start-frontend)
        start_frontend
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
