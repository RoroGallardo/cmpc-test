# Analytics Service

Microservicio de analytics, predicciones, reportes y alertas para el sistema CMPC.

## 📊 Responsabilidades

Este servicio está dedicado exclusivamente a funcionalidades de análisis, predicción y reporting:

### Analytics
- **Dashboard en tiempo real**: Métricas de ventas, inventario y pedidos
- **Análisis de ventas**: Por período, categoría, autor
- **Métricas de inventario**: Stock disponible, movimientos, valorización

### Predictive Analytics
- **Predicción de demanda**: Algoritmos de forecasting para 7 y 30 días
- **Recomendaciones de reabastecimiento**: Basadas en tendencias y stock actual
- **Análisis de tendencias**: Identificación de patrones de crecimiento/decrecimiento

### Reports
- **Análisis ABC (Pareto)**: Clasificación de productos por rentabilidad
- **Rentabilidad**: Análisis de márgenes por categoría/autor/editorial
- **Estacionalidad**: Patrones de venta por mes y día de semana
- **Rotación de Stock**: Identificación de productos de rápido/lento movimiento
- **Audit Trail**: Trazabilidad completa de cambios

### Alerts
- **Sistema de alertas automáticas**: Ejecutado mediante cron jobs
  - Alertas de stock bajo y sin stock
  - Detección de alta demanda
  - Identificación de baja rotación
  - Recomendaciones de reabastecimiento

## 🚀 Tecnologías

- **NestJS**: Framework de Node.js
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos compartida
- **Winston**: Sistema de logging
- **Swagger**: Documentación automática de API
- **@nestjs/schedule**: Cron jobs para alertas automáticas

## 🏗️ Arquitectura

El Analytics Service es parte de una arquitectura de microservicios:

```
┌─────────────────────┐     ┌─────────────────────┐
│  Catalog Service    │     │  Analytics Service  │
│  (Puerto 3002)      │     │  (Puerto 3003)      │
│                     │     │                     │
│  - Books            │     │  - Dashboard        │
│  - Authors          │     │  - Predictions      │
│  - Genres           │     │  - Reports          │
│  - Publishers       │     │  - Alerts (Cron)    │
│  - Sales            │     │                     │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          └───────────┬───────────────┘
                      │
          ┌───────────▼───────────┐
          │  PostgreSQL Database  │
          │  (Puerto 5433)        │
          └───────────────────────┘
```

## 📦 Instalación

```bash
# Instalar dependencias (desde la raíz del monorepo)
npm install
```

## 🔧 Configuración

Variables de entorno requeridas (archivo `.env` en la raíz):

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=cmpc_db

# Service
PORT=3003
```

## 🏃 Ejecución

```bash
# Desarrollo
npx nx serve analytics-service

# Producción
npx nx build analytics-service
node dist/apps/analytics-service/main.js
```

El servicio estará disponible en:
- API: http://localhost:3003
- Swagger Docs: http://localhost:3003/api/docs

## 🔄 Cron Jobs

El servicio ejecuta automáticamente las siguientes tareas programadas:

- **Alertas automáticas**: Cada hora (`@hourly`)
  - Verificación de stock bajo
  - Detección de productos sin stock
  - Identificación de alta demanda
  - Análisis de baja rotación
  - Recomendaciones de reabastecimiento

## 📡 API Endpoints

### Analytics
- `GET /analytics/dashboard` - Dashboard con métricas en tiempo real
- `GET /analytics/sales` - Análisis de ventas por período
- `GET /analytics/inventory` - Métricas de inventario

### Predictive
- `GET /predictive/:bookId` - Predicción de demanda para un libro
- `GET /predictive/restock-recommendations` - Recomendaciones de reabastecimiento

### Reports
- `GET /reports/abc-analysis` - Análisis ABC (Pareto)
- `GET /reports/profitability` - Análisis de rentabilidad
- `GET /reports/seasonality` - Análisis de estacionalidad
- `GET /reports/stock-rotation` - Rotación de inventario
- `GET /reports/audit-trail` - Trazabilidad de cambios

### Alerts
- `GET /alerts` - Listar alertas activas
- `GET /alerts/:id` - Obtener detalle de alerta
- `PATCH /alerts/:id/acknowledge` - Marcar alerta como reconocida
- `PATCH /alerts/:id/resolve` - Resolver alerta

Ver documentación completa en `/api/docs` cuando el servicio esté en ejecución.

## 🧪 Testing

```bash
# Tests unitarios
npx nx test analytics-service

# Tests con cobertura
npx nx test analytics-service --coverage

# Tests e2e
npx nx e2e analytics-service-e2e
```

## 📚 Documentación Adicional

- [Documentación completa de Analytics API](../../docs/ANALYTICS_API_DOCUMENTATION.md)
- [Colección Bruno](../../docs/bruno/Catalog%20Service/) - Tests de API

## 🤝 Relación con otros servicios

- **Catalog Service**: Comparte la misma base de datos para acceso a datos de catálogo y ventas
- **Analytics Worker**: Procesa eventos de Kafka para actualizar métricas en tiempo real
- **Auth Service**: Utiliza JWT tokens para autenticación (compartidos)

## 🏷️ Principios de diseño

Este servicio sigue el **Principio de Responsabilidad Única (SRP)**:
- Se enfoca exclusivamente en analytics, predicciones y reporting
- No maneja lógica de catálogo ni autenticación
- Consume datos pero no los modifica (read-only para entidades de catálogo)
- Genera y gestiona sus propias entidades (BookAnalytics, Alerts, etc.)
