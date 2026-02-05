# Guía de Implementación: Sistema de Ventas con Redpanda (Kafka)

## 📋 Resumen

Se ha implementado un sistema de gestión de ventas basado en eventos usando **Redpanda** (compatible con Kafka API), con una arquitectura de microservicios desacoplada:

### Componentes Creados

1. **Sales Module** (catalog-service)
   - CRUD completo de ventas
   - Publica eventos a Redpanda cuando ocurren ventas

2. **Analytics Worker** (nueva app)
   - Consume eventos de Redpanda
   - Actualiza analytics, inventory y stock movements automáticamente

3. **Infraestructura Redpanda**
   - Docker Compose con Redpanda (sin necesidad de Zookeeper)

## 🏗️ Arquitectura

```
┌─────────────────────┐
│  Catalog Service    │
│   (Sales Module)    │
│                     │
│  POST /sales        │───► Crea venta
│  PATCH /sales/:id   │───► Completa/Cancela venta
└──────────┬──────────┘
           │
           │ Publica eventos
           ▼
    ┌──────────────┐
    │   Redpanda   │
    │ (Kafka API)  │
    └──────┬───────┘
           │
           │ Consume eventos
           ▼
┌─────────────────────┐
│ Analytics Worker    │
│                     │
│ ✓ Analytics Update  │
│ ✓ Inventory Update  │
│ ✓ Stock Movements   │
└─────────────────────┘
```

## 🚀 Pasos para Ejecutar

### 1. Instalar Dependencias

```bash
cd /home/roro-gallardo/git/cmpc-test

# Instalar dependencias de Kafka en catalog-service
cd apps/catalog-service
npm install @nestjs/microservices kafkajs

# Instalar dependencias de analytics-worker
cd ../analytics-worker
npm install
```

### 2. Iniciar Infraestructura con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que todo está corriendo
docker-compose ps
```

Servicios disponibles:
- **PostgreSQL**: `localhost:5432`
- **Redpanda (Kafka API)**: `localhost:19092`
- **Schema Registry**: `localhost:18081`
- **Pandaproxy (HTTP API)**: `localhost:18082`

### 3. Iniciar Servicios

```bash
# Terminal 1: Auth Service
nx serve auth-service

# Terminal 2: Catalog Service (con Sales)
nx serve catalog-service

# Terminal 3: Analytics Worker
nx serve analytics-worker
```

### 4. Verificar Tópicos (Opcional)

```bash
# Acceder al contenedor de Redpanda
docker exec -it cmpc-redpanda rpk topic list

# Ver mensajes en un tópico
docker exec -it cmpc-redpanda rpk topic consume sale.completed --num 10
```

## 📡 Eventos de Redpanda (Kafka API)

### Tópicos

| Tópico | Publicador | Consumidor | Descripción |
|--------|------------|------------|----Redpanda

2. **Usuario completa venta** → `PATCH /sales/:id/status`
   - Se actualiza estado a COMPLETED
   - Se publica evento `sale.completed` a Redpand
### Flujo de Eventos

1. **Usuario crea venta** → `POST /sales`
   - Se valida stock
   - Se crea Sale + SaleItems
   - Se publica evento `sale.created` a Kafka

2. **Usuario completa venta** → `PATCH /saRedpand:id/status`
   - Se actualiza estado a COMPLETED
   - Se publica evento `sale.completed` a Kafka
   - Analytics Worker consume evento
   - Se actualiza BookAnalytics
   - Se actualiza Inventory (resta stock)
   - Se crea StockMovement

3. **Usuario cancela venta** → `PATCH /sales/:id/status`
   - Se actualiza estado a CANCELLED
   - Se publica evento `sale.cancelled` a Kafka
   - Analytics Worker consume evento
   - Se revierte Inventory (devuelve stock)
   - Se crea StockMovement de ajuste

## 📝 Endpoints Nuevos

### Sales

```bash
# Crear venta
POST http://localhost:3002/sales
Authorization: Bearer <token>
{
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com",
  "items": [
    { "bookId": "uuid", "quantity": 2 },
    { "bookId": "uuid", "quantity": 1 }
  ],
  "discount": 10
}

# Listar ventas
GET http://localhost:3002/sales?status=COMPLETED&page=1&limit=10

# Obtener venta
GET http://localhost:3002/sales/:id

# Completar venta
PATCH http://localhost:3002/sales/:id/status
{
  "status": "COMPLETED",
  "paymentMethod": "CREDIT_CARD",
  "paymentReference": "REF-123"
}

# Cancelar venta
PATCH http://localhost:3002/sales/:id/status
{
  "status": "CANCELLED"
}

# Resumen de ventas
GET http://localhost:3002/sales/summary?startDate=2026-01-01&endDate=2026-02-03
```

## 🔍 Monitoreo

### Redpanda CLI (rpk)

```bash
# Ver tópicos
docker exec -it cmpc-redpanda rpk topic list

# Consumir mensajes de un tópico
docker exec -it cmpc-redpanda rpk topic consume sale.completed

# Ver información del cluster
docker exec -it cmpc-redpanda rpk cluster info

# Ver consumer groups
docker exec -it cmpc-redpanda rpk group list

# Ver detalles de un consumer group
docker exec -it cmpc-redpanda rpk group describe analytics-group
```

### Logs

```bash
# Ver logs de Analytics Worker
nx serve analytics-worker

# Ver logs de Redpanda
docker logs -f cmpc-redpanda

# Ver logs de Catalog Service
nx serve catalog-service
```
con Redpanda CLI**:
```bash
docker exec -it cmpc-redpanda rpk topic consume sale.created --num 1
```
1. **Crear una venta**:
```bash
curl -X POST http://localhost:3002/sales \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "items": [{"bookId": "BOOK_ID", "quantity": 1}]
  }'
```

2. **Ver el evento en Kafka UI**: `http://localhost:8080`
   - Navega a Topics → `sale.created`
   - Verás el mensaje publicado

3. **Completar la venta**:
```bash
curl -X PATCH http://localhost:3002/sales/SALE_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "paymentMethod": "CASH"
  }'
```

4. **Verificar actualizaciones**:
   - `BookAnalytics` → Ventas incrementadas
   - `Inventory` → Stock reducido
   - `StockMovement` → Movimiento de venta registrado

## 📦 Archivos Creados

### Nuevos DTOs
- `libs/shared/src/dtos/sales/create-sale.dto.ts`
- `libs/shared/src/dtos/sales/update-sale-status.dto.ts`
- `libs/shared/src/dtos/sales/filter-sale.dto.ts`
Redpanda + PostgreSQL
- `.env` - Variables de Redpanda/Kafka

## 🎯 **Ventajas de Redpanda sobre Kafka**

✅ **Sin Zookeeper** - Arquitectura más simple  
✅ **Menor latencia** - Escrito en C++, más rápido  
✅ **Menor uso de recursos** - Consume menos memoria  
✅ **Compatible 100% con Kafka** - Usa la misma API  
✅ **Más fácil de operar** - Un solo proceso  
✅ **CLI integrado** - rpk para administraciónvice)
- `apps/catalog-service/src/sales/sales.service.ts`
- `apps/catalog-service/src/sales/sales.controller.ts`
- `aRedpanda compatible con Kafka**: Usa la misma API de Kafka, solo cambia el broker
- **Sin Zookeeper**: Redpanda no necesita Zookeeper, simplifica la infraestructura
- **EventEmitter removido**: Ya no se usan eventos locales, todo pasa por Redpanda
- **Listeners migrados**: AnalyticsListener e InventoryListener ahora son Kafka consumers
- **Async processing**: El procesamiento de analytics es asíncrono
- **Escalabilidad**: Puedes levantar múltiples instancias de analytics-worker

## 🐛 Troubleshooting

**Redpanda no conecta**:
```bash
docker-compose down -v
docker-compose up -d
docker logs -f cmpc-redpanda
```

**Worker no consume mensajes**:
```bash
# Verificar que Redpanda está corriendo
docker ps | grep redpanda

# Ver health status
docker exec -it cmpc-redpanda rpk cluster health

# Verificar consumer group
docker exec -it cmpc-redpanda rpk group describe analytics-group
```

**Ver mensajes en un tópico**:
```bash
docker exec -it cmpc-redpanda rpk topic consume sale.completed --num 10
```

**Stock no se actualiza**:
- Verifica que el evento se publicó: `rpk topic consume sale.completed`
- Revisa logs del analytics-worker
- Verifica que la venta está en estado COMPLETED

**Limpiar todos los datos**:
```bash
docker-compose down -v
docker-compose up -d
```
## ⚠️ Notas Importantes

- **EventEmitter removido**: Ya no se usan eventos locales, todo pasa por Kafka
- **Listeners migrados**: AnalyticsListener e InventoryListener ahora son Kafka consumers
- **Async processing**: El procesamiento de analytics es asíncrono
- **Escalabilidad**: Puedes levantar múltiples instancias de analytics-worker

## 🐛 Troubleshooting

**Kafka no conecta**:
```bash
docker-compose down
docker-compose up -d
```

**Worker no consume mensajes**:
- Verifica que Kafka esté corriendo: `docker ps`
- Revisa logs: `docker logs cmpc-kafka`
- Verifica consumer group en Kafka UI

**Stock no se actualiza**:
- Verifica que el evento se publicó en Kafka UI
- Revisa logs del analytics-worker
- Verifica que la venta está en estado COMPLETED
