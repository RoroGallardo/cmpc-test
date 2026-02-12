# Iniciar Servicios para Bookstore Next.js

## Servicios Backend Requeridos

La aplicación Next.js (`bookstore-next`) requiere que los siguientes servicios backend estén corriendo:

### 1. Catalog Service (Puerto 3002)
```bash
npx nx serve catalog-service
```
**Endpoints usados:**
- `GET /catalog/books` - Listar libros
- `GET /catalog/books/:id` - Obtener libro por ID
- `POST /catalog/books` - Crear libro
- `PUT /catalog/books/:id` - Actualizar libro
- `DELETE /catalog/books/:id` - Eliminar libro
- `GET /catalog/authors` - Listar autores
- `GET /catalog/genres` - Listar géneros
- `GET /catalog/publishers` - Listar editoriales

### 2. Analytics Service (Puerto 3003)
```bash
npx nx serve analytics-service
```
**Endpoints usados:**
- `GET /analytics/dashboard` - Métricas del dashboard
- `GET /analytics/sales` - Análisis de ventas
- `GET /analytics/predictions` - Predicciones de ventas

### 3. Auth Service (Puerto 3001)
```bash
npx nx serve auth-service
```
**Endpoints usados:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/profile` - Obtener perfil de usuario
- `GET /users` - Listar usuarios (admin)

### 4. Sales Endpoints (Catalog Service)
El servicio de catalog también maneja ventas:
```bash
# Ya está corriendo si iniciaste catalog-service
```
**Endpoints usados:**
- `GET /sales` - Listar ventas
- `POST /sales` - Crear venta
- `GET /sales/:id` - Obtener venta por ID

## Iniciar Todos los Servicios

### Opción 1: Manualmente (en terminales separadas)
```bash
# Terminal 1 - Auth Service
npx nx serve auth-service

# Terminal 2 - Catalog Service
npx nx serve catalog-service

# Terminal 3 - Analytics Service
npx nx serve analytics-service

# Terminal 4 - Frontend Next.js
npx nx serve bookstore-next
```

### Opción 2: Usando Docker Compose (si está configurado)
```bash
docker-compose up
```

## Verificar que los Servicios Están Corriendo

```bash
# Auth Service
curl http://localhost:3001/health

# Catalog Service
curl http://localhost:3002/catalog/books

# Analytics Service
curl http://localhost:3003/health
```

## Frontend (Puerto 4200)
```bash
npx nx serve bookstore-next
```

Luego abre tu navegador en: http://localhost:4200

## Manejo de Errores

La aplicación frontend ahora está configurada para **NO romperse** si los servicios backend no están disponibles:

- **Dashboard**: Mostrará datos mock (valores en 0) si analytics-service no está disponible
- **Catálogo**: Mostrará un mensaje de error amigable con botón de reintentar
- **Ventas**: Mostrará lista vacía con mensaje de error si el servicio no está disponible
- **Autenticación**: Mostrará errores de login claros

### Errores Comunes

#### Error 404 en `/catalog/books`
**Causa**: El servicio `catalog-service` no está corriendo  
**Solución**: `npx nx serve catalog-service`

#### Error en Dashboard
**Causa**: El servicio `analytics-service` no está corriendo  
**Solución**: `npx nx serve analytics-service`

#### Error de Autenticación
**Causa**: El servicio `auth-service` no está corriendo  
**Solución**: `npx nx serve auth-service`

## Variables de Entorno

El frontend está configurado en `.env.local`:
```bash
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CATALOG_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost:3003
```

Si tus servicios están en puertos diferentes, actualiza estas variables.

## Base de Datos

Asegúrate de que PostgreSQL esté corriendo y las bases de datos estén creadas:
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Si es necesario, ejecutar migraciones
# En cada servicio backend
npm run migration:run
```

## Troubleshooting

### El frontend muestra "sales.map is not a function"
✅ **Solucionado**: Ahora los servicios devuelven arrays vacíos en lugar de errores

### Los estilos no se ven
✅ **Solucionado**: Tailwind CSS v3 configurado correctamente

### Puerto ya en uso
```bash
# Encontrar proceso usando el puerto
lsof -i :4200

# Matar el proceso
kill -9 <PID>
```

## Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS v3
- **Backend**: NestJS, PostgreSQL, Kafka (analytics worker)
- **Autenticación**: JWT tokens
