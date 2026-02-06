# Diagramas de Componentes y Deployment - Sistema CMPC Test

## 📋 Índice
1. [Diagrama de Componentes](#componentes)
2. [Diagrama de Deployment](#deployment)
3. [Diagrama de Paquetes](#paquetes)
4. [Diagrama de Clases (Entidades)](#clases)
5. [Diagrama de Estados](#estados)

## 🧩 Diagrama de Componentes {#componentes}

### Vista General del Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Angular App]
        
        subgraph "Angular Modules"
            AUTH_M[Auth Module]
            CATALOG_M[Catalog Module]
            ANALYTICS_M[Analytics Module]
            SHARED_M[Shared Module]
        end
        
        UI --> AUTH_M
        UI --> CATALOG_M
        UI --> ANALYTICS_M
        UI --> SHARED_M
        
        subgraph "Services"
            AUTH_S[AuthService]
            CATALOG_S[CatalogService]
            ANALYTICS_S[AnalyticsService]
            HTTP[HttpClient]
        end
        
        AUTH_M --> AUTH_S
        CATALOG_M --> CATALOG_S
        ANALYTICS_M --> ANALYTICS_S
        
        AUTH_S --> HTTP
        CATALOG_S --> HTTP
        ANALYTICS_S --> HTTP
        
        subgraph "Guards & Interceptors"
            AUTH_G[AuthGuard]
            JWT_I[JwtInterceptor]
            ERROR_I[ErrorInterceptor]
        end
    end
    
    subgraph "Backend Services"
        subgraph "Auth Service"
            AUTH_C[AuthController]
            AUTH_SVC[AuthService]
            USER_SVC[UserService]
            JWT_SVC[JwtService]
            
            AUTH_C --> AUTH_SVC
            AUTH_SVC --> USER_SVC
            AUTH_SVC --> JWT_SVC
        end
        
        subgraph "Catalog Service"
            BOOK_C[BooksController]
            SALE_C[SalesController]
            BOOK_SVC[BooksService]
            SALE_SVC[SalesService]
            INV_SVC[InventoryService]
            KAFKA_P[KafkaProducer]
            
            BOOK_C --> BOOK_SVC
            SALE_C --> SALE_SVC
            SALE_SVC --> INV_SVC
            SALE_SVC --> KAFKA_P
        end
        
        subgraph "Analytics Service"
            ANA_C[AnalyticsController]
            PRED_C[PredictiveController]
            REP_C[ReportsController]
            ALERT_C[AlertsController]
            
            ANA_SVC_A[AnalyticsService]
            PRED_SVC[PredictiveService]
            REP_SVC[ReportsService]
            ALERT_SVC[AlertsService]
            TF[TensorFlow.js]
            CRON[CronJobs]
            
            ANA_C --> ANA_SVC_A
            PRED_C --> PRED_SVC
            REP_C --> REP_SVC
            ALERT_C --> ALERT_SVC
            
            PRED_SVC --> TF
            ALERT_SVC --> CRON
        end
        
        subgraph "Analytics Worker"
            KAFKA_C[KafkaConsumer]
            WORKER_SVC[WorkerService]
            ANALYTICS_UPD[AnalyticsUpdater]
            
            KAFKA_C --> WORKER_SVC
            WORKER_SVC --> ANALYTICS_UPD
            WORKER_SVC --> PRED_SVC
        end
    end
    
    subgraph "Infrastructure"
        KAFKA[Kafka/Redpanda]
        DB[(PostgreSQL)]
    end
    
    subgraph "Shared Library"
        ENTITIES[TypeORM Entities]
        DTOS[DTOs]
        INTERFACES[Interfaces]
        CONFIG[Config]
        GUARDS[Guards]
    end
    
    HTTP --> AUTH_C
    HTTP --> BOOK_C
    HTTP --> SALE_C
    HTTP --> ANA_C
    HTTP --> PRED_C
    HTTP --> REP_C
    HTTP --> ALERT_C
    
    AUTH_SVC --> DB
    BOOK_SVC --> DB
    SALE_SVC --> DB
    ANA_SVC_A --> DB
    PRED_SVC --> DB
    REP_SVC --> DB
    ALERT_SVC --> DB
    ANALYTICS_UPD --> DB
    
    KAFKA_P --> KAFKA
    KAFKA --> KAFKA_C
    
    AUTH_C -.uses.-> ENTITIES
    BOOK_C -.uses.-> ENTITIES
    SALE_C -.uses.-> ENTITIES
    ANA_C -.uses.-> ENTITIES
    
    AUTH_C -.uses.-> DTOS
    BOOK_C -.uses.-> DTOS
    SALE_C -.uses.-> DTOS
    
    style UI fill:#e1f5ff
    style AUTH_C fill:#ffe1e1
    style BOOK_C fill:#e1ffe1
    style SALE_C fill:#e1ffe1
    style ANA_C fill:#fff4e1
    style KAFKA fill:#ffe1f0
    style DB fill:#e1e1e1
```

### Detalle: Frontend Components

```mermaid
graph LR
    subgraph "App Core"
        APP[App Component]
        ROUTER[Router]
        NAV[Navigation]
    end
    
    subgraph "Auth Feature"
        LOGIN[Login Component]
        REGISTER[Register Component]
        AUTH_SVC[Auth Service]
        AUTH_G[Auth Guard]
    end
    
    subgraph "Catalog Feature"
        BOOK_LIST[Book List Component]
        BOOK_DETAIL[Book Detail Component]
        BOOK_FORM[Book Form Component]
        CATALOG_SVC[Catalog Service]
    end
    
    subgraph "Sales Feature"
        SALE_LIST[Sales List Component]
        SALE_FORM[Sale Form Component]
        SALE_SVC[Sales Service]
    end
    
    subgraph "Analytics Feature"
        DASHBOARD[Dashboard Component]
        REPORTS[Reports Component]
        PREDICTIONS[Predictions Component]
        ALERTS[Alerts Component]
        ANALYTICS_SVC[Analytics Service]
    end
    
    subgraph "Shared"
        HEADER[Header Component]
        FOOTER[Footer Component]
        LOADER[Loader Component]
        ERROR[Error Component]
        HTTP_INT[HTTP Interceptor]
    end
    
    APP --> ROUTER
    APP --> NAV
    APP --> HEADER
    APP --> FOOTER
    
    ROUTER --> LOGIN
    ROUTER --> REGISTER
    ROUTER --> BOOK_LIST
    ROUTER --> DASHBOARD
    
    LOGIN --> AUTH_SVC
    REGISTER --> AUTH_SVC
    
    BOOK_LIST --> CATALOG_SVC
    BOOK_DETAIL --> CATALOG_SVC
    BOOK_FORM --> CATALOG_SVC
    
    SALE_LIST --> SALE_SVC
    SALE_FORM --> SALE_SVC
    
    DASHBOARD --> ANALYTICS_SVC
    REPORTS --> ANALYTICS_SVC
    PREDICTIONS --> ANALYTICS_SVC
    ALERTS --> ANALYTICS_SVC
    
    AUTH_SVC --> HTTP_INT
    CATALOG_SVC --> HTTP_INT
    SALE_SVC --> HTTP_INT
    ANALYTICS_SVC --> HTTP_INT
    
    AUTH_G -.protects.-> BOOK_LIST
    AUTH_G -.protects.-> DASHBOARD
    AUTH_G -.protects.-> SALE_FORM
    
    style APP fill:#e1f5ff
    style LOGIN fill:#ffe1e1
    style DASHBOARD fill:#fff4e1
    style HTTP_INT fill:#f0e1ff
```

### Detalle: Catalog Service Components

```mermaid
graph TB
    subgraph "Controllers Layer"
        BC[BooksController]
        AC[AuthorsController]
        GC[GenresController]
        PC[PublishersController]
        SC[SalesController]
    end
    
    subgraph "Services Layer"
        BS[BooksService]
        AUS[AuthorsService]
        GS[GenresService]
        PS[PublishersService]
        SS[SalesService]
        IS[InventoryService]
    end
    
    subgraph "Kafka Integration"
        KP[KafkaProducer]
        KM[Kafka Module]
    end
    
    subgraph "Database Layer"
        BR[BookRepository]
        AUR[AuthorRepository]
        GR[GenreRepository]
        PR[PublisherRepository]
        SR[SaleRepository]
        SIR[SaleItemRepository]
        IR[InventoryRepository]
        SMR[StockMovementRepository]
    end
    
    subgraph "Guards & Interceptors"
        JG[JwtAuthGuard]
        RG[RolesGuard]
        AI[AuditInterceptor]
    end
    
    subgraph "TypeORM Entities"
        BE[Book Entity]
        AUE[Author Entity]
        GE[Genre Entity]
        PE[Publisher Entity]
        SE[Sale Entity]
        SIE[SaleItem Entity]
        IE[Inventory Entity]
        SME[StockMovement Entity]
    end
    
    BC --> BS
    AC --> AUS
    GC --> GS
    PC --> PS
    SC --> SS
    
    BS --> BR
    AUS --> AUR
    GS --> GR
    PS --> PR
    SS --> SR
    SS --> SIR
    SS --> IS
    
    IS --> IR
    IS --> SMR
    
    SS --> KP
    KP --> KM
    
    BR --> BE
    AUR --> AUE
    GR --> GE
    PR --> PE
    SR --> SE
    SIR --> SIE
    IR --> IE
    SMR --> SME
    
    BC -.uses.-> JG
    BC -.uses.-> RG
    BC -.uses.-> AI
    
    style BC fill:#e1ffe1
    style SS fill:#e1f5ff
    style KP fill:#ffe1f0
    style JG fill:#ffe1e1
```

## 🚀 Diagrama de Deployment {#deployment}

### Arquitectura de Deployment en Desarrollo

```mermaid
graph TB
    subgraph "Developer Machine"
        DEV[Developer]
        
        subgraph "Local Environment"
            subgraph "Node.js Runtime :4200"
                FE_DEV[Angular Dev Server]
            end
            
            subgraph "Node.js Runtime :3001"
                AUTH_DEV[Auth Service]
            end
            
            subgraph "Node.js Runtime :3002"
                CAT_DEV[Catalog Service]
            end
            
            subgraph "Node.js Runtime :3003"
                ANA_DEV[Analytics Service]
            end
            
            subgraph "Node.js Runtime"
                WORKER_DEV[Analytics Worker]
            end
        end
        
        subgraph "Docker Desktop"
            subgraph "PostgreSQL Container :5432"
                DB_DEV[(Database)]
            end
            
            subgraph "Redpanda Container :19092"
                KAFKA_DEV[Kafka/Redpanda]
                CONSOLE_DEV[Redpanda Console :8080]
            end
        end
        
        subgraph "VS Code"
            CODE[Source Code]
            NX[Nx CLI]
        end
    end
    
    DEV --> CODE
    CODE --> NX
    
    NX -.builds.-> FE_DEV
    NX -.builds.-> AUTH_DEV
    NX -.builds.-> CAT_DEV
    NX -.builds.-> ANA_DEV
    NX -.builds.-> WORKER_DEV
    
    FE_DEV --> AUTH_DEV
    FE_DEV --> CAT_DEV
    FE_DEV --> ANA_DEV
    
    AUTH_DEV --> DB_DEV
    CAT_DEV --> DB_DEV
    ANA_DEV --> DB_DEV
    WORKER_DEV --> DB_DEV
    
    CAT_DEV --> KAFKA_DEV
    WORKER_DEV --> KAFKA_DEV
    
    DEV -.monitors.-> CONSOLE_DEV
    
    style FE_DEV fill:#e1f5ff
    style AUTH_DEV fill:#ffe1e1
    style CAT_DEV fill:#e1ffe1
    style ANA_DEV fill:#fff4e1
    style WORKER_DEV fill:#f0e1ff
    style DB_DEV fill:#e1e1e1
    style KAFKA_DEV fill:#ffe1f0
```

### Arquitectura de Deployment en Producción (Propuesta)

```mermaid
graph TB
    subgraph "Users"
        BROWSER[Web Browsers]
        MOBILE[Mobile Apps]
    end
    
    subgraph "CDN / Load Balancer"
        CDN[CloudFront / Nginx]
        LB[Load Balancer]
    end
    
    subgraph "Frontend Tier"
        subgraph "S3 Bucket / Web Server"
            FE_PROD[Angular Static Files]
        end
    end
    
    subgraph "Application Tier - Kubernetes Cluster"
        subgraph "Auth Service Pods"
            AUTH_POD1[Auth Service - Pod 1]
            AUTH_POD2[Auth Service - Pod 2]
        end
        
        subgraph "Catalog Service Pods"
            CAT_POD1[Catalog Service - Pod 1]
            CAT_POD2[Catalog Service - Pod 2]
        end
        
        subgraph "Analytics Service Pods"
            ANA_POD1[Analytics Service - Pod 1]
            ANA_POD2[Analytics Service - Pod 2]
        end
        
        subgraph "Worker Pods"
            WORKER_POD1[Worker - Pod 1]
            WORKER_POD2[Worker - Pod 2]
        end
        
        subgraph "Ingress"
            INGRESS[Nginx Ingress Controller]
        end
    end
    
    subgraph "Data Tier - AWS RDS"
        subgraph "RDS Instance"
            DB_MASTER[(PostgreSQL Master)]
            DB_REPLICA[(PostgreSQL Read Replica)]
        end
    end
    
    subgraph "Message Broker - MSK"
        KAFKA_CLUSTER[Amazon MSK Cluster<br/>3 Brokers]
    end
    
    subgraph "Monitoring & Logging"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        CLOUDWATCH[CloudWatch Logs]
    end
    
    BROWSER --> CDN
    MOBILE --> CDN
    
    CDN --> FE_PROD
    CDN --> LB
    
    LB --> INGRESS
    
    INGRESS --> AUTH_POD1
    INGRESS --> AUTH_POD2
    INGRESS --> CAT_POD1
    INGRESS --> CAT_POD2
    INGRESS --> ANA_POD1
    INGRESS --> ANA_POD2
    
    AUTH_POD1 --> DB_MASTER
    AUTH_POD2 --> DB_MASTER
    
    CAT_POD1 --> DB_MASTER
    CAT_POD2 --> DB_MASTER
    
    ANA_POD1 --> DB_REPLICA
    ANA_POD2 --> DB_REPLICA
    
    CAT_POD1 --> KAFKA_CLUSTER
    CAT_POD2 --> KAFKA_CLUSTER
    
    WORKER_POD1 --> KAFKA_CLUSTER
    WORKER_POD2 --> KAFKA_CLUSTER
    WORKER_POD1 --> DB_MASTER
    WORKER_POD2 --> DB_MASTER
    
    DB_MASTER -.replicates.-> DB_REPLICA
    
    AUTH_POD1 -.metrics.-> PROMETHEUS
    CAT_POD1 -.metrics.-> PROMETHEUS
    ANA_POD1 -.metrics.-> PROMETHEUS
    
    PROMETHEUS --> GRAFANA
    
    AUTH_POD1 -.logs.-> CLOUDWATCH
    CAT_POD1 -.logs.-> CLOUDWATCH
    ANA_POD1 -.logs.-> CLOUDWATCH
    WORKER_POD1 -.logs.-> CLOUDWATCH
    
    style FE_PROD fill:#e1f5ff
    style AUTH_POD1 fill:#ffe1e1
    style CAT_POD1 fill:#e1ffe1
    style ANA_POD1 fill:#fff4e1
    style WORKER_POD1 fill:#f0e1ff
    style DB_MASTER fill:#e1e1e1
    style KAFKA_CLUSTER fill:#ffe1f0
```

### Deployment con Docker Compose (Simplificado)

```mermaid
graph TB
    subgraph "Docker Compose Network: cmpc-network"
        subgraph "Backend Services"
            AUTH[auth-service<br/>Port 3001<br/>Node:20-alpine]
            CAT[catalog-service<br/>Port 3002<br/>Node:20-alpine]
            ANA[analytics-service<br/>Port 3003<br/>Node:20-alpine]
            WORKER[analytics-worker<br/>No exposed port<br/>Node:20-alpine]
        end
        
        subgraph "Frontend"
            FE[frontend<br/>Port 4200<br/>Node:20-alpine<br/>nginx serve]
        end
        
        subgraph "Infrastructure"
            DB[(postgres<br/>Port 5432<br/>postgres:15-alpine)]
            
            KAFKA[redpanda<br/>Port 19092<br/>redpanda:23.3.5]
            
            CONSOLE[redpanda-console<br/>Port 8080<br/>redpandadata/console]
        end
    end
    
    subgraph "Volumes"
        VOL_DB[postgres_data]
        VOL_KAFKA[redpanda_data]
    end
    
    FE --> AUTH
    FE --> CAT
    FE --> ANA
    
    AUTH --> DB
    CAT --> DB
    ANA --> DB
    WORKER --> DB
    
    CAT --> KAFKA
    WORKER --> KAFKA
    
    CONSOLE --> KAFKA
    
    DB -.persists to.-> VOL_DB
    KAFKA -.persists to.-> VOL_KAFKA
    
    style FE fill:#e1f5ff
    style AUTH fill:#ffe1e1
    style CAT fill:#e1ffe1
    style ANA fill:#fff4e1
    style WORKER fill:#f0e1ff
    style DB fill:#e1e1e1
    style KAFKA fill:#ffe1f0
```

## 📦 Diagrama de Paquetes {#paquetes}

### Estructura de Monorepo

```mermaid
graph TB
    subgraph "cmpc-test (Monorepo Root)"
        ROOT[package.json<br/>nx.json<br/>tsconfig.json]
        
        subgraph "apps/"
            subgraph "frontend"
                FE_PKG[package.json]
                FE_SRC[src/]
                FE_COMP[components/]
                FE_SERV[services/]
                FE_GUARDS[guards/]
            end
            
            subgraph "auth-service"
                AUTH_PKG[package.json]
                AUTH_SRC[src/]
                AUTH_MOD[auth/<br/>users/]
            end
            
            subgraph "catalog-service"
                CAT_PKG[package.json]
                CAT_SRC[src/]
                CAT_MOD[books/<br/>sales/<br/>inventory/]
            end
            
            subgraph "analytics-service"
                ANA_PKG[package.json]
                ANA_SRC[src/]
                ANA_MOD[analytics/<br/>predictive/<br/>reports/<br/>alerts/]
            end
            
            subgraph "analytics-worker"
                WORKER_PKG[package.json]
                WORKER_SRC[src/]
                WORKER_MOD[consumers/<br/>services/]
            end
        end
        
        subgraph "libs/"
            subgraph "shared"
                SHARED_PKG[package.json]
                SHARED_SRC[src/]
                
                subgraph "shared/src"
                    ENTITIES[entities/]
                    DTOS[dtos/]
                    INTERFACES[interfaces/]
                    CONFIG[config/]
                    AUTH_LIB[auth/]
                    KAFKA_LIB[kafka/]
                    DATABASE[database/]
                end
            end
            
            subgraph "utils"
                UTILS_PKG[package.json]
                UTILS_SRC[src/]
            end
        end
        
        subgraph "docs/"
            DOC_ARCH[ARCHITECTURE.md]
            DOC_USE[USE_CASES.md]
            DOC_DB[DATABASE_SCHEMA.md]
            DOC_SEQ[SEQUENCE_DIAGRAMS.md]
        end
        
        subgraph "scripts/"
            SCRIPTS[generate-jwt-keys.sh<br/>seed-data.sh]
        end
    end
    
    FE_SRC --> SHARED_SRC
    AUTH_SRC --> SHARED_SRC
    CAT_SRC --> SHARED_SRC
    ANA_SRC --> SHARED_SRC
    WORKER_SRC --> SHARED_SRC
    
    FE_SRC -.uses.-> UTILS_SRC
    AUTH_SRC -.uses.-> UTILS_SRC
    
    style ROOT fill:#f5f5f5
    style SHARED_SRC fill:#fff4e1
    style FE_SRC fill:#e1f5ff
    style AUTH_SRC fill:#ffe1e1
    style CAT_SRC fill:#e1ffe1
    style ANA_SRC fill:#fff4e1
```

### Dependencias entre Paquetes

```mermaid
graph LR
    subgraph "External Dependencies"
        NESTJS[@nestjs/core<br/>@nestjs/common]
        TYPEORM[typeorm]
        ANGULAR[@angular/core]
        RXJS[rxjs]
        KAFKA[kafkajs]
        TENSORFLOW[@tensorflow/tfjs-node]
        JEST[jest]
    end
    
    subgraph "Internal Packages"
        SHARED[@cmpc-test/shared]
        UTILS[@cmpc-test/utils]
    end
    
    subgraph "Applications"
        AUTH[auth-service]
        CAT[catalog-service]
        ANA[analytics-service]
        WORKER[analytics-worker]
        FE[frontend]
    end
    
    AUTH --> NESTJS
    AUTH --> TYPEORM
    AUTH --> SHARED
    AUTH --> JEST
    
    CAT --> NESTJS
    CAT --> TYPEORM
    CAT --> SHARED
    CAT --> KAFKA
    CAT --> JEST
    
    ANA --> NESTJS
    ANA --> TYPEORM
    ANA --> SHARED
    ANA --> TENSORFLOW
    ANA --> JEST
    
    WORKER --> NESTJS
    WORKER --> TYPEORM
    WORKER --> SHARED
    WORKER --> KAFKA
    WORKER --> TENSORFLOW
    
    FE --> ANGULAR
    FE --> RXJS
    FE --> JEST
    
    SHARED --> TYPEORM
    SHARED --> NESTJS
    
    style SHARED fill:#fff4e1
    style NESTJS fill:#e1294f
    style ANGULAR fill:#dd0031
```

## 🎯 Diagrama de Clases - Entidades Principales {#clases}

### Módulo de Catálogo

```mermaid
classDiagram
    class Book {
        -UUID id
        -String title
        -String isbn
        -Text description
        -Decimal price
        -Integer pages
        -Date publishedDate
        -UUID authorId
        -UUID genreId
        -UUID publisherId
        -Timestamp createdAt
        -Timestamp updatedAt
        +Author author
        +Genre genre
        +Publisher publisher
        +Inventory inventory
        +BookAnalytics analytics
        +SaleItem[] saleItems
    }
    
    class Author {
        -UUID id
        -String name
        -String biography
        -String nationality
        -Timestamp createdAt
        -Timestamp updatedAt
        +Book[] books
    }
    
    class Genre {
        -UUID id
        -String name
        -Text description
        -Timestamp createdAt
        -Timestamp updatedAt
        +Book[] books
    }
    
    class Publisher {
        -UUID id
        -String name
        -String country
        -String website
        -Timestamp createdAt
        -Timestamp updatedAt
        +Book[] books
    }
    
    class Inventory {
        -UUID id
        -UUID bookId
        -Integer currentStock
        -Integer minimumStock
        -Integer maximumStock
        -Timestamp lastRestockDate
        -Timestamp createdAt
        -Timestamp updatedAt
        +Book book
        +StockMovement[] movements
    }
    
    class StockMovement {
        -UUID id
        -UUID inventoryId
        -MovementType movementType
        -Integer quantity
        -Integer previousStock
        -Integer newStock
        -String reason
        -UUID referenceId
        -Timestamp createdAt
        +Inventory inventory
    }
    
    Book "N" --> "1" Author
    Book "N" --> "1" Genre
    Book "N" --> "1" Publisher
    Book "1" --> "1" Inventory
    Inventory "1" --> "N" StockMovement
```

### Módulo de Ventas

```mermaid
classDiagram
    class Sale {
        -UUID id
        -Date saleDate
        -Decimal totalAmount
        -UUID userId
        -Timestamp createdAt
        -Timestamp updatedAt
        +User user
        +SaleItem[] items
        +calculateTotal() Decimal
    }
    
    class SaleItem {
        -UUID id
        -UUID saleId
        -UUID bookId
        -Integer quantity
        -Decimal unitPrice
        -Decimal subtotal
        -Timestamp createdAt
        +Sale sale
        +Book book
        +calculateSubtotal() Decimal
    }
    
    class User {
        -UUID id
        -String email
        -String password
        -String firstName
        -String lastName
        -UserRole role
        -Timestamp createdAt
        -Timestamp updatedAt
        +Sale[] sales
        +validatePassword(password) Boolean
        +hashPassword(password) String
    }
    
    Sale "1" --> "N" SaleItem
    Sale "N" --> "1" User
    SaleItem "N" --> "1" Book
```

### Módulo de Analytics

```mermaid
classDiagram
    class BookAnalytics {
        -UUID id
        -UUID bookId
        -Integer totalSales
        -Decimal totalRevenue
        -Integer averageMonthlySales
        -Decimal rotationRate
        -Timestamp lastSaleDate
        -Timestamp createdAt
        -Timestamp updatedAt
        +Book book
        +updateFromSale(quantity, amount) void
        +calculateRotationRate() Decimal
    }
    
    class DemandPrediction {
        -UUID id
        -UUID bookId
        -Integer predictedDemand
        -Decimal confidence
        -String recommendation
        -Date predictionDate
        -Timestamp createdAt
        +Book book
        +shouldRestock() Boolean
    }
    
    class Alert {
        -UUID id
        -UUID bookId
        -AlertType alertType
        -Severity severity
        -String message
        -Boolean resolved
        -Timestamp resolvedAt
        -Timestamp createdAt
        -Timestamp updatedAt
        +Book book
        +resolve() void
        +isActive() Boolean
    }
    
    class AuditLog {
        -UUID id
        -String entityName
        -String entityId
        -Action action
        -JSON changes
        -UUID userId
        -String userEmail
        -Timestamp createdAt
        +User user
        +getChangeSummary() String
    }
    
    BookAnalytics "1" --> "1" Book
    DemandPrediction "N" --> "1" Book
    Alert "N" --> "1" Book
    AuditLog "N" --> "1" User
```

## 🔄 Diagrama de Estados {#estados}

### Estado de una Venta

```mermaid
stateDiagram-v2
    [*] --> Draft: Iniciar venta
    
    Draft --> ValidatingStock: Agregar items
    ValidatingStock --> Draft: Stock suficiente
    ValidatingStock --> StockError: Stock insuficiente
    
    StockError --> Draft: Ajustar cantidades
    
    Draft --> Processing: Confirmar venta
    
    Processing --> UpdatingInventory: Validación OK
    UpdatingInventory --> CreatingSale: Inventario actualizado
    CreatingSale --> PublishingEvent: Venta guardada
    PublishingEvent --> Completed: Evento publicado
    
    Processing --> Failed: Error de validación
    UpdatingInventory --> Failed: Error de DB
    CreatingSale --> Failed: Error de DB
    
    Failed --> Draft: Reintentar
    
    Completed --> [*]
    
    note right of Processing
        Transacción de BD
        - Validar datos
        - Verificar stock
        - Calcular totales
    end note
    
    note right of PublishingEvent
        Publicar a Kafka:
        - sale.created
        - {saleId, items}
    end note
```

### Estado de una Alerta

```mermaid
stateDiagram-v2
    [*] --> Pending: Alerta creada
    
    Pending --> Active: Condiciones persisten
    Pending --> AutoResolved: Condiciones normalizadas
    
    Active --> Acknowledged: Admin visualiza
    Acknowledged --> InProgress: Admin toma acción
    
    InProgress --> Resolved: Acción completada
    InProgress --> Active: Acción fallida
    
    AutoResolved --> [*]
    Resolved --> [*]
    
    note right of Active
        Tipos de alerta:
        - LOW_STOCK
        - HIGH_DEMAND
        - LOW_ROTATION
        - RESTOCK_NEEDED
    end note
    
    note right of Resolved
        Resolución manual:
        - Timestamp de resolución
        - Usuario que resolvió
    end note
```

### Estado de Inventario de un Libro

```mermaid
stateDiagram-v2
    [*] --> Normal: Stock > minimum
    
    Normal --> LowStock: Stock <= minimum
    Normal --> Optimal: minimum < Stock <= maximum
    Normal --> Overstock: Stock > maximum
    
    LowStock --> CriticalLow: Stock <= minimum / 2
    LowStock --> Normal: Reabastecimiento
    
    CriticalLow --> OutOfStock: Stock = 0
    CriticalLow --> LowStock: Reabastecimiento parcial
    
    OutOfStock --> LowStock: Reabastecimiento
    
    Optimal --> Normal: Ventas
    Optimal --> Overstock: Reabastecimiento excesivo
    
    Overstock --> Optimal: Ajuste / Ventas
    
    note right of LowStock
        Trigger:
        - Generar alerta LOW_STOCK
        - Severity: HIGH
    end note
    
    note right of CriticalLow
        Trigger:
        - Generar alerta LOW_STOCK
        - Severity: CRITICAL
        - Notificar admin
    end note
    
    note right of OutOfStock
        Trigger:
        - Bloquear ventas
        - Alerta urgente
        - Predicción de demanda
    end note
```

### Estado de Procesamiento de Predicción

```mermaid
stateDiagram-v2
    [*] --> Idle: Worker esperando
    
    Idle --> ReceivingEvent: sale.created recibido
    
    ReceivingEvent --> FetchingData: Extraer bookId
    FetchingData --> PreparingDataset: Datos obtenidos
    
    PreparingDataset --> InsufficientData: < 5 registros
    PreparingDataset --> TrainingModel: >= 5 registros
    
    InsufficientData --> SimpleCalculation: Usar promedio
    SimpleCalculation --> GeneratingRecommendation
    
    TrainingModel --> Predicting: Modelo entrenado
    Predicting --> GeneratingRecommendation: Predicción completa
    
    GeneratingRecommendation --> SavingPrediction: Recomendación creada
    SavingPrediction --> Completed: Guardado en BD
    
    TrainingModel --> Failed: Error de modelo
    Predicting --> Failed: Error de predicción
    SavingPrediction --> Failed: Error de BD
    
    Failed --> Idle: Log error
    Completed --> Idle: Esperar siguiente evento
    
    note right of TrainingModel
        TensorFlow.js:
        - Normalizar datos
        - Entrenar modelo
        - 100 epochs
    end note
```

## 📊 Métricas y Monitoreo

### Health Checks

```mermaid
graph TB
    subgraph "Health Check Endpoints"
        HC[GET /health]
    end
    
    subgraph "Checks Realizados"
        DB_CHECK[Database<br/>Connection]
        KAFKA_CHECK[Kafka<br/>Connection]
        DISK_CHECK[Disk<br/>Space]
        MEMORY_CHECK[Memory<br/>Usage]
    end
    
    HC --> DB_CHECK
    HC --> KAFKA_CHECK
    HC --> DISK_CHECK
    HC --> MEMORY_CHECK
    
    DB_CHECK --> STATUS{All Healthy?}
    KAFKA_CHECK --> STATUS
    DISK_CHECK --> STATUS
    MEMORY_CHECK --> STATUS
    
    STATUS -->|Yes| HEALTHY[200 OK<br/>{status: 'up'}]
    STATUS -->|No| UNHEALTHY[503 Service Unavailable<br/>{status: 'down', details}]
    
    style HEALTHY fill:#6bff6b
    style UNHEALTHY fill:#ff6b6b
```

## 🎯 Conclusión

Esta documentación de componentes y deployment proporciona:

✅ **Vista de Componentes**: Arquitectura detallada de cada capa  
✅ **Deployment**: Estrategias para desarrollo y producción  
✅ **Paquetes**: Estructura de monorepo y dependencias  
✅ **Clases**: Modelo de dominio completo  
✅ **Estados**: Máquinas de estado de procesos críticos  

Útil para:
- Onboarding de nuevos desarrolladores
- Planificación de deployment
- Comprensión de flujos de estado
- Decisiones de arquitectura
