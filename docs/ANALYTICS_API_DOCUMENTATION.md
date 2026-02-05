# 📊 Documentación API de Analytics

Esta documentación describe todos los endpoints de Analytics, Predictive Analytics y Reports disponibles en el sistema.

## 🔧 Configuración Bruno

Todos los endpoints están documentados y probados en Bruno. Los archivos se encuentran en:

```
docs/bruno/Catalog Service/
├── Analytics/
│   ├── Dashboard Metrics.bru
│   ├── Sales Analytics.bru
│   └── Inventory Metrics.bru
├── Predictive/
│   ├── Demand Prediction for Book.bru
│   ├── All Books Demand Predictions.bru
│   └── Restock Recommendations.bru
└── Reports/
    ├── ABC Analysis Report.bru
    ├── Profitability Report.bru
    ├── Seasonality Report.bru
    ├── Stock Rotation Report.bru
    └── Audit Trail Report.bru
```

### Variables de entorno Bruno

Configurar en `docs/bruno/environments/local.bru`:

```
catalog_service_url=http://localhost:3002
access_token=<tu_token_jwt>
```

## 📈 Analytics Endpoints

### 1. Dashboard Metrics

**GET** `/analytics/dashboard`

Obtiene métricas del dashboard en tiempo real.

**Autenticación:** Bearer Token

**Respuesta:**
```json
{
  "salesToday": { "total": 15000, "count": 12, "average": 1250 },
  "salesThisWeek": { "total": 85000, "count": 67, "average": 1268.66 },
  "salesThisMonth": { "total": 320000, "count": 245, "average": 1306.12 },
  "inventorySummary": {
    "totalStock": 5420,
    "totalValue": 12500000,
    "lowStockCount": 8,
    "outOfStockCount": 2
  },
  "topSellingBooks": [
    {
      "bookId": "uuid",
      "title": "El Principito",
      "totalSales": 45000,
      "unitsSold": 35
    }
  ],
  "comparison": {
    "salesGrowth": 15.5,
    "volumeGrowth": 12.3
  }
}
```

### 2. Sales Analytics

**GET** `/analytics/sales?startDate=2026-01-01&endDate=2026-02-03`

Análisis detallado de ventas por período.

**Parámetros (opcionales):**
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)

**Autenticación:** Bearer Token

**Respuesta:**
```json
{
  "salesByDay": [
    { "date": "2026-01-01", "total": 12500, "count": 8 }
  ],
  "salesByCategory": [
    { "genre": "Ficción", "total": 85000, "count": 45 }
  ],
  "salesByAuthor": [
    { "author": "Gabriel García Márquez", "total": 65000, "count": 32 }
  ],
  "totals": {
    "revenue": 320000,
    "transactions": 245,
    "averageTicket": 1306.12
  }
}
```

### 3. Inventory Metrics

**GET** `/analytics/inventory`

Métricas avanzadas de inventario.

**Autenticación:** Bearer Token

**Respuesta:**
```json
{
  "totalInventoryValue": 12500000,
  "averageRotationRate": 1.8,
  "averageDaysToSell": 45.5,
  "lowStockItems": [
    {
      "bookId": "uuid",
      "title": "1984",
      "currentStock": 5,
      "minimumStock": 10
    }
  ],
  "overStockItems": [...],
  "byCategory": [
    {
      "genre": "Ficción",
      "totalValue": 4500000,
      "rotationRate": 2.3
    }
  ]
}
```

## 🔮 Predictive Analytics Endpoints

### 1. Demand Prediction for Book

**GET** `/predictive/demand/:bookId`

Predicción de demanda para un libro específico.

**Parámetros:**
- `bookId`: ID del libro

**Autenticación:** Bearer Token

**Respuesta:**
```json
{
  "bookId": "uuid",
  "title": "Cien Años de Soledad",
  "predicted7Days": 12,
  "predicted30Days": 48,
  "trend": "increasing",
  "confidence": 0.85,
  "historicalAverage": 10.5
}
```

**Trends:**
- `increasing`: Demanda creciente
- `stable`: Demanda estable
- `decreasing`: Demanda decreciente

### 2. All Books Demand Predictions

**GET** `/predictive/demand`

Predicciones de demanda para todos los libros.

**Autenticación:** Bearer Token

**Respuesta:**
```json
[
  {
    "bookId": "uuid",
    "title": "El Principito",
    "predicted7Days": 18,
    "predicted30Days": 72,
    "trend": "increasing",
    "currentStock": 25
  },
  ...
]
```

### 3. Restock Recommendations

**GET** `/predictive/restock-recommendations`

Recomendaciones inteligentes de reabastecimiento.

**Autenticación:** Bearer Token

**Respuesta:**
```json
[
  {
    "bookId": "uuid",
    "title": "1984",
    "currentStock": 5,
    "predicted7Days": 15,
    "recommendedQuantity": 25,
    "urgency": "high",
    "daysUntilStockout": 2.3,
    "reason": "Stock crítico, demanda alta predicha"
  },
  ...
]
```

**Niveles de urgencia:**
- `critical`: Reabastecimiento inmediato
- `high`: Reabastecimiento urgente (1-3 días)
- `medium`: Reabastecimiento pronto (4-7 días)
- `low`: Reabastecimiento normal (> 7 días)

## 📊 Reports Endpoints

### 1. ABC Analysis Report

**GET** `/reports/abc-analysis?startDate=2026-01-01&endDate=2026-02-03`

Análisis ABC de inventario (Pareto).

**Parámetros (opcionales):**
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)

**Autenticación:** Bearer Token

**Respuesta:**
```json
[
  {
    "bookId": "uuid",
    "title": "El Principito",
    "revenue": 125000,
    "percentage": 12.5,
    "cumulativePercentage": 12.5,
    "category": "A"
  },
  ...
]
```

**Categorías:**
- **A**: Top 20% de productos (80% de ingresos)
- **B**: Siguiente 30% de productos (15% de ingresos)
- **C**: Restante 50% de productos (5% de ingresos)

### 2. Profitability Report

**GET** `/reports/profitability?startDate=2026-01-01&endDate=2026-02-03`

Reporte de rentabilidad detallado.

**Parámetros (opcionales):**
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)

**Autenticación:** Bearer Token

**Respuesta:**
```json
{
  "byCategory": [
    {
      "genre": "Ficción",
      "revenue": 450000,
      "cost": 270000,
      "profit": 180000,
      "profitMargin": 40.0
    }
  ],
  "byAuthor": [...],
  "byPublisher": [...],
  "topProfitable": [...],
  "leastProfitable": [...]
}
```

### 3. Seasonality Report

**GET** `/reports/seasonality`

Análisis de estacionalidad de ventas.

**Autenticación:** Bearer Token

**Respuesta:**
```json
{
  "monthly": [
    { "month": 1, "avgSales": 125000, "trend": "high" }
  ],
  "weekly": [
    { "dayOfWeek": 5, "avgSales": 18000, "trend": "high" }
  ],
  "seasonal": {
    "summer": { "avgSales": 95000, "trend": "low" },
    "autumn": { "avgSales": 145000, "trend": "high" }
  }
}
```

### 4. Stock Rotation Report

**GET** `/reports/stock-rotation`

Reporte de rotación de inventario.

**Autenticación:** Bearer Token

**Respuesta:**
```json
[
  {
    "bookId": "uuid",
    "title": "Harry Potter",
    "rotationRate": 3.5,
    "avgDaysToSell": 25.7,
    "category": "Fast Moving",
    "recommendation": "Mantener stock alto"
  },
  ...
]
```

**Categorías de rotación:**
- **Fast Moving**: rotación > 2.0 (alta demanda)
- **Normal**: rotación 0.5 - 2.0 (demanda moderada)
- **Slow Moving**: rotación 0.1 - 0.5 (baja demanda)
- **Dead Stock**: rotación < 0.1 (sin movimiento)

### 5. Audit Trail Report

**GET** `/reports/audit-trail?startDate=2026-01-01&endDate=2026-02-03&entityId=uuid`

Trazabilidad completa de cambios.

**Parámetros:**
- `startDate` (opcional): Fecha de inicio
- `endDate` (opcional): Fecha de fin
- `entityId` (opcional): ID de entidad específica

**Autenticación:** Bearer Token

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "entityType": "Book",
    "entityId": "uuid",
    "action": "UPDATE",
    "fieldName": "price",
    "oldValue": "15000",
    "newValue": "18000",
    "userId": "uuid",
    "timestamp": "2026-02-01T10:30:00Z"
  },
  ...
]
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT:

```bash
# 1. Obtener token (Login)
POST http://localhost:3001/auth/login
{
  "email": "usuario@example.com",
  "password": "password123"
}

# 2. Usar token en headers
Authorization: Bearer <tu_token_jwt>
```

## 🚀 Ejemplos de uso con curl

### Dashboard
```bash
curl -X GET http://localhost:3002/analytics/dashboard \
  -H "Authorization: Bearer <token>"
```

### Sales Analytics
```bash
curl -X GET "http://localhost:3002/analytics/sales?startDate=2026-01-01&endDate=2026-02-03" \
  -H "Authorization: Bearer <token>"
```

### Demand Prediction
```bash
curl -X GET http://localhost:3002/predictive/demand/<bookId> \
  -H "Authorization: Bearer <token>"
```

### Restock Recommendations
```bash
curl -X GET http://localhost:3002/predictive/restock-recommendations \
  -H "Authorization: Bearer <token>"
```

### ABC Analysis
```bash
curl -X GET "http://localhost:3002/reports/abc-analysis?startDate=2026-01-01" \
  -H "Authorization: Bearer <token>"
```

## 🔄 Kafka Events

El sistema procesa eventos de Kafka en tiempo real:

### Events Consumed (analytics-worker)

- **`sale.completed`**: Actualiza analytics y estadísticas de ventas
- **`sale.cancelled`**: Revierte analytics de venta cancelada

### Configuración Kafka (Redpanda)

```env
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=catalog-service
KAFKA_GROUP_ID=analytics-group
```

## 📝 Notas

1. **Fechas**: Formato ISO 8601 (YYYY-MM-DD)
2. **Moneda**: Valores en pesos chilenos (CLP)
3. **Predicciones**: Basadas en algoritmo de media móvil exponencial
4. **Cache**: Los datos se actualizan en tiempo real vía Kafka
5. **Performance**: Consultas optimizadas con índices en PostgreSQL

## 🧪 Testing

Usar Bruno para probar todos los endpoints:

1. Importar colección desde `docs/bruno/`
2. Configurar environment `local`
3. Ejecutar `Login` para obtener token
4. Ejecutar cualquier endpoint de Analytics/Predictive/Reports

## 📚 Documentación adicional

- [Implementación Kafka](./KAFKA_SALES_IMPLEMENTATION.md)
- [Winston Logger](./WINSTON_LOGGER.md)
- [Husky & Commitlint](./HUSKY_COMMITLINT.md)
