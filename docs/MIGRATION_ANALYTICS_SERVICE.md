# Guía de Migración: Analytics a Microservicio Independiente

## 📋 Resumen de Cambios

Se ha refactorizado la arquitectura para extraer todas las funcionalidades de analytics, predicciones, reportes y alertas del `catalog-service` a un nuevo microservicio independiente llamado `analytics-service`.

### Motivación

- **Principio de Responsabilidad Única (SRP)**: Cada servicio debe tener una única responsabilidad bien definida
- **Escalabilidad**: Analytics puede escalar independientemente según la carga de procesamiento
- **Mantenibilidad**: Código más organizado y fácil de mantener
- **Despliegue independiente**: Cambios en analytics no requieren redesplegar el catálogo

## 🏗️ Arquitectura Anterior vs Nueva

### Antes
```
catalog-service (Puerto 3002)
├── books, authors, genres, publishers
├── sales
├── analytics ❌
├── predictive ❌
├── reports ❌
└── alerts ❌
```

### Ahora
```
catalog-service (Puerto 3002)          analytics-service (Puerto 3003)
├── books, authors, genres            ├── analytics ✅
├── publishers                        ├── predictive ✅
└── sales                             ├── reports ✅
                                      └── alerts ✅
```

## 🚨 BREAKING CHANGES

### URLs de Endpoints Modificadas

Todos los endpoints de analytics se han movido del puerto **3002** al puerto **3003**:

#### Analytics
- ~~`http://localhost:3002/analytics/*`~~ → `http://localhost:3003/analytics/*`

#### Predictive
- ~~`http://localhost:3002/predictive/*`~~ → `http://localhost:3003/predictive/*`

#### Reports
- ~~`http://localhost:3002/reports/*`~~ → `http://localhost:3003/reports/*`

#### Alerts
- ~~`http://localhost:3002/alerts/*`~~ → `http://localhost:3003/alerts/*`

## 📦 Cambios en los Servicios

### catalog-service
**Removido:**
- `src/analytics/` (módulo completo)
- `src/predictive/` (módulo completo)
- `src/reports/` (módulo completo)
- `src/alerts/` (módulo completo)

**Mantiene:**
- `src/books/` - Gestión de libros
- `src/authors/` - Gestión de autores
- `src/genres/` - Gestión de géneros
- `src/publishers/` - Gestión de editoriales
- `src/sales/` - Gestión de ventas
- `src/auth/` - Autenticación JWT
- `src/database/` - Seeders y controladores de DB

### analytics-service (NUEVO)
**Agregado:**
- `src/analytics/` - Dashboard y métricas en tiempo real
- `src/predictive/` - Predicciones y forecasting
- `src/reports/` - Reportes de negocio (ABC, rentabilidad, estacionalidad, etc.)
- `src/alerts/` - Sistema de alertas con cron jobs

## 🔧 Cómo Actualizar tu Código

### 1. Variables de Entorno
Agregar nueva variable al archivo `.env`:
```env
ANALYTICS_SERVICE_URL=http://localhost:3003
```

### 2. Configuración de Docker
El `docker-compose.yml` ya incluye el nuevo servicio:
```yaml
analytics-service:
  ports:
    - '3003:3003'
```

### 3. Actualizar llamadas API

Si tienes un cliente frontend o tests que llaman a estos endpoints:

**Antes:**
```typescript
// Analytics
fetch('http://localhost:3002/analytics/dashboard')
fetch('http://localhost:3002/analytics/sales')

// Predictive
fetch('http://localhost:3002/predictive/restock-recommendations')

// Reports
fetch('http://localhost:3002/reports/abc-analysis')

// Alerts
fetch('http://localhost:3002/alerts')
```

**Ahora:**
```typescript
// Analytics
fetch('http://localhost:3003/analytics/dashboard')
fetch('http://localhost:3003/analytics/sales')

// Predictive
fetch('http://localhost:3003/predictive/restock-recommendations')

// Reports
fetch('http://localhost:3003/reports/abc-analysis')

// Alerts
fetch('http://localhost:3003/alerts')
```

### 4. Colección Bruno

La colección de Bruno en `docs/bruno/Catalog Service/` necesita actualizarse:
- Mover carpetas `Analytics/`, `Predictive/`, `Reports/`, `Alerts/` a una nueva colección `Analytics Service/`
- Actualizar el puerto base de 3002 a 3003 en esos requests

## 🚀 Cómo Ejecutar

### Desarrollo Local

```bash
# Terminal 1 - Base de datos y Kafka
docker-compose up postgres redpanda

# Terminal 2 - Catalog Service
npx nx serve catalog-service

# Terminal 3 - Analytics Service (NUEVO)
npx nx serve analytics-service

# Terminal 4 - Analytics Worker
npx nx serve analytics-worker
```

El sistema estará disponible en:
- **Catalog Service**: http://localhost:3002 y http://localhost:3002/api/docs
- **Analytics Service**: http://localhost:3003 y http://localhost:3003/api/docs

### Docker Compose (Producción)

```bash
docker-compose up -d
```

## 🧪 Testing

Los tests se mantienen en sus respectivos servicios:

```bash
# Tests de catalog-service (sin analytics)
npx nx test catalog-service

# Tests de analytics-service (nuevo)
npx nx test analytics-service

# Cobertura completa
npm run test:cov
```

## 📊 Base de Datos

**IMPORTANTE**: Ambos servicios comparten la misma base de datos PostgreSQL, por lo que:
- No se requiere migración de datos
- No hay cambios en el schema
- La conexión a DB sigue siendo la misma

## 🔄 Cron Jobs

Las alertas automáticas ahora se ejecutan en el `analytics-service`:
- **Frecuencia**: Cada hora (`@hourly`)
- **Tareas**: Stock bajo, sin stock, alta demanda, baja rotación, reabastecimiento

## 📝 Documentación

- [README Analytics Service](../apps/analytics-service/README.md)
- [Documentación API Analytics](./ANALYTICS_API_DOCUMENTATION.md)
- [Colección Bruno](./bruno/) - Tests de API

## ✅ Checklist de Migración

Para asegurar una migración exitosa:

- [ ] Actualizar variables de entorno (`.env`)
- [ ] Actualizar URLs en frontend/cliente (puerto 3002 → 3003)
- [ ] Actualizar colección Bruno/Postman
- [ ] Actualizar documentación interna del equipo
- [ ] Probar todos los endpoints de analytics en el nuevo servicio
- [ ] Verificar que cron jobs de alertas funcionen
- [ ] Actualizar monitoring/logging si aplica
- [ ] Actualizar configuración de CI/CD
- [ ] Notificar al equipo sobre los cambios

## 🆘 Troubleshooting

### Error: Cannot connect to analytics endpoints
**Solución**: Verificar que el analytics-service esté corriendo en el puerto 3003
```bash
npx nx serve analytics-service
```

### Error: Analytics modules not found
**Solución**: Recompilar el proyecto
```bash
npx nx build analytics-service
```

### Error: Database connection failed
**Solución**: Verificar que PostgreSQL esté corriendo
```bash
docker-compose up postgres
```

## 📞 Soporte

Para preguntas o problemas con la migración, revisar:
- README del analytics-service
- Logs del servicio
- Documentación de Swagger en `/api/docs`
