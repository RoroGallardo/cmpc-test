# Diagramas de Secuencia - Sistema CMPC Test

## 📋 Índice
1. [Flujo de Autenticación](#autenticación)
2. [Flujo de Registro de Venta](#registro-venta)
3. [Flujo de Analytics en Tiempo Real](#analytics-tiempo-real)
4. [Flujo de Predicciones](#predicciones)
5. [Flujo de Alertas Automáticas](#alertas-automáticas)
6. [Flujo de Generación de Reportes](#reportes)

## 🔐 Flujo de Autenticación {#autenticación}

### Login de Usuario

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (Angular)
    participant AG as Auth Guard
    participant A as Auth Service
    participant DB as PostgreSQL
    
    Note over U,DB: Proceso de Login
    
    U->>F: Ingresa email y password
    F->>F: Validar formato de datos
    
    alt Formato inválido
        F-->>U: Error de validación
    end
    
    F->>A: POST /auth/login<br/>{email, password}
    
    A->>A: Validar DTO
    A->>DB: SELECT * FROM user<br/>WHERE email = ?
    
    alt Usuario no encontrado
        DB-->>A: null
        A-->>F: 401 Unauthorized
        F-->>U: Credenciales inválidas
    else Usuario encontrado
        DB-->>A: User entity
        
        A->>A: bcrypt.compare(<br/>password, hash)
        
        alt Password incorrecto
            A-->>F: 401 Unauthorized
            F-->>U: Credenciales inválidas
        else Password correcto
            A->>A: Generar JWT<br/>{userId, email, role}
            A->>A: Firmar con RSA private key
            
            A-->>F: 200 OK<br/>{token, user}
            
            F->>F: localStorage.setItem(<br/>'token', token)
            F->>F: Guardar user en state
            
            F-->>U: Redirigir a dashboard
        end
    end
```

### Validación de Token en Request

```mermaid
sequenceDiagram
    participant F as Frontend
    participant I as HTTP Interceptor
    participant C as Catalog Service
    participant G as JWT Guard
    participant A as Auth Service
    
    Note over F,A: Request Protegido
    
    F->>I: GET /books
    I->>I: Obtener token de localStorage
    I->>C: GET /books<br/>Header: Authorization: Bearer {token}
    
    C->>G: Validar request
    G->>G: Extraer token del header
    
    alt Token ausente
        G-->>C: throw UnauthorizedException
        C-->>F: 401 Unauthorized
    end
    
    G->>G: jwt.verify(token, publicKey)
    
    alt Token inválido o expirado
        G-->>C: throw UnauthorizedException
        C-->>F: 401 Unauthorized
    else Token válido
        G->>G: Decodificar payload
        G->>C: Inyectar user en request
        C->>C: Procesar lógica de negocio
        C-->>F: 200 OK + Data
    end
```

### Registro de Nuevo Usuario

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as Auth Service
    participant DB as PostgreSQL
    
    U->>F: Completar formulario registro
    F->>F: Validar datos<br/>(email, password, nombres)
    
    F->>A: POST /auth/register<br/>{email, password, firstName, lastName}
    
    A->>A: Validar DTO con class-validator
    
    alt DTO inválido
        A-->>F: 400 Bad Request<br/>{validation errors}
        F-->>U: Mostrar errores
    end
    
    A->>DB: SELECT * FROM user<br/>WHERE email = ?
    
    alt Email ya existe
        DB-->>A: User entity
        A-->>F: 409 Conflict<br/>"Email already exists"
        F-->>U: Error: Email ya registrado
    else Email disponible
        DB-->>A: null
        
        A->>A: bcrypt.hash(password, 10)
        
        A->>DB: INSERT INTO user<br/>(id, email, password, ...)<br/>VALUES (uuid(), ?, hash, ...)
        
        DB-->>A: User created
        
        A->>A: Remover password del objeto
        
        A-->>F: 201 Created<br/>{user (sin password)}
        
        F-->>U: Confirmación registro<br/>Redirigir a login
    end
```

## 💰 Flujo de Registro de Venta {#registro-venta}

### Proceso Completo de Venta (Síncrono + Asíncrono)

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant C as Catalog Service
    participant DB as PostgreSQL
    participant K as Kafka/Redpanda
    participant W as Analytics Worker
    
    Note over A,W: FASE 1: Creación de Venta (Síncrono)
    
    A->>F: Crear venta con items
    F->>C: POST /sales<br/>{items: [{bookId, quantity}]}
    
    C->>C: Validar JWT y rol ADMIN
    
    alt No es ADMIN
        C-->>F: 403 Forbidden
        F-->>A: Acceso denegado
    end
    
    C->>C: Validar CreateSaleDto
    C->>DB: BEGIN TRANSACTION
    
    Note over C,DB: Verificar Stock para cada item
    
    loop Para cada item
        C->>DB: SELECT currentStock<br/>FROM inventory<br/>WHERE bookId = ?
        DB-->>C: currentStock
        
        alt Stock insuficiente
            C->>DB: ROLLBACK
            C-->>F: 400 Bad Request<br/>"Insufficient stock"
            F-->>A: Error: Stock insuficiente
        end
    end
    
    Note over C,DB: Crear Venta y Actualizar Inventario
    
    C->>DB: INSERT INTO sale<br/>(id, saleDate, userId, totalAmount)
    DB-->>C: Sale created
    
    loop Para cada item
        C->>DB: SELECT price FROM book<br/>WHERE id = ?
        DB-->>C: unitPrice
        
        C->>C: Calcular subtotal<br/>= quantity * unitPrice
        
        C->>DB: INSERT INTO sale_item<br/>(saleId, bookId, quantity,<br/>unitPrice, subtotal)
        
        C->>DB: UPDATE inventory<br/>SET currentStock = currentStock - quantity<br/>WHERE bookId = ?
        
        DB-->>C: Updated
    end
    
    C->>DB: COMMIT TRANSACTION
    
    Note over C,K: FASE 2: Publicar Evento (Asíncrono)
    
    C->>K: Publish event: sale.created<br/>{saleId, items: [...]}
    
    C-->>F: 201 Created<br/>{sale with items}
    F-->>A: ✅ Venta registrada exitosamente
    
    Note over K,W: FASE 3: Procesamiento Asíncrono
    
    K-->>W: Consume event: sale.created
    
    W->>W: Procesar evento
    
    loop Para cada item en venta
        Note over W,DB: Actualizar Book Analytics
        
        W->>DB: SELECT * FROM book_analytics<br/>WHERE bookId = ?
        
        alt Analytics no existe
            W->>DB: INSERT INTO book_analytics<br/>(bookId, totalSales, totalRevenue, ...)
        else Analytics existe
            W->>DB: UPDATE book_analytics<br/>SET totalSales = totalSales + quantity,<br/>totalRevenue = totalRevenue + subtotal,<br/>lastSaleDate = NOW()
        end
        
        Note over W,DB: Crear Stock Movement
        
        W->>DB: INSERT INTO stock_movement<br/>(inventoryId, movementType: 'OUT',<br/>quantity, reason: 'SALE', referenceId: saleId)
        
        Note over W,DB: Generar Predicción de Demanda
        
        W->>DB: SELECT sales FROM last 30 days<br/>WHERE bookId = ?
        DB-->>W: Historical sales data
        
        W->>W: Ejecutar modelo TensorFlow.js<br/>Calcular demanda predicha
        
        W->>DB: INSERT INTO demand_prediction<br/>(bookId, predictedDemand,<br/>confidence, recommendation)
    end
    
    Note over W: Procesamiento completado
```

### Verificación de Stock Antes de Venta

```mermaid
sequenceDiagram
    participant F as Frontend
    participant C as Catalog Service
    participant DB as PostgreSQL
    
    F->>C: POST /sales/validate-stock<br/>{items: [{bookId, quantity}]}
    
    C->>C: Inicializar array de errores
    
    loop Para cada item
        C->>DB: SELECT i.currentStock, b.title<br/>FROM inventory i<br/>JOIN book b ON i.bookId = b.id<br/>WHERE i.bookId = ?
        
        DB-->>C: {currentStock, title}
        
        alt currentStock < quantity
            C->>C: errors.push({<br/>bookId, title,<br/>requested: quantity,<br/>available: currentStock<br/>})
        end
    end
    
    alt errors.length > 0
        C-->>F: 400 Bad Request<br/>{errors}
        F->>F: Mostrar errores al usuario
    else No errors
        C-->>F: 200 OK<br/>{valid: true}
        F->>F: Permitir continuar con venta
    end
```

## 📊 Flujo de Analytics en Tiempo Real {#analytics-tiempo-real}

### Consulta de Dashboard

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as Analytics Service
    participant DB as PostgreSQL
    
    Note over F,DB: Cargar Dashboard Completo
    
    F->>A: GET /analytics/dashboard
    
    A->>A: Validar JWT
    
    par Consultas en Paralelo
        A->>DB: Query 1: Total Sales<br/>SELECT COUNT(*) FROM sale
        and
        A->>DB: Query 2: Total Revenue<br/>SELECT SUM(totalAmount) FROM sale
        and
        A->>DB: Query 3: Products Sold<br/>SELECT SUM(quantity) FROM sale_item
        and
        A->>DB: Query 4: Avg Ticket<br/>SELECT AVG(totalAmount) FROM sale
        and
        A->>DB: Query 5: Inventory Value<br/>SELECT SUM(i.currentStock * b.price)<br/>FROM inventory i JOIN book b
        and
        A->>DB: Query 6: Low Stock Items<br/>SELECT COUNT(*) FROM inventory<br/>WHERE currentStock <= minimumStock
        and
        A->>DB: Query 7: Active Products<br/>SELECT COUNT(*) FROM book
        and
        A->>DB: Query 8: Avg Rotation<br/>SELECT AVG(rotationRate)<br/>FROM book_analytics
    end
    
    DB-->>A: Resultados de todas las queries
    
    A->>A: Construir objeto DashboardMetrics<br/>{<br/>  totalSales,<br/>  totalRevenue,<br/>  productsSold,<br/>  averageTicket,<br/>  inventoryValue,<br/>  lowStockItems,<br/>  activeProducts,<br/>  averageRotation<br/>}
    
    A-->>F: 200 OK<br/>{DashboardMetrics}
    
    F->>F: Renderizar métricas en UI
```

### Análisis de Ventas con Filtros

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as Analytics Service
    participant DB as PostgreSQL
    
    F->>A: GET /analytics/sales<br/>?startDate=2024-01-01<br/>&endDate=2024-01-31
    
    A->>A: Parsear query params
    A->>A: Validar fechas
    
    alt Fechas inválidas
        A-->>F: 400 Bad Request<br/>"Invalid date format"
    end
    
    Note over A,DB: Obtener ventas por período
    
    A->>DB: SELECT<br/>  DATE(saleDate) as date,<br/>  SUM(totalAmount) as dailyRevenue,<br/>  COUNT(id) as dailySales,<br/>  SUM(totalAmount) / COUNT(id) as avgTicket<br/>FROM sale<br/>WHERE saleDate BETWEEN ? AND ?<br/>GROUP BY DATE(saleDate)<br/>ORDER BY date
    
    DB-->>A: Daily sales data
    
    Note over A,DB: Obtener top productos vendidos
    
    A->>DB: SELECT<br/>  b.id, b.title,<br/>  SUM(si.quantity) as sold,<br/>  SUM(si.subtotal) as revenue<br/>FROM sale_item si<br/>JOIN book b ON si.bookId = b.id<br/>JOIN sale s ON si.saleId = s.id<br/>WHERE s.saleDate BETWEEN ? AND ?<br/>GROUP BY b.id, b.title<br/>ORDER BY revenue DESC<br/>LIMIT 10
    
    DB-->>A: Top products
    
    Note over A,DB: Obtener ventas por categoría
    
    A->>DB: SELECT<br/>  g.name as category,<br/>  SUM(si.quantity) as unitsSold,<br/>  SUM(si.subtotal) as revenue<br/>FROM sale_item si<br/>JOIN book b ON si.bookId = b.id<br/>JOIN genre g ON b.genreId = g.id<br/>JOIN sale s ON si.saleId = s.id<br/>WHERE s.saleDate BETWEEN ? AND ?<br/>GROUP BY g.name
    
    DB-->>A: Sales by category
    
    A->>A: Construir objeto SalesAnalytics<br/>{<br/>  period: {startDate, endDate},<br/>  dailySales: [...],<br/>  topProducts: [...],<br/>  salesByCategory: [...],<br/>  totalRevenue,<br/>  totalUnits<br/>}
    
    A-->>F: 200 OK<br/>{SalesAnalytics}
    
    F->>F: Renderizar gráficos y tablas
```

## 🔮 Flujo de Predicciones {#predicciones}

### Generación de Predicción de Demanda

```mermaid
sequenceDiagram
    participant W as Analytics Worker
    participant DB as PostgreSQL
    participant TF as TensorFlow.js
    
    Note over W,TF: Trigger: Después de cada venta
    
    W->>W: Recibir evento sale.created
    W->>W: Extraer bookId
    
    Note over W,DB: 1. Obtener datos históricos
    
    W->>DB: SELECT<br/>  DATE(saleDate) as date,<br/>  SUM(quantity) as dailySales<br/>FROM sale s<br/>JOIN sale_item si ON s.id = si.saleId<br/>WHERE si.bookId = ?<br/>  AND saleDate >= NOW() - INTERVAL '30 days'<br/>GROUP BY DATE(saleDate)<br/>ORDER BY date
    
    DB-->>W: Historical sales data
    
    alt Datos insuficientes (< 5 registros)
        W->>W: Usar predicción simple<br/>predictedDemand = AVG(dailySales)
        W->>W: confidence = 0.3
    else Datos suficientes
        Note over W,TF: 2. Preparar dataset
        
        W->>W: Normalizar datos<br/>x = [0, 1, 2, ..., n]<br/>y = [sales per day]
        
        W->>TF: Crear modelo secuencial
        TF->>TF: model.add(tf.layers.dense({<br/>  units: 10, activation: 'relu'<br/>}))
        TF->>TF: model.add(tf.layers.dense({<br/>  units: 1<br/>}))
        
        W->>TF: Compilar modelo<br/>optimizer: 'adam'<br/>loss: 'meanSquaredError'
        
        W->>TF: Entrenar modelo<br/>model.fit(x, y, {<br/>  epochs: 100,<br/>  verbose: 0<br/>})
        
        TF-->>W: Modelo entrenado
        
        W->>TF: Predecir próximos 7 días<br/>model.predict([n+1, n+2, ..., n+7])
        
        TF-->>W: Predicciones array
        
        W->>W: predictedDemand = SUM(predictions)
        W->>W: confidence = min(1, dataPoints / 30)
    end
    
    Note over W,DB: 3. Generar recomendación
    
    W->>DB: SELECT currentStock<br/>FROM inventory<br/>WHERE bookId = ?
    
    DB-->>W: currentStock
    
    W->>W: deficit = predictedDemand - currentStock
    
    alt deficit > 0
        W->>W: recommendation = `Reabastecer ${deficit} unidades`
    else deficit <= 0
        W->>W: recommendation = "Stock suficiente"
    end
    
    Note over W,DB: 4. Guardar predicción
    
    W->>DB: INSERT INTO demand_prediction<br/>(id, bookId, predictedDemand,<br/>confidence, recommendation,<br/>predictionDate, createdAt)<br/>VALUES (uuid(), ?, ?, ?, ?, NOW(), NOW())
    
    DB-->>W: Prediction saved
    
    Note over W: ✅ Predicción completada
```

### Consulta de Predicciones

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as Analytics Service
    participant DB as PostgreSQL
    
    F->>A: GET /predictive/demand
    
    A->>A: Validar JWT
    
    A->>DB: SELECT<br/>  dp.*,<br/>  b.title,<br/>  b.isbn,<br/>  i.currentStock<br/>FROM demand_prediction dp<br/>JOIN book b ON dp.bookId = b.id<br/>JOIN inventory i ON b.id = i.bookId<br/>WHERE dp.id IN (<br/>  SELECT id FROM (<br/>    SELECT id, ROW_NUMBER() OVER (<br/>      PARTITION BY bookId<br/>      ORDER BY predictionDate DESC<br/>    ) as rn<br/>    FROM demand_prediction<br/>  ) WHERE rn = 1<br/>)<br/>ORDER BY dp.confidence DESC, dp.predictedDemand DESC<br/>LIMIT 20
    
    Note over DB: Query obtiene la predicción<br/>más reciente de cada libro
    
    DB-->>A: Latest predictions
    
    A->>A: Mapear a DTO<br/>DemandPrediction[] {<br/>  book: {...},<br/>  predictedDemand,<br/>  currentStock,<br/>  confidence,<br/>  recommendation,<br/>  predictionDate<br/>}
    
    A-->>F: 200 OK<br/>{predictions}
    
    F->>F: Renderizar tabla con<br/>- Indicador de confianza<br/>- Alerta si stock < demanda<br/>- Acción recomendada
```

## 🚨 Flujo de Alertas Automáticas {#alertas-automáticas}

### Generación Automática de Alertas (Cron Job)

```mermaid
sequenceDiagram
    participant CRON as Cron Scheduler
    participant AS as Alert Service
    participant DB as PostgreSQL
    
    Note over CRON,DB: Ejecuta cada hora: checkLowStock()
    
    CRON->>AS: @Cron('0 * * * *')<br/>checkLowStock()
    
    AS->>DB: SELECT<br/>  b.id, b.title,<br/>  i.currentStock,<br/>  i.minimumStock<br/>FROM book b<br/>JOIN inventory i ON b.id = i.bookId<br/>WHERE i.currentStock <= i.minimumStock
    
    DB-->>AS: Books with low stock
    
    loop Para cada libro
        AS->>DB: SELECT * FROM alert<br/>WHERE bookId = ?<br/>  AND alertType = 'LOW_STOCK'<br/>  AND resolved = false
        
        alt Alerta ya existe
            DB-->>AS: Existing alert
            AS->>AS: Skip (no crear duplicada)
        else No existe alerta
            DB-->>AS: null
            
            AS->>AS: Calcular severity<br/>if (stock <= minimum / 2) -> CRITICAL<br/>else if (stock <= minimum) -> HIGH
            
            AS->>AS: message = `Low stock alert for "${title}".<br/>Current: ${stock}, Minimum: ${minimum}`
            
            AS->>DB: INSERT INTO alert<br/>(id, bookId, alertType: 'LOW_STOCK',<br/>severity, message, resolved: false,<br/>createdAt, updatedAt)<br/>VALUES (uuid(), ?, ?, ?, ?, false, NOW(), NOW())
            
            DB-->>AS: Alert created
        end
    end
    
    Note over CRON,DB: Ejecuta cada hora: checkHighDemand()
    
    CRON->>AS: @Cron('0 * * * *')<br/>checkHighDemand()
    
    AS->>DB: SELECT<br/>  ba.bookId,<br/>  b.title,<br/>  ba.averageMonthlySales,<br/>  COUNT(si.id) as recentSales<br/>FROM book_analytics ba<br/>JOIN book b ON ba.bookId = b.id<br/>LEFT JOIN sale_item si ON b.id = si.bookId<br/>LEFT JOIN sale s ON si.saleId = s.id<br/>  AND s.saleDate >= NOW() - INTERVAL '7 days'<br/>GROUP BY ba.bookId, b.title, ba.averageMonthlySales<br/>HAVING COUNT(si.id) > ba.averageMonthlySales * 2
    
    DB-->>AS: Books with high demand
    
    loop Para cada libro
        AS->>DB: SELECT * FROM alert<br/>WHERE bookId = ?<br/>  AND alertType = 'HIGH_DEMAND'<br/>  AND resolved = false<br/>  AND createdAt >= NOW() - INTERVAL '7 days'
        
        alt Alerta reciente existe
            AS->>AS: Skip
        else No existe alerta reciente
            AS->>DB: INSERT INTO alert<br/>(alertType: 'HIGH_DEMAND', severity: 'MEDIUM', ...)
        end
    end
    
    Note over CRON,DB: Ejecuta diariamente: checkLowRotation()
    
    CRON->>AS: @Cron('0 0 * * *')<br/>checkLowRotation()
    
    AS->>DB: SELECT<br/>  ba.bookId,<br/>  b.title,<br/>  ba.rotationRate,<br/>  ba.lastSaleDate<br/>FROM book_analytics ba<br/>JOIN book b ON ba.bookId = b.id<br/>WHERE ba.rotationRate < 0.1<br/>  OR ba.lastSaleDate < NOW() - INTERVAL '90 days'
    
    DB-->>AS: Books with low rotation
    
    loop Para cada libro
        AS->>DB: Check existing LOW_ROTATION alert
        alt No existe
            AS->>DB: INSERT alert (LOW_ROTATION, LOW)
        end
    end
    
    Note over AS: ✅ Generación de alertas completada
```

### Consulta y Gestión de Alertas

```mermaid
sequenceDiagram
    participant F as Frontend (Admin)
    participant A as Analytics Service
    participant DB as PostgreSQL
    
    Note over F,DB: Listar Alertas Activas
    
    F->>A: GET /alerts?resolved=false
    
    A->>DB: SELECT<br/>  a.*,<br/>  b.title,<br/>  b.isbn,<br/>  i.currentStock<br/>FROM alert a<br/>JOIN book b ON a.bookId = b.id<br/>LEFT JOIN inventory i ON b.id = i.bookId<br/>WHERE a.resolved = ?<br/>ORDER BY a.severity DESC, a.createdAt DESC
    
    DB-->>A: Active alerts
    
    A-->>F: 200 OK<br/>{alerts}
    
    F->>F: Renderizar lista con<br/>- Badge de severidad<br/>- Ícono por tipo<br/>- Acción recomendada
    
    Note over F,DB: Marcar Alerta como Resuelta
    
    F->>A: PATCH /alerts/:id/resolve
    
    A->>A: Validar JWT y rol ADMIN
    
    A->>DB: UPDATE alert<br/>SET resolved = true,<br/>    resolvedAt = NOW(),<br/>    updatedAt = NOW()<br/>WHERE id = ?
    
    DB-->>A: Alert updated
    
    A-->>F: 200 OK<br/>{alert}
    
    F->>F: Actualizar UI<br/>(remover de lista activas)
```

## 📄 Flujo de Generación de Reportes {#reportes}

### Reporte de Análisis ABC (Pareto)

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as Reports Service
    participant DB as PostgreSQL
    
    F->>R: GET /reports/abc-analysis
    
    R->>R: Validar JWT
    
    Note over R,DB: Obtener all books con revenue
    
    R->>DB: SELECT<br/>  b.id,<br/>  b.title,<br/>  ba.totalRevenue,<br/>  ba.totalSales<br/>FROM book b<br/>JOIN book_analytics ba ON b.id = ba.bookId<br/>WHERE ba.totalRevenue > 0<br/>ORDER BY ba.totalRevenue DESC
    
    DB-->>R: Books ordered by revenue
    
    R->>R: Calcular revenue total<br/>totalRevenue = SUM(all revenues)
    
    R->>R: Clasificar productos<br/>accumulatedRevenue = 0<br/>accumulatedPercentage = 0
    
    loop Para cada libro
        R->>R: accumulatedRevenue += book.revenue
        R->>R: accumulatedPercentage = (accumulated / total) * 100
        
        alt accumulatedPercentage <= 80
            R->>R: book.classification = 'A'
        else if accumulatedPercentage <= 95
            R->>R: book.classification = 'B'
        else
            R->>R: book.classification = 'C'
        end
        
        R->>R: book.contribution = (revenue / total) * 100
    end
    
    R->>R: Agrupar por clasificación<br/>classA = products donde class = 'A'<br/>classB = products donde class = 'B'<br/>classC = products donde class = 'C'
    
    R->>R: Calcular estadísticas<br/>stats = {<br/>  totalProducts,<br/>  classACount, classARevenue,<br/>  classBCount, classBRevenue,<br/>  classCCount, classCRevenue<br/>}
    
    R->>R: Construir ABCAnalysisReport {<br/>  products: top 20 de class A,<br/>  summary: stats,<br/>  generatedAt: NOW()<br/>}
    
    R-->>F: 200 OK<br/>{ABCAnalysisReport}
    
    F->>F: Renderizar<br/>- Gráfico Pareto<br/>- Tabla de productos A<br/>- Resumen por clase
```

### Reporte de Estacionalidad

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as Reports Service
    participant DB as PostgreSQL
    
    F->>R: GET /reports/seasonality
    
    R->>DB: SELECT<br/>  EXTRACT(YEAR FROM saleDate) as year,<br/>  EXTRACT(MONTH FROM saleDate) as month,<br/>  SUM(totalAmount) as revenue,<br/>  COUNT(id) as salesCount,<br/>  AVG(totalAmount) as avgTicket<br/>FROM sale<br/>GROUP BY year, month<br/>ORDER BY year, month
    
    DB-->>R: Monthly sales data
    
    R->>R: Detectar patrones<br/>- Meses con mayores ventas<br/>- Meses con menores ventas<br/>- Tendencias year-over-year
    
    R->>DB: SELECT<br/>  g.name as category,<br/>  EXTRACT(MONTH FROM s.saleDate) as month,<br/>  SUM(si.subtotal) as revenue<br/>FROM sale_item si<br/>JOIN book b ON si.bookId = b.id<br/>JOIN genre g ON b.genreId = g.id<br/>JOIN sale s ON si.saleId = s.id<br/>GROUP BY g.name, month
    
    DB-->>R: Category seasonality
    
    R->>R: Construir SeasonalityReport {<br/>  monthlySales: [...],<br/>  peakMonths: [...],<br/>  lowMonths: [...],<br/>  categorySeasonality: {...}<br/>}
    
    R-->>F: 200 OK<br/>{SeasonalityReport}
    
    F->>F: Renderizar<br/>- Gráfico de líneas temporal<br/>- Heatmap por categoría<br/>- Insights de estacionalidad
```

### Audit Trail (Trazabilidad)

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as Reports Service
    participant DB as PostgreSQL
    
    F->>R: GET /reports/audit-trail<br/>?entityName=book<br/>&entityId=xxx<br/>&startDate=2024-01-01<br/>&endDate=2024-12-31
    
    R->>R: Validar JWT y rol ADMIN
    
    R->>R: Parsear filtros
    
    R->>DB: SELECT<br/>  al.*,<br/>  u.firstName,<br/>  u.lastName<br/>FROM audit_log al<br/>LEFT JOIN user u ON al.userId = u.id<br/>WHERE 1=1<br/>  [AND al.entityName = ? IF provided]<br/>  [AND al.entityId = ? IF provided]<br/>  [AND al.createdAt BETWEEN ? AND ? IF dates]<br/>ORDER BY al.createdAt DESC<br/>LIMIT 100
    
    DB-->>R: Audit logs
    
    R->>R: Formatear logs<br/>Para cada log:<br/>- Parsear JSON de changes<br/>- Formatear acción<br/>- Incluir usuario
    
    R->>R: Construir AuditTrailReport {<br/>  logs: [...],<br/>  filters: applied filters,<br/>  totalCount<br/>}
    
    R-->>F: 200 OK<br/>{AuditTrailReport}
    
    F->>F: Renderizar timeline<br/>- Timestamp<br/>- Usuario<br/>- Acción (CREATE/UPDATE/DELETE)<br/>- Diff de cambios (old vs new)
```

## 🏁 Conclusión

Estos diagramas de secuencia documentan los flujos principales del sistema CMPC Test, mostrando:

✅ **Flujos síncronos**: Login, ventas, consultas  
✅ **Flujos asíncronos**: Analytics worker, predicciones  
✅ **Flujos automatizados**: Alertas con cron jobs  
✅ **Flujos de reporting**: Generación de reportes complejos  

Cada flujo incluye:
- Participantes involucrados
- Validaciones de seguridad (JWT, roles)
- Interacciones con base de datos
- Manejo de errores y casos alternativos
- Transformación de datos
