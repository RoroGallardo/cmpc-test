# Docker Troubleshooting Guide

## Problemas Comunes y Soluciones

### 1. Puerto en Uso

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3001: bind: address already in use
```

**Solución:**
```bash
# Identificar el proceso que usa el puerto
lsof -i :3001

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en docker-compose.yml
ports:
  - '3011:3001'  # Cambiar puerto externo
```

### 2. Error de Conexión a la Base de Datos

**Error:**
```
ECONNREFUSED 127.0.0.1:5432
```

**Solución:**
```bash
# Verificar que postgres está corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres

# Reiniciar postgres
docker-compose restart postgres

# Verificar la salud
docker exec cmpc-postgres pg_isready -U postgres
```

### 3. Error al Construir Imágenes

**Error:**
```
ERROR [internal] load metadata for docker.io/library/node:20-alpine
```

**Solución:**
```bash
# Limpiar caché de Docker
docker builder prune -a

# Rebuild sin caché
docker-compose build --no-cache

# Verificar espacio en disco
docker system df
```

### 4. Contenedores se Detienen Inmediatamente

**Problema:**
El contenedor inicia pero se detiene de inmediato.

**Solución:**
```bash
# Ver logs del contenedor
docker-compose logs <nombre-servicio>

# Ver los últimos logs antes de cerrarse
docker logs <container-id> --tail 100

# Ejecutar el contenedor en modo interactivo
docker run -it --rm <imagen> /bin/sh
```

### 5. Problemas con Volúmenes

**Error:**
```
Permission denied
```

**Solución:**
```bash
# Eliminar volúmenes y recrear
docker-compose down -v
docker-compose up -d

# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect <volume-name>

# Limpiar volúmenes huérfanos
docker volume prune
```

### 6. Error de Red entre Contenedores

**Error:**
```
getaddrinfo ENOTFOUND postgres
```

**Solución:**
```bash
# Verificar que los servicios están en la misma red
docker network inspect cmpc-network

# Recrear la red
docker-compose down
docker network prune
docker-compose up -d

# Verificar conectividad
docker exec cmpc-auth-service ping postgres
```

### 7. Kafka/Redpanda No Inicia

**Error:**
```
Redpanda healthcheck failed
```

**Solución:**
```bash
# Ver logs de Redpanda
docker-compose logs redpanda

# Limpiar datos de Redpanda
docker-compose down -v
docker-compose up -d redpanda

# Verificar el health manualmente
docker exec cmpc-redpanda rpk cluster health
```

### 8. Memoria Insuficiente

**Error:**
```
Cannot allocate memory
```

**Solución:**
```bash
# Verificar uso de recursos
docker stats

# Aumentar memoria de Docker (Docker Desktop)
# Settings > Resources > Memory

# Limitar memoria por servicio en docker-compose.yml
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
```

### 9. Build Muy Lento

**Problema:**
El build de las imágenes toma mucho tiempo.

**Solución:**
```bash
# Revisar .dockerignore
cat .dockerignore

# Asegurarse de excluir node_modules
echo "node_modules" >> .dockerignore

# Usar BuildKit
DOCKER_BUILDKIT=1 docker-compose build

# Multi-stage builds ya están implementados
```

### 10. Frontend No Carga

**Error:**
Frontend muestra página en blanco o error 404.

**Solución:**
```bash
# Verificar que el build fue exitoso
docker-compose logs frontend

# Verificar archivos en el contenedor
docker exec cmpc-frontend ls -la /usr/share/nginx/html

# Rebuild del frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Verificar nginx
docker exec cmpc-frontend nginx -t
```

### 11. Variables de Entorno No Se Aplican

**Problema:**
Los servicios no leen las variables de entorno.

**Solución:**
```bash
# Verificar variables en el contenedor
docker exec cmpc-auth-service env | grep DATABASE

# Usar archivo .env
cp .env.example .env
# Editar .env con tus valores

# O especificar en docker-compose
docker-compose --env-file .env.production up -d
```

### 12. Healthcheck Falla Constantemente

**Problema:**
El healthcheck marca el servicio como unhealthy.

**Solución:**
```bash
# Ver el healthcheck
docker inspect cmpc-postgres | jq '.[0].State.Health'

# Ejecutar el healthcheck manualmente
docker exec cmpc-postgres pg_isready -U postgres

# Ajustar tiempos en docker-compose.yml
healthcheck:
  interval: 30s   # Aumentar intervalo
  timeout: 10s    # Aumentar timeout
  retries: 10     # Más reintentos
```

### 13. Limpiar Todo y Empezar de Nuevo

**Solución Nuclear:**
```bash
# Detener todo
docker-compose down -v

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar imágenes
docker image prune -a -f

# Limpiar volúmenes
docker volume prune -f

# Limpiar redes
docker network prune -f

# Limpiar todo el sistema
docker system prune -a --volumes -f

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

## Comandos Útiles de Diagnóstico

```bash
# Ver uso de recursos
docker stats

# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Ver logs con timestamps
docker-compose logs -f --timestamps

# Inspeccionar un contenedor
docker inspect <container-name>

# Ver procesos en un contenedor
docker top <container-name>

# Ejecutar comando en contenedor
docker exec -it <container-name> /bin/sh

# Ver espacio usado por Docker
docker system df

# Ver eventos en tiempo real
docker events

# Verificar configuración de docker-compose
docker-compose config
```

## Mejores Prácticas

1. **Usar nombres de contenedor consistentes**
   - Facilita el debugging y la referencia

2. **Implementar healthchecks**
   - Permite a Docker saber cuándo un servicio está realmente listo

3. **Logs estructurados**
   - Usar formato JSON para logs facilita el parsing

4. **Limitar recursos**
   - Evita que un contenedor consuma todos los recursos

5. **Usar .dockerignore**
   - Acelera el build y reduce el tamaño de la imagen

6. **Multi-stage builds**
   - Ya implementados, reduce el tamaño de las imágenes finales

7. **Versionado de imágenes**
   - Usar tags específicos en lugar de `latest`

8. **Backup de volúmenes**
   ```bash
   # Backup de postgres
   docker exec cmpc-postgres pg_dump -U postgres cmpc_db > backup.sql
   
   # Restore
   docker exec -i cmpc-postgres psql -U postgres cmpc_db < backup.sql
   ```

## Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## Soporte

Si encuentras un problema no listado aquí:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica la configuración: `docker-compose config`
3. Busca en los issues de GitHub del proyecto
4. Crea un nuevo issue con:
   - Descripción del problema
   - Logs relevantes
   - Salida de `docker-compose ps`
   - Sistema operativo y versión de Docker
