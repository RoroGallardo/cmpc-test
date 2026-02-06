# Esquema de Base de Datos - Sistema CMPC Test

## 📋 Descripción General

Base de datos relacional PostgreSQL 15 que soporta el sistema de microservicios. Usa TypeORM como ORM.

## 🗃️ Diagrama Entidad-Relación Completo

```mermaid
erDiagram
    User ||--o{ Sale : "creates"
    User {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        enum role
        datetime createdAt
        datetime updatedAt
    }
    
    Book ||--o{ SaleItem : "sold_in"
    Book ||--|| BookAnalytics : "has"
    Book ||--|| Inventory : "has"
    Book }o--|| Author : "written_by"
    Book }o--|| Genre : "belongs_to"
    Book }o--|| Publisher : "published_by"
    Book {
        uuid id PK
        string title
        string isbn UK
        text description
        decimal price
        int pages
        date publishedDate
        uuid authorId FK
        uuid genreId FK
        uuid publisherId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Author {
        uuid id PK
        string name
        string biography
        string nationality
        datetime createdAt
        datetime updatedAt
    }
    
    Genre {
        uuid id PK
        string name UK
        text description
        datetime createdAt
        datetime updatedAt
    }
    
    Publisher {
        uuid id PK
        string name UK
        string country
        string website
        datetime createdAt
        datetime updatedAt
    }
    
    Sale ||--|{ SaleItem : "contains"
    Sale {
        uuid id PK
        date saleDate
        decimal totalAmount
        uuid userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    SaleItem {
        uuid id PK
        uuid saleId FK
        uuid bookId FK
        int quantity
        decimal unitPrice
        decimal subtotal
        datetime createdAt
    }
    
    Inventory ||--o{ StockMovement : "tracks"
    Inventory {
        uuid id PK
        uuid bookId FK UK
        int currentStock
        int minimumStock
        int maximumStock
        datetime lastRestockDate
        datetime createdAt
        datetime updatedAt
    }
    
    StockMovement {
        uuid id PK
        uuid inventoryId FK
        enum movementType
        int quantity
        int previousStock
        int newStock
        string reason
        uuid referenceId
        datetime createdAt
    }
    
    BookAnalytics {
        uuid id PK
        uuid bookId FK UK
        int totalSales
        decimal totalRevenue
        int averageMonthlySales
        decimal rotationRate
        datetime lastSaleDate
        datetime createdAt
        datetime updatedAt
    }
    
    Alert {
        uuid id PK
        uuid bookId FK
        enum alertType
        enum severity
        string message
        boolean resolved
        datetime resolvedAt
        datetime createdAt
        datetime updatedAt
    }
    
    Book ||--o{ Alert : "generates"
    
    AuditLog {
        uuid id PK
        string entityName
        string entityId
        enum action
        text changes
        uuid userId FK
        string userEmail
        datetime createdAt
    }
    
    User ||--o{ AuditLog : "performs"
    
    InventorySnapshot {
        uuid id PK
        uuid bookId FK
        int stockAtSnapshot
        decimal valueAtSnapshot
        date snapshotDate
        datetime createdAt
    }
    
    Book ||--o{ InventorySnapshot : "snapshots"
    
    DemandPrediction {
        uuid id PK
        uuid bookId FK
        int predictedDemand
        decimal confidence
        string recommendation
        date predictionDate
        datetime createdAt
    }
    
    Book ||--o{ DemandPrediction : "predicted_for"
```

## 📊 Módulos de Base de Datos

### 🔐 Módulo de Autenticación

#### Tabla: User

```mermaid
graph TD
    User[User Table]
    User --> id[id: UUID PK]
    User --> email[email: VARCHAR UNIQUE]
    User --> password[password: VARCHAR]
    User --> firstName[firstName: VARCHAR]
    User --> lastName[lastName: VARCHAR]
    User --> role[role: ENUM]
    User --> createdAt[createdAt: TIMESTAMP]
    User --> updatedAt[updatedAt: TIMESTAMP]
    
    role --> r1[USER]
    role --> r2[ADMIN]
    
    style User fill:#ffe1e1
    style role fill:#fff4e1
```

**Campos:**
- `id`: Identificador único (UUID v4)
- `email`: Email único, usado para login
- `password`: Contraseña hasheada con bcrypt
- `firstName`: Nombre del usuario
- `lastName`: Apellido del usuario
- `role`: Rol del usuario (USER | ADMIN)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `email`

**Validaciones:**
- Email: Formato válido
- Password: Mínimo 6 caracteres
- Role: Solo valores permitidos

### 📚 Módulo de Catálogo

#### Tabla: Book

```mermaid
classDiagram
    class Book {
        +UUID id
        +String title
        +String isbn [UNIQUE]
        +Text description
        +Decimal price
        +Integer pages
        +Date publishedDate
        +UUID authorId [FK]
        +UUID genreId [FK]
        +UUID publisherId [FK]
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class Author {
        +UUID id
        +String name
        +String biography
        +String nationality
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class Genre {
        +UUID id
        +String name [UNIQUE]
        +Text description
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    class Publisher {
        +UUID id
        +String name [UNIQUE]
        +String country
        +String website
        +Timestamp createdAt
        +Timestamp updatedAt
    }
    
    Book "N" --> "1" Author
    Book "N" --> "1" Genre
    Book "N" --> "1" Publisher
```

**Relaciones:**
- `Book.authorId` → `Author.id` (Many-to-One)
- `Book.genreId` → `Genre.id` (Many-to-One)
- `Book.publisherId` → `Publisher.id` (Many-to-One)

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `isbn`
- INDEX: `authorId`
- INDEX: `genreId`
- INDEX: `publisherId`

#### Tabla: Author

**Campos:**
- `id`: UUID único
- `name`: Nombre del autor
- `biography`: Biografía
- `nationality`: Nacionalidad
- Timestamps

#### Tabla: Genre

**Campos:**
- `id`: UUID único
- `name`: Nombre único del género
- `description`: Descripción

#### Tabla: Publisher

**Campos:**
- `id`: UUID único
- `name`: Nombre único de la editorial
- `country`: País
- `website`: Sitio web

### 💰 Módulo de Ventas

```mermaid
erDiagram
    Sale ||--|{ SaleItem : contains
    Sale }o--|| User : "created_by"
    SaleItem }o--|| Book : "references"
    
    Sale {
        uuid id PK
        date saleDate
        decimal totalAmount
        uuid userId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    SaleItem {
        uuid id PK
        uuid saleId FK
        uuid bookId FK
        int quantity
        decimal unitPrice
        decimal subtotal
        timestamp createdAt
    }
```

#### Tabla: Sale

**Campos:**
- `id`: UUID único
- `saleDate`: Fecha de la venta
- `totalAmount`: Monto total (calculado)
- `userId`: Usuario que registró la venta
- Timestamps

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `userId`
- INDEX: `saleDate`

#### Tabla: SaleItem

**Campos:**
- `id`: UUID único
- `saleId`: Referencia a la venta
- `bookId`: Referencia al libro
- `quantity`: Cantidad vendida
- `unitPrice`: Precio unitario al momento de la venta
- `subtotal`: Cantidad × Precio unitario
- `createdAt`: Timestamp

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `saleId`
- INDEX: `bookId`

**Reglas de Negocio:**
- `subtotal = quantity * unitPrice`
- `Sale.totalAmount = SUM(SaleItem.subtotal)`
- Validación de stock antes de crear

### 📦 Módulo de Inventario

```mermaid
graph TB
    subgraph "Inventario"
        I[Inventory]
        SM[StockMovement]
        IS[InventorySnapshot]
    end
    
    I -->|tracks| SM
    I -->|generates| IS
    
    I --> i1[currentStock]
    I --> i2[minimumStock]
    I --> i3[maximumStock]
    I --> i4[lastRestockDate]
    
    SM --> sm1[movementType]
    SM --> sm2[quantity]
    SM --> sm3[previousStock]
    SM --> sm4[newStock]
    SM --> sm5[reason]
    
    IS --> is1[stockAtSnapshot]
    IS --> is2[valueAtSnapshot]
    IS --> is3[snapshotDate]
    
    style I fill:#e1ffe1
    style SM fill:#e1f5ff
    style IS fill:#fff4e1
```

#### Tabla: Inventory

**Campos:**
- `id`: UUID único
- `bookId`: Referencia al libro (UNIQUE)
- `currentStock`: Stock actual
- `minimumStock`: Stock mínimo permitido
- `maximumStock`: Stock máximo recomendado
- `lastRestockDate`: Última fecha de reabastecimiento
- Timestamps

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `bookId`

**Relación:**
- One-to-One con Book

#### Tabla: StockMovement

**Campos:**
- `id`: UUID único
- `inventoryId`: Referencia al inventario
- `movementType`: Tipo de movimiento (ENUM)
  - `IN`: Entrada
  - `OUT`: Salida
  - `ADJUSTMENT`: Ajuste manual
- `quantity`: Cantidad del movimiento
- `previousStock`: Stock antes del movimiento
- `newStock`: Stock después del movimiento
- `reason`: Razón del movimiento
- `referenceId`: ID de referencia (ej: ID de venta)
- `createdAt`: Timestamp

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `inventoryId`
- INDEX: `createdAt`

#### Tabla: InventorySnapshot

**Campos:**
- `id`: UUID único
- `bookId`: Referencia al libro
- `stockAtSnapshot`: Stock en el momento del snapshot
- `valueAtSnapshot`: Valor del inventario
- `snapshotDate`: Fecha del snapshot
- `createdAt`: Timestamp

**Propósito:** Histórico diario de inventario para análisis de tendencias

### 📊 Módulo de Analytics

```mermaid
graph LR
    subgraph Analytics
        BA[BookAnalytics]
        DP[DemandPrediction]
        A[Alert]
    end
    
    B[Book] --> BA
    B --> DP
    B --> A
    
    BA --> ba1[totalSales]
    BA --> ba2[totalRevenue]
    BA --> ba3[averageMonthlySales]
    BA --> ba4[rotationRate]
    
    DP --> dp1[predictedDemand]
    DP --> dp2[confidence]
    DP --> dp3[recommendation]
    
    A --> a1[alertType]
    A --> a2[severity]
    A --> a3[resolved]
    
    style BA fill:#e1f5ff
    style DP fill:#f0e1ff
    style A fill:#ffe1e1
```

#### Tabla: BookAnalytics

**Campos:**
- `id`: UUID único
- `bookId`: Referencia al libro (UNIQUE)
- `totalSales`: Total de unidades vendidas
- `totalRevenue`: Total de ingresos generados
- `averageMonthlySales`: Promedio de ventas mensuales
- `rotationRate`: Tasa de rotación del inventario
- `lastSaleDate`: Fecha de última venta
- Timestamps

**Relación:**
- One-to-One con Book

**Actualización:**
- Automática vía Analytics Worker al recibir eventos de venta

#### Tabla: DemandPrediction

**Campos:**
- `id`: UUID único
- `bookId`: Referencia al libro
- `predictedDemand`: Demanda predicha (unidades)
- `confidence`: Nivel de confianza (0-1)
- `recommendation`: Recomendación de acción
- `predictionDate`: Fecha de la predicción
- `createdAt`: Timestamp

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `bookId, predictionDate`

**Generación:**
- Automática después de cada venta (Analytics Worker)
- Usa modelo TensorFlow.js

#### Tabla: Alert

**Campos:**
- `id`: UUID único
- `bookId`: Referencia al libro
- `alertType`: Tipo de alerta (ENUM)
  - `LOW_STOCK`: Stock bajo
  - `HIGH_DEMAND`: Alta demanda
  - `LOW_ROTATION`: Baja rotación
  - `RESTOCK_NEEDED`: Reabastecimiento necesario
- `severity`: Severidad (ENUM)
  - `LOW`: Bajo
  - `MEDIUM`: Medio
  - `HIGH`: Alto
  - `CRITICAL`: Crítico
- `message`: Mensaje de la alerta
- `resolved`: Si la alerta fue resuelta
- `resolvedAt`: Fecha de resolución
- Timestamps

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `bookId`
- INDEX: `resolved, createdAt`

**Generación:**
- Automática vía Cron Jobs (cada hora o diaria)

### 📝 Módulo de Auditoría

```mermaid
classDiagram
    class AuditLog {
        +UUID id
        +String entityName
        +String entityId
        +Enum action
        +JSON changes
        +UUID userId
        +String userEmail
        +Timestamp createdAt
    }
    
    class Action {
        <<enumeration>>
        CREATE
        UPDATE
        DELETE
    }
    
    AuditLog --> Action
```

#### Tabla: AuditLog

**Campos:**
- `id`: UUID único
- `entityName`: Nombre de la entidad modificada
- `entityId`: ID de la entidad
- `action`: Acción realizada (CREATE, UPDATE, DELETE)
- `changes`: Objeto JSON con cambios
  - Formato UPDATE: `{ field: { old: value, new: value } }`
  - Formato CREATE: `{ field: value }`
  - Formato DELETE: `{ field: value }`
- `userId`: Usuario que realizó la acción
- `userEmail`: Email del usuario (denormalizado)
- `createdAt`: Timestamp de la acción

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `entityName, entityId`
- INDEX: `userId`
- INDEX: `createdAt`

**Implementación:**
- Via Interceptor en Catalog Service
- Captura automática de todas las modificaciones

## 🔗 Diagrama de Dependencias entre Servicios

```mermaid
graph TB
    subgraph "Auth Service DB"
        U[User]
    end
    
    subgraph "Catalog Service DB"
        B[Book]
        A[Author]
        G[Genre]
        P[Publisher]
        S[Sale]
        SI[SaleItem]
        I[Inventory]
        SM[StockMovement]
        IS[InventorySnapshot]
        AL[AuditLog]
    end
    
    subgraph "Analytics Service DB"
        BA[BookAnalytics]
        DP[DemandPrediction]
        ALT[Alert]
        U2[User - read only]
    end
    
    B --> A
    B --> G
    B --> P
    S --> SI
    SI --> B
    S --> U
    I --> B
    SM --> I
    IS --> B
    AL --> U
    
    BA --> B
    DP --> B
    ALT --> B
    
    style U fill:#ffe1e1
    style U2 fill:#ffe1e1
    style B fill:#e1ffe1
    style BA fill:#e1f5ff
```

## 📈 Estadísticas y Métricas

### Conteo de Tablas por Servicio

| Servicio | Tablas | Propósito |
|----------|--------|-----------|
| Auth Service | 1 | Usuarios y autenticación |
| Catalog Service | 9 | Catálogo, ventas, inventario |
| Analytics Service | 4 | Analytics, predicciones, alertas |
| **Total** | **14** | Sistema completo |

### Tipos de Relaciones

| Tipo | Cantidad | Ejemplos |
|------|----------|----------|
| One-to-One | 3 | Book-BookAnalytics, Book-Inventory |
| One-to-Many | 8 | Book-SaleItem, Sale-SaleItem |
| Many-to-One | 8 | Book-Author, Book-Genre |

## 🔐 Seguridad y Permisos

### Políticas de Acceso

```mermaid
graph TD
    A[Request] --> B{Service}
    
    B -->|Auth Service| C[Full Access to User]
    
    B -->|Catalog Service| D{Role}
    D -->|ADMIN| E[READ + WRITE]
    D -->|USER| F[READ Only]
    
    B -->|Analytics Service| G{Role}
    G -->|ADMIN| H[Full Access]
    G -->|USER| I[Dashboard + Reports Only]
    
    style E fill:#6bff6b
    style H fill:#6bff6b
    style F fill:#fff4e1
    style I fill:#fff4e1
```

### Encriptación

- **Passwords**: bcrypt con salt rounds = 10
- **JWT**: RS256 (RSA con SHA-256)
- **Database**: TLS en producción (recomendado)

## 🎯 Optimizaciones Implementadas

### Índices

```sql
-- Índices de búsqueda frecuente
CREATE INDEX idx_book_author ON book(authorId);
CREATE INDEX idx_book_genre ON book(genreId);
CREATE INDEX idx_book_publisher ON book(publisherId);
CREATE INDEX idx_sale_date ON sale(saleDate);
CREATE INDEX idx_alert_resolved ON alert(resolved, createdAt);

-- Índices únicos
CREATE UNIQUE INDEX idx_user_email ON user(email);
CREATE UNIQUE INDEX idx_book_isbn ON book(isbn);
CREATE UNIQUE INDEX idx_inventory_book ON inventory(bookId);
```

### Constraints

```sql
-- Check constraints
ALTER TABLE inventory ADD CONSTRAINT chk_current_stock_positive 
    CHECK (currentStock >= 0);

ALTER TABLE sale ADD CONSTRAINT chk_total_amount_positive 
    CHECK (totalAmount >= 0);

ALTER TABLE sale_item ADD CONSTRAINT chk_quantity_positive 
    CHECK (quantity > 0);

-- FK constraints con ON DELETE
ALTER TABLE book ADD CONSTRAINT fk_book_author 
    FOREIGN KEY (authorId) REFERENCES author(id) ON DELETE CASCADE;
```

### Particionamiento (Future)

**Candidatos para particionamiento:**
- `audit_log` por fecha (partición mensual)
- `stock_movement` por fecha (partición mensual)
- `inventory_snapshot` por fecha (partición anual)

## 📊 Queries Comunes Optimizadas

### Top 10 Libros Más Vendidos

```sql
SELECT 
    b.id,
    b.title,
    ba.totalSales,
    ba.totalRevenue
FROM book b
INNER JOIN book_analytics ba ON b.id = ba.bookId
ORDER BY ba.totalSales DESC
LIMIT 10;
```

### Inventario con Stock Bajo

```sql
SELECT 
    b.id,
    b.title,
    i.currentStock,
    i.minimumStock
FROM book b
INNER JOIN inventory i ON b.id = i.bookId
WHERE i.currentStock <= i.minimumStock;
```

### Ventas del Mes Actual

```sql
SELECT 
    DATE(s.saleDate) as date,
    SUM(s.totalAmount) as dailyRevenue,
    COUNT(s.id) as dailySales
FROM sale s
WHERE s.saleDate >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(s.saleDate)
ORDER BY DATE(s.saleDate);
```

## 🔄 Migraciones

### Estrategia de Migraciones

- **TypeORM Migrations**: Automáticas en desarrollo
- **Version Control**: Todas las migraciones en Git
- **Rollback**: Siempre implementar `down` migrations
- **Testing**: Probar migraciones en staging antes de producción

### Ejemplo de Migración

```typescript
export class AddBookAnalytics1234567890 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'book_analytics',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true },
                { name: 'bookId', type: 'uuid', isUnique: true },
                { name: 'totalSales', type: 'int', default: 0 },
                // ... more columns
            ],
        }));
    }
    
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('book_analytics');
    }
}
```

## 🎯 Mejores Prácticas Implementadas

✅ UUIDs en lugar de auto-increment IDs (seguridad, distributed systems)
✅ Timestamps automáticos (createdAt, updatedAt)
✅ Soft deletes donde aplica (datos históricos)
✅ Normalización apropiada (3NF)
✅ Denormalización estratégica (analytics)
✅ Índices en foreign keys
✅ Constraints de integridad
✅ Transacciones ACID para ventas
✅ Audit logging completo
