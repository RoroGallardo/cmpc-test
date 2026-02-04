# Analytics Worker

Microservicio worker que consume eventos de Kafka para procesar:
- Actualización de analytics de libros
- Actualización de inventario
- Generación de predicciones
- Creación de movimientos de stock

## Arquitectura

Este worker escucha eventos publicados por el `catalog-service` cuando ocurren ventas:

```
catalog-service (Sales)
  ↓ (publica evento)
Kafka Topics
  ↓ (consume evento)
analytics-worker
  ↓ (actualiza)
Database (BookAnalytics, Inventory, StockMovement)
```

## Eventos que Consume

- `sale.created` - Cuando se crea una venta
- `sale.completed` - Cuando se completa una venta (actualiza analytics e inventario)
- `sale.cancelled` - Cuando se cancela una venta (revierte cambios)

## Variables de Entorno

```env
KAFKA_BROKERS=localhost:19092
KAFKA_CLIENT_ID=analytics-worker
KAFKA_GROUP_ID=analytics-group
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=cmpc_test
```

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```
