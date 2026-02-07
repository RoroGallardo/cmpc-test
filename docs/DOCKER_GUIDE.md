# Docker Compose - Guía de Uso

## 🚀 Inicio Rápido

### Levantar todos los servicios

```bash
docker-compose up -d
```

### Levantar servicios específicos

```bash
# Solo base de datos y Kafka
docker-compose up -d postgres redpanda console

# Solo servicios backend
docker-compose up -d postgres redpanda auth-service catalog-service analytics-service analytics-worker

# Solo frontend
docker-compose up -d frontend
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f auth-service
docker-compose logs -f catalog-service
docker-compose logs -f analytics-service
docker-compose logs -f analytics-worker
docker-compose logs -f frontend
```

### Detener servicios

```bash
# Detener todos
docker-compose down

# Detener y eliminar volúmenes (limpia la base de datos)
docker-compose down -v
```

### Rebuild de servicios

```bash
# Rebuild de todos los servicios
docker-compose build

# Rebuild de un servicio específico
docker-compose build auth-service

# Rebuild y reiniciar
docker-compose up -d --build
```

## 📦 Servicios Disponibles

### Infraestructura

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| postgres | 5433 | Base de datos PostgreSQL |
| redpanda | 19092 | Broker Kafka (API externa) |
| console | 8080 | Consola web de Redpanda |

### Aplicaciones

| Servicio | Puerto | Documentación API |
|----------|--------|-------------------|
| auth-service | 3001 | http://localhost:3001/api/docs |
| catalog-service | 3002 | http://localhost:3002/api/docs |
| analytics-service | 3003 | http://localhost:3003/api/docs |
| analytics-worker | - | Worker Kafka (sin HTTP) |
| frontend | 4200 | http://localhost:4200 |

## 🔧 Variables de Entorno

Las variables de entorno están configuradas en el `docker-compose.yml`. Para personalizarlas, puedes crear un archivo `.env`:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cmpc_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d

# Kafka
KAFKA_BROKERS=redpanda:9092
```

## 🛠️ Desarrollo

### Modo desarrollo local (sin Docker)

```bash
# Iniciar base de datos y Kafka
docker-compose up -d postgres redpanda console

# Ejecutar servicios localmente
npm run dev:auth
npm run dev:catalog
npm run dev:analytics
npm run dev:analytics-worker
npm run dev:frontend
```

### Conectar a la base de datos

```bash
# Usando psql
docker exec -it cmpc-postgres psql -U postgres -d cmpc_db

# O desde tu máquina local
psql -h localhost -p 5433 -U postgres -d cmpc_db
```

### Ver tópicos de Kafka

Accede a la consola de Redpanda en: http://localhost:8080

## 📊 Monitoreo

### Estado de los contenedores

```bash
docker-compose ps
```

### Uso de recursos

```bash
docker stats
```

### Inspeccionar logs de error

```bash
docker-compose logs --tail=100 | grep -i error
```

## 🧹 Limpieza

### Limpiar contenedores detenidos

```bash
docker-compose down
```

### Limpiar volúmenes y red

```bash
docker-compose down -v --remove-orphans
```

### Limpiar imágenes build

```bash
docker-compose down --rmi all
```

## ⚠️ Troubleshooting

### Error de puerto en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3001
lsof -i :5433

# Cambiar el puerto en docker-compose.yml
```

### Error de conexión a base de datos

```bash
# Verificar que postgres esté corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres
```

### Rebuil completo

```bash
# Detener todo
docker-compose down -v

# Limpiar imágenes
docker-compose down --rmi all

# Rebuild y start
docker-compose up -d --build
```

## 🚀 Deployment

Para producción, considera:

1. Usar secretos en lugar de variables en texto plano
2. Configurar healthchecks
3. Usar volúmenes named para persistencia
4. Configurar límites de recursos
5. Implementar logging centralizado
6. Usar reverse proxy (nginx/traefik)

## 📝 Notas

- Los servicios están en la red `cmpc-network` y pueden comunicarse entre sí por nombre
- Los datos de PostgreSQL persisten en el volumen `postgres_data`
- Los datos de Redpanda persisten en el volumen `redpanda_data`
- El frontend usa nginx para servir los assets estáticos
- El analytics-worker es un consumer de Kafka sin puerto HTTP
