# CMPC Test - Monorepo

[![Tests Microservicios](https://github.com/rorogallardo/cmpc-test/actions/workflows/test-microservices.yml/badge.svg)](https://github.com/rorogallardo/cmpc-test/actions/workflows/test-microservices.yml)

Monorepo con microservicios NestJS para gestión de biblioteca y autenticación.

## 🧪 Tests y Coverage
 

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm run test:cov

# Tests por servicio
npm run test:auth
npm run test:catalog
npm run test:shared

# Modo watch
npm run test:watch
```

## Estructura del Proyecto

```
cmpc-test/
├── apps/
│   ├── auth-service/          # Microservicio de autenticación y usuarios
│   ├── catalog-service/       # Microservicio de catálogo (libros, ventas)
│   ├── analytics-service/     # Microservicio de analytics, predicciones y reportes
│   ├── analytics-worker/      # Worker para procesamiento asíncrono de analytics
│   └── frontend/              # Aplicación Angular (Puerto 4200)
├── libs/
│   ├── shared/                # Código compartido (entidades, DTOs, interfaces)
│   └── utils/                 # Utilidades compartidas
├── docs/                      # Documentación técnica completa
│   ├── README_DOCS.md         # Índice de documentación
│   ├── ARCHITECTURE.md        # Arquitectura del sistema
│   ├── USE_CASES.md           # Casos de uso con diagramas
│   ├── DATABASE_SCHEMA.md     # Esquema de base de datos
│   ├── SEQUENCE_DIAGRAMS.md   # Diagramas de secuencia
│   ├── COMPONENTS_DEPLOYMENT.md # Componentes y deployment
│   └── bruno/                 # Colección de pruebas API
└── scripts/                   # Scripts de utilidad
```

## Arquitectura

### 🔐 Auth Service (Puerto 3001)
Gestiona la autenticación y administración de usuarios:
- Registro y login de usuarios
- Generación y validación de tokens JWT
- Gestión de roles (USER, ADMIN)
- API de usuarios

### 📚 Catalog Service (Puerto 3002)
Gestiona el catálogo y ventas de la biblioteca:
- **Catálogo:**
  - CRUD de libros con filtros
  - CRUD de autores
  - CRUD de géneros
  - CRUD de editoriales
  - Relaciones entre entidades
- **Ventas:**
  - Sistema completo de gestión de ventas
  - Integración con inventario
  - Publicación de eventos a Kafka/Redpanda
- Validación de tokens JWT del auth-service

### 📊 Analytics Service (Puerto 3003)
Servicio dedicado a analytics, predicciones, reportes y alertas:
- **Analytics en Tiempo Real:**
  - Dashboard con métricas actualizadas
  - Análisis de ventas por período
  - Métricas de inventario y rotación
- **Análisis Predictivo:**
  - Predicción de demanda con IA
  - Recomendaciones de reabastecimiento
  - Análisis de tendencias
- **Reportes Avanzados:**
  - Análisis ABC (Pareto)
  - Rentabilidad por categoría
  - Estacionalidad de ventas
  - Rotación de stock
  - Trazabilidad de cambios (Audit Trail)
- **Sistema de Alertas:**
  - Alertas automáticas de stock bajo (cron jobs)
  - Detección de alta demanda
  - Identificación de baja rotación
  - Notificaciones de reabastecimiento

### ⚙️ Analytics Worker (Procesamiento Asíncrono)
Worker que consume eventos de Kafka para procesamiento en background:
- Actualización automática de analytics de libros
- Sincronización de inventario post-venta
- Generación de predicciones de demanda
- Creación de movimientos de stock
- Cálculo de métricas de rotación

### 📦 Shared Library
Biblioteca compartida que contiene:
- **Entidades de TypeORM:**
  - Catálogo: User, Book, Author, Genre, Publisher
  - Ventas: Sale, SaleItem
  - Inventario: Inventory, StockMovement, InventorySnapshot
  - Analytics: BookAnalytics, Alert
  - Auditoría: AuditLog
- **DTOs de validación:** CreateDto, UpdateDto, FilterDto
- **Interfaces TypeScript** para todos los módulos
- **Interceptores:** AuditInterceptor para trazabilidad
- **Configuración compartida:** Winston logger, JWT strategy
- Código reutilizable entre microservicios y frontend

## Instalación

```bash
# Instalar todas las dependencias del monorepo
npm install
```

## Configuración

### Variables de Entorno

El proyecto usa un archivo `.env` global en la raíz del monorepo:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### Generar Claves JWT

El sistema usa **criptografía asimétrica (RS256)** para JWT:
- Auth-service firma tokens con la **clave privada**
- Otros servicios validan con la **clave pública**

```bash
# Generar el par de claves
./scripts/generate-jwt-keys.sh

# Copiar las claves generadas al archivo .env
```

O manualmente con OpenSSL:
```bash
# Generar clave privada
openssl genrsa -out jwt.private.pem 4096

# Generar clave pública
openssl rsa -in jwt.private.pem -pubout -out jwt.public.pem

# Convertir a formato para .env (con \n)
awk '{printf "%s\\n", $0}' jwt.private.pem
awk '{printf "%s\\n", $0}' jwt.public.pem
```

**Variables importantes:**
- `JWT_PRIVATE_KEY`: Clave privada RSA (solo para auth-service)
- `JWT_PUBLIC_KEY`: Clave pública RSA (compartida, para validar)
- `AUTH_PORT`, `CATALOG_PORT` y `ANALYTICS_WORKER_PORT` : Puertos de cada servicio
- `DB_*`: Configuración de la base de datos PostgreSQL compartida

## Base de Datos

Los microservicios comparten la misma base de datos PostgreSQL: `cmpc_db`

Crear la base de datos:
```sql
CREATE DATABASE cmpc_db;
```

Las tablas de los servicios coexisten en el mismo schema:
- **Auth Service**: `users`
- **Catalog Service**: 
  - Catálogo: `books`, `authors`, `genres`, `publishers`
  - Ventas: `sales`, `sale_items`
  - Inventario: `inventory`, `stock_movements`, `inventory_snapshots`
  - Analytics: `book_analytics`, `alerts`
  - Auditoría: `audit_logs`

## Infraestructura Kafka/Redpanda

El sistema usa **Redpanda** (API compatible con Kafka) para procesamiento asíncrono:

```bash
# Iniciar Redpanda con Docker Compose
docker-compose up -d

# Verificar que Redpanda esté corriendo
docker-compose ps

# Ver logs
docker-compose logs -f redpanda
```

**Topics creados automáticamente:**
- `sale.created` - Eventos de venta creada
- `sale.completed` - Eventos de venta completada
- `sale.cancelled` - Eventos de venta cancelada

## Ejecución

### Desarrollo

```bash
# 1. Iniciar Redpanda (Kafka)
docker-compose up -d

# 2. Ejecutar auth-service
npm run dev:auth
# o
nx serve auth-service

# 3. Ejecutar catalog-service
npm run dev:catalog
# o
nx serve catalog-service

# 4. Ejecutar analytics-service
nx serve analytics-service

# 5. Ejecutar analytics-worker (opcional, para procesamiento async)
nx serve analytics-worker

# Ver el grafo de dependencias
npm run graph

# Compilar solo los proyectos afectados
npm run affected:build
```

### Producción

```bash
# Build de todos los proyectos
npm run build:all

# Build individual
npm run build:auth
npm run build:catalog
npm run build:analytics
npm run build:analytics-worker

# Start
node dist/apps/auth-service/main.js
node dist/apps/catalog-service/main.js
node dist/apps/analytics-service/main.js
node dist/apps/analytics-worker/main.js
```

## 📚 Documentación Completa

### Documentación Técnica con Diagramas

El proyecto cuenta con documentación técnica completa con más de 50 diagramas Mermaid:

📖 **[Índice de Documentación](docs/README_DOCS.md)** - Punto de entrada a toda la documentación

#### Documentos Principales:

1. **[Arquitectura del Sistema](docs/ARCHITECTURE.md)**
   - Arquitectura de microservicios
   - Flujos de comunicación
   - Infraestructura y deployment
   - Patrones de diseño implementados
   - Stack tecnológico completo

2. **[Casos de Uso](docs/USE_CASES.md)**
   - Diagramas de casos de uso por módulo
   - Flujos de autenticación
   - Procesos de catálogo y ventas
   - Analytics y predicciones
   - Sistema de alertas automáticas

3. **[Esquema de Base de Datos](docs/DATABASE_SCHEMA.md)**
   - Diagrama ER completo (14 tablas)
   - Relaciones entre entidades
   - Índices y optimizaciones
   - Queries comunes
   - Estrategias de migración

4. **[Diagramas de Secuencia](docs/SEQUENCE_DIAGRAMS.md)**
   - Flujos de autenticación JWT
   - Proceso completo de ventas
   - Analytics en tiempo real
   - Generación de predicciones con IA
   - Sistema de alertas con cron jobs

5. **[Componentes y Deployment](docs/COMPONENTS_DEPLOYMENT.md)**
   - Arquitectura de componentes
   - Deployment en desarrollo y producción
   - Estructura del monorepo
   - Diagramas de clases
   - Máquinas de estado

### Documentación API (Swagger)

Cada microservicio tiene su propia documentación Swagger:

- **Auth Service:** http://localhost:3001/api/docs
- **Catalog Service:** http://localhost:3002/api/docs
  - Endpoints de Catálogo (Books, Authors, Genres, Publishers)
  - Endpoints de Ventas (Sales)
- **Analytics Service:** http://localhost:3003/api/docs
  - **Endpoints de Analytics:**
    - `/analytics/dashboard` - Dashboard en tiempo real
    - `/analytics/sales` - Análisis de ventas
    - `/analytics/inventory` - Métricas de inventario
  - **Endpoints Predictivos:**
    - `/predictive/demand/:bookId` - Predicción de demanda
    - `/predictive/demand` - Predicciones para todos los libros
    - `/predictive/restock-recommendations` - Recomendaciones de reabastecimiento
  - **Endpoints de Reportes:**
    - `/reports/abc-analysis` - Análisis ABC (Pareto)
    - `/reports/profitability` - Reporte de rentabilidad
    - `/reports/seasonality` - Análisis de estacionalidad
    - `/reports/stock-rotation` - Rotación de inventario
    - `/reports/audit-trail` - Trazabilidad de cambios
  - **Endpoints de Alertas:**
    - `/alerts` - Gestión de alertas del sistema
    - `/alerts/check` - Verificación manual de alertas

### Colección Bruno (API Client)

Pruebas completas disponibles en `docs/bruno/`:
- Autenticación
- CRUD de Catálogo
- Ventas
- Analytics y Métricas
- Análisis Predictivo
- Reportes Avanzados
- Sistema de Alertas

## Flujo de Autenticación

1. El usuario se registra o inicia sesión en el **auth-service**
2. El auth-service devuelve un token JWT
3. El usuario usa este token para hacer peticiones al **catalog-service**
4. El catalog-service valida el token usando el mismo JWT_SECRET

## Uso de la Librería Compartida

### En los microservicios (NestJS)
```typescript
import { User, LoginDto, RegisterDto } from '@cmpc-test/shared';
```

### En el frontend
```typescript
import { 
  Book, 
  Author, 
  CreateBookDto, 
  FilterBookDto 
} from '@cmpc-test/shared';
```
 20.x
- **Backend Framework**: NestJS 10.x
- **Frontend Framework**: Angular 18.x
- **Base de datos**: PostgreSQL 15
- **ORM**: TypeORM 0.3.x
- **Message Broker**: Redpanda/Kafka (compatible)
- **Autenticación**: Passport + JWT (RS256 - criptografía asimétrica)
- **Validación**: class-validator
- **Documentación**: Swagger/OpenAPI
- **Logger**: Winston (configuración centralizada)
- **IA/ML**: TensorFlow.js (predicciones de demanda)
- **Testing**: Jest 29.x
- **Language**: TypeScript 5.x
- **Validación**: class-validator
- **Documentación**: Swagger
- **Logger**: Winston (configuración centralizada)
- **Package Manager**: npm workspaces

## Logging

El proyecto utiliza **Winston** como sistema de logging, reemplazando el logger por defecto de NestJS.

### Configuración del Nivel de Log

El nivel de log se controla mediante la variable de entorno `LOG_LEVEL`:

```bash
LOG_LEVEL=info    # Recomendado para desarrollo
LOG_LEVEL=warn    # Recomendado para producción
LOG_LEVEL=debug   # Para debugging detallado
```

### Niveles Disponibles

- `error` - Solo errores críticos
- `warn` - Errores y advertencias
- `info` - Información general (default)
- `http` - Logs HTTP
- `verbose` - Información detallada
- `debug` - Debugging
- `silly` - Máximo detalle

### Archivos de Log

Los logs se escriben en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

Para más información, consulta [docs/WINSTON_LOGGER.md](docs/WINSTON_LOGGER.md)

## Scripts Disponibles

```bash
# Desarrollo
npm run dev:auth           # Ejecutar auth-service en modo desarrollo
npm run dev:catalog        # Ejecutar catalog-service en modo desarrollo

# Build
npm run build:auth         # Compilar auth-service
npm run build:catalog      # Compilar catalog-service
npm run build:all          # Compilar todos los proyectos

# Nx
npm run graph              # Ver grafo de dependencias del monorepo
npm run affected:build     # Compilar solo proyectos afectados por cambios
npm run affected:test      # Ejecutar tests de proyectos afectado
npm test                   # Ejecutar tests
```

## Estructura de la Librería Shared

```
libs/shared/
├── src/
│   ├── entities/          # Entidades TypeORM
│   │   ├── user.entity.ts
│   │   ├── book.entity.ts
│   │   ├── author.entity.ts
│   │   ├── genre.entity.ts
│   │   ├── publisher.entity.ts
│   │   ├── sale.entity.ts
│   │   ├── inventory.entity.ts
│   │   ├── stock-movement.entity.ts
│   │   ├── book-analytics.entity.ts
│   │   ├── alert.entity.ts
│   │   ├── audit-log.entity.ts
│   │   └── inventory-snapshot.entity.ts
│   ├── interfaces/        # Interfaces TypeScript
│   ├── dtos/              # DTOs de validación
│   │   ├── auth/          # Login, Register
│   │   ├── books/         # Create, Update, Filter
│   │   ├── authors/       # Create, Update
│   │   ├── genres/        # Create, Update
│   │   └── publishers/    # Create, Update
│   ├── interceptors/      # Interceptores NestJS
│   │   └── audit.interceptor.ts
│   ├── auth/              # Autenticación compartida
│   ├── config/            # Configuraciones
│   │   └── winston.config.ts
│   └── index.ts           # Exports centralizados
```

## 🎯 Características Principales

### Sistema de Ventas con Kafka
- Procesamiento asíncrono de ventas mediante eventos
- Actualización automática de inventario
- Worker dedicado para analytics (analytics-worker)
- Arquitectura desacoplada y escalable

### Analytics Avanzados
- **Dashboard en Tiempo Real:** Métricas actualizadas de ventas e inventario
- **Análisis de Ventas:** Por día, categoría, autor, editorial
- **Métricas de Inventario:** Valor total, rotación, stock crítico

### Análisis Predictivo
- **Predicción de Demanda:** Algoritmo de media móvil exponencial
- **Recomendaciones Inteligentes:** Sugerencias de reabastecimiento
- **Análisis de Tendencias:** Detección de patrones de venta

### Reportes de Negocio
- **Análisis ABC (Pareto):** Clasificación de productos por rentabilidad
- **Rentabilidad:** Análisis de márgenes por categoría/autor/editorial
- **Estacionalidad:** Patrones de venta por mes y día de semana
- **Rotación de Stock:** Identificación de productos de rápido/lento movimiento
- **Audit Trail:** Trazabilidad completa de cambios

### Sistema de Alertas Automáticas (por implementar en el frontend)
- Alertas de stock bajo y sin stock
- Detección de alta demanda
- Identificación de baja rotación
- Recomendaciones de reabastecimiento
- Ejecución automática mediante cron jobs

### Trazabilidad Completa
- Registro automático de todos los cambios
- Valores anteriores y nuevos
- Usuario, IP, timestamp
- Auditoría de CRUD completo

## Resumen Pasos

1. Copiar `.env.example` a `.env` en la raíz del proyecto
2. Generar claves JWT RSA: `./scripts/generate-jwt-keys.sh`
3. Copiar las claves generadas al archivo `.env`
4. Configurar las demás variables de entorno (puertos, base de datos)
5. Crear la base de datos PostgreSQL: `CREATE DATABASE cmpc_db;`
6. Ejecutar `npm install` en la raíz del proyecto
7. Iniciar los microservicios y workers
8. Probar los endpoints con Swagger o Postman
9. Levantar frontend

## Notas Importantes

### Seguridad
- **Criptografía Asimétrica**: Auth-service firma tokens con clave privada, otros servicios solo validan con clave pública
- **Auditoría Completa**: Todos los cambios se registran automáticamente con AuditInterceptor
- Solo auth-service puede crear tokens, otros servicios solo pueden verificarlos

### Arquitectura
- **Base de datos compartida**: Todos los servicios usan la misma base de datos PostgreSQL
- **Event-Driven**: Procesamiento asíncrono mediante Kafka/Redpanda
- **Microservicios independientes**: Pueden escalarse por separado
- **Worker dedicado**: analytics-worker procesa eventos en background sin bloquear requests

### Funcionalidades Avanzadas
- **Analytics en Tiempo Real**: Actualización automática mediante worker de Kafka
- **Predicción de Demanda**: IA para optimizar inventario
- **Sistema de Alertas**: Cron jobs ejecutan verificaciones cada hora
- **Reportes de Negocio**: Análisis ABC, rentabilidad, estacionalidad

### Código Compartido
- La librería `@cmpc-test/shared` puede ser usada tanto en backend como en frontend
- Incluye entidades, DTOs, interfaces, guards, interceptores y configuración
- Todas las configuraciones de entorno están centralizadas en `.env` en la raíz

### Documentación
- **Swagger UI**: Disponible en ambos servicios
- **Bruno Collection**: Tests completos en `docs/bruno/`
- **Documentación detallada**: Ver `docs/` para guías específicas
