# Limpieza de Event Emitter - Migración Completa a Kafka

## ✅ Cambios Realizados

### 1. **Eliminado EventEmitterModule**
- Removido `@nestjs/event-emitter` de [app.module.ts](apps/catalog-service/src/app.module.ts)
- Ya no se usa `EventEmitterModule.forRoot()`

### 2. **Eliminados Listeners Locales**
Se eliminaron completamente las carpetas:
- ❌ `apps/catalog-service/src/sales/listeners/`
  - `analytics.listener.ts` (movido a analytics-worker)
  - `inventory.listener.ts` (movido a analytics-worker)
- ❌ `apps/catalog-service/src/sales/events/`
  - `sale-created.event.ts`
  - `sale-completed.event.ts`
  - `sale-cancelled.event.ts`

### 3. **Arquitectura Actual**

#### Antes (Event Emitter - Local):
```
SalesService
    ↓ (emitEvent local)
EventEmitter
    ↓
AnalyticsListener  ← En el mismo proceso
InventoryListener  ← En el mismo proceso
    ↓
Database
```

#### Ahora (Kafka - Distribuido):
```
SalesService
    ↓ (publica a Kafka)
Redpanda/Kafka
    ↓ (consume)
Analytics Worker  ← Proceso separado
    ↓
Database
```

## 🎯 Beneficios

✅ **Verdadero desacoplamiento** - catalog-service y analytics-worker son independientes  
✅ **Escalabilidad horizontal** - Múltiples workers pueden consumir  
✅ **Resiliencia** - Si el worker falla, los eventos se procesan después  
✅ **Sin bloqueos** - El proceso de venta no espera al procesamiento  
✅ **Event sourcing** - Historial completo en Kafka  
✅ **Menor acoplamiento** - No hay dependencias directas entre servicios

## 📋 Estado Actual

### Catalog Service
- ✅ SalesService usa `KafkaProducerService`
- ✅ Publica eventos: `sale.created`, `sale.completed`, `sale.cancelled`
- ❌ NO procesa analytics localmente
- ❌ NO actualiza inventory localmente

### Analytics Worker
- ✅ Consume eventos de Redpanda
- ✅ `AnalyticsConsumer` actualiza BookAnalytics
- ✅ `InventoryConsumer` actualiza Inventory y StockMovement
- ✅ Procesa eventos asíncronamente

## 🚀 Flujo Completo de una Venta

1. **Usuario crea venta**: `POST /sales`
   ```
   catalog-service → Valida stock
                  → Crea Sale + SaleItems
                  → kafkaProducer.emit('sale.created', sale)
                  → Responde inmediatamente al usuario
   ```

2. **Usuario completa venta**: `PATCH /sales/:id/status`
   ```
   catalog-service → Actualiza estado a COMPLETED
                  → kafkaProducer.emit('sale.completed', sale)
                  → Responde inmediatamente al usuario
   ```

3. **Analytics Worker procesa** (asíncrono):
   ```
   Redpanda → analytics-worker consume 'sale.completed'
         → AnalyticsConsumer actualiza BookAnalytics
         → InventoryConsumer reduce stock + crea StockMovement
   ```

## 🔧 Dependencias Removidas

Puedes eliminar del package.json (si está):
```json
{
  "@nestjs/event-emitter": "^2.0.0"  // Ya no se necesita
}
```

## 📝 Próximos Pasos (Opcional)

1. **Dead Letter Queue**: Manejar eventos que fallan
2. **Retry Logic**: Reintentos automáticos en el consumer
3. **Idempotencia**: Asegurar que procesar dos veces el mismo evento no duplique datos
4. **Monitoring**: Métricas de lag de consumo
5. **Circuit Breaker**: Protección si la BD falla

## ⚠️ Notas Importantes

- Los eventos ya NO se procesan en el mismo proceso
- El procesamiento es **eventualmente consistente**
- Puede haber un pequeño delay entre crear la venta y actualizar analytics
- Para testing, asegúrate de que Redpanda esté corriendo

## 🧪 Verificación

```bash
# 1. Iniciar Redpanda
docker-compose up -d redpanda

# 2. Iniciar catalog-service
nx serve catalog-service

# 3. Iniciar analytics-worker
nx serve analytics-worker

# 4. Crear una venta
curl -X POST http://localhost:3002/sales \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"bookId": "ID", "quantity": 1}]}'

# 5. Ver evento en Redpanda
docker exec -it cmpc-redpanda rpk topic consume sale.created --num 1

# 6. Completar la venta
curl -X PATCH http://localhost:3002/sales/ID/status \
  -H "Authorization: Bearer TOKEN" \
  -d '{"status": "COMPLETED", "paymentMethod": "CASH"}'

# 7. Verificar que se procesó
docker exec -it cmpc-redpanda rpk topic consume sale.completed --num 1

# 8. Ver logs del worker
# Deberías ver: "✅ Analytics actualizado para libro..."
```
