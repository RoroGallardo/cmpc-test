# Casos de Uso - Sistema CMPC Test

## 📋 Índice
1. [Diagrama General de Casos de Uso](#diagrama-general)
2. [Casos de Uso de Autenticación](#autenticación)
3. [Casos de Uso de Catálogo](#catálogo)
4. [Casos de Uso de Ventas](#ventas)
5. [Casos de Uso de Analytics](#analytics)
6. [Casos de Uso Administrativos](#administrativos)

## Diagrama General de Casos de Uso {#diagrama-general}

```mermaid
graph TB
    subgraph "Actores"
        USER[👤 Usuario]
        ADMIN[👨‍💼 Administrador]
        SYSTEM[🤖 Sistema]
    end
    
    subgraph "Auth Service"
        UC1[Registrarse]
        UC2[Iniciar Sesión]
        UC3[Gestionar Usuarios]
    end
    
    subgraph "Catalog Service"
        UC4[Buscar Libros]
        UC5[Ver Detalles Libro]
        UC6[Gestionar Catálogo]
        UC7[Gestionar Autores]
        UC8[Gestionar Géneros]
        UC9[Gestionar Editoriales]
    end
    
    subgraph "Sales Service"
        UC10[Registrar Venta]
        UC11[Consultar Ventas]
        UC12[Gestionar Inventario]
    end
    
    subgraph "Analytics Service"
        UC13[Ver Dashboard]
        UC14[Consultar Reportes]
        UC15[Ver Predicciones]
        UC16[Gestionar Alertas]
    end
    
    subgraph "Background Processing"
        UC17[Procesar Analytics]
        UC18[Generar Alertas Automáticas]
        UC19[Actualizar Predicciones]
    end
    
    USER --> UC1
    USER --> UC2
    USER --> UC4
    USER --> UC5
    USER --> UC10
    USER --> UC11
    USER --> UC13
    USER --> UC14
    USER --> UC15
    
    ADMIN --> UC3
    ADMIN --> UC6
    ADMIN --> UC7
    ADMIN --> UC8
    ADMIN --> UC9
    ADMIN --> UC12
    ADMIN --> UC16
    
    SYSTEM --> UC17
    SYSTEM --> UC18
    SYSTEM --> UC19
    
    style USER fill:#e1f5ff
    style ADMIN fill:#ffe1e1
    style SYSTEM fill:#f0e1ff
```

## 🔐 Casos de Uso de Autenticación {#autenticación}

### UC1: Registrarse

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as Auth Service
    participant DB as Database
    
    U->>F: Ingresar datos registro
    F->>F: Validar formato
    F->>A: POST /auth/register
    A->>A: Validar datos
    A->>A: Hash password
    A->>DB: Crear usuario
    DB-->>A: Usuario creado
    A-->>F: Usuario registrado
    F-->>U: Confirmación registro
```

**Precondiciones:**
- Email no registrado previamente
- Datos válidos (email, password, nombre)

**Postcondiciones:**
- Usuario creado en base de datos
- Password hasheada
- Rol USER asignado por defecto

### UC2: Iniciar Sesión

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as Auth Service
    participant DB as Database
    
    U->>F: Ingresar credenciales
    F->>A: POST /auth/login
    A->>DB: Buscar usuario por email
    DB-->>A: Usuario encontrado
    A->>A: Validar password
    A->>A: Generar JWT token
    A-->>F: Token JWT
    F->>F: Guardar token
    F-->>U: Acceso concedido
```

**Precondiciones:**
- Usuario registrado
- Credenciales válidas

**Postcondiciones:**
- Token JWT generado
- Sesión iniciada
- Token almacenado en cliente

### UC3: Gestionar Usuarios (Admin)

**Operaciones:**
- Listar usuarios
- Actualizar roles
- Eliminar usuarios
- Ver detalles de usuario

```mermaid
stateDiagram-v2
    [*] --> ListarUsuarios
    ListarUsuarios --> VerDetalle
    ListarUsuarios --> ActualizarRol
    ListarUsuarios --> EliminarUsuario
    
    VerDetalle --> ListarUsuarios
    ActualizarRol --> ListarUsuarios
    EliminarUsuario --> ListarUsuarios
    
    ListarUsuarios --> [*]
```

## 📚 Casos de Uso de Catálogo {#catálogo}

### UC4: Buscar Libros

```mermaid
flowchart TD
    A[Inicio Búsqueda] --> B{Tipo de Búsqueda}
    B -->|Por Título| C[Buscar por título]
    B -->|Por Autor| D[Buscar por autor]
    B -->|Por Género| E[Buscar por género]
    B -->|Por ISBN| F[Buscar por ISBN]
    
    C --> G[Aplicar Filtros]
    D --> G
    E --> G
    F --> G
    
    G --> H[Ordenar Resultados]
    H --> I[Mostrar Resultados]
    I --> J{Más Opciones}
    
    J -->|Ver Detalles| K[UC5: Ver Detalles]
    J -->|Nueva Búsqueda| A
    J -->|Finalizar| L[Fin]
```

**Filtros disponibles:**
- Rango de precio
- Disponibilidad
- Año de publicación
- Editorial

### UC5: Ver Detalles de Libro

**Información mostrada:**
- Datos básicos (título, ISBN, precio)
- Autor(es)
- Género
- Editorial
- Stock disponible
- Descripción
- Análisis de ventas (si es admin)

### UC6: Gestionar Catálogo (Admin)

```mermaid
stateDiagram-v2
    [*] --> MenuCatalogo
    
    MenuCatalogo --> CrearLibro
    MenuCatalogo --> EditarLibro
    MenuCatalogo --> EliminarLibro
    MenuCatalogo --> ConsultarLibro
    
    CrearLibro --> ValidarDatos
    ValidarDatos --> GuardarDB: Válido
    ValidarDatos --> CrearLibro: Inválido
    GuardarDB --> MenuCatalogo
    
    EditarLibro --> ActualizarDB
    ActualizarDB --> MenuCatalogo
    
    EliminarLibro --> ConfirmarEliminacion
    ConfirmarEliminacion --> EliminarDB: Confirmar
    ConfirmarEliminacion --> MenuCatalogo: Cancelar
    EliminarDB --> MenuCatalogo
    
    ConsultarLibro --> MenuCatalogo
    
    MenuCatalogo --> [*]
```

## 💰 Casos de Uso de Ventas {#ventas}

### UC10: Registrar Venta

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant C as Catalog Service
    participant K as Kafka
    participant W as Worker
    participant DB as Database
    
    A->>F: Crear venta
    F->>C: POST /sales
    C->>DB: Verificar stock
    DB-->>C: Stock disponible
    
    C->>DB: Iniciar transacción
    C->>DB: Crear Sale
    C->>DB: Crear SaleItems
    C->>DB: Actualizar Inventory
    C->>DB: Commit transacción
    
    C->>K: Publicar sale.created
    C-->>F: Venta creada
    F-->>A: Confirmación
    
    Note over K,W: Procesamiento Asíncrono
    K-->>W: Evento sale.created
    W->>DB: Actualizar BookAnalytics
    W->>DB: Crear StockMovement
    W->>DB: Generar predicciones
```

**Precondiciones:**
- Usuario autenticado con rol ADMIN
- Stock disponible >= cantidad solicitada
- Libro(s) activo(s)

**Postcondiciones:**
- Venta registrada
- Inventario actualizado
- Evento publicado a Kafka
- Analytics actualizado (asíncrono)

### UC11: Consultar Ventas

```mermaid
flowchart LR
    A[Consultar Ventas] --> B{Tipo de Consulta}
    B -->|Todas| C[GET /sales]
    B -->|Por ID| D[GET /sales/:id]
    B -->|Por Rango Fecha| E[GET /sales?dates]
    
    C --> F[Mostrar Lista]
    D --> G[Mostrar Detalle]
    E --> F
    
    F --> H{Acción}
    G --> H
    
    H -->|Ver Detalle| G
    H -->|Exportar| I[Descargar Reporte]
    H -->|Finalizar| J[Fin]
```

### UC12: Gestionar Inventario (Admin)

**Operaciones:**
- Consultar stock actual
- Ajustar inventario manualmente
- Ver movimientos de stock
- Consultar snapshots históricos

```mermaid
graph TD
    A[Gestión Inventario] --> B[Consultar Stock]
    A --> C[Ajustar Stock]
    A --> D[Ver Movimientos]
    A --> E[Ver Snapshots]
    
    C --> F{Tipo Ajuste}
    F -->|Entrada| G[Registrar Entrada]
    F -->|Salida| H[Registrar Salida]
    F -->|Ajuste| I[Ajuste Manual]
    
    G --> J[Crear StockMovement]
    H --> J
    I --> J
    
    J --> K[Actualizar Inventory]
```

## 📊 Casos de Uso de Analytics {#analytics}

### UC13: Ver Dashboard

```mermaid
flowchart TD
    A[Acceder Dashboard] --> B[Cargar Métricas]
    B --> C[Total Ventas]
    B --> D[Ingresos Totales]
    B --> E[Productos Vendidos]
    B --> F[Ticket Promedio]
    B --> G[Inventario Total]
    B --> H[Stock Bajo]
    B --> I[Productos Activos]
    B --> J[Rotación Promedio]
    
    C --> K[Renderizar Dashboard]
    D --> K
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L{Actualización}
    L -->|Auto| B
    L -->|Manual| M[Refrescar]
    M --> B
```

**Métricas mostradas:**
- Total de ventas
- Ingresos totales
- Unidades vendidas
- Ticket promedio
- Valor inventario
- Productos con stock bajo
- Productos activos
- Rotación promedio

### UC14: Consultar Reportes

```mermaid
graph TB
    subgraph "Reportes Disponibles"
        R1[Análisis ABC<br/>Pareto]
        R2[Rentabilidad<br/>por Categoría]
        R3[Estacionalidad<br/>de Ventas]
        R4[Rotación<br/>de Stock]
        R5[Análisis de<br/>Ventas]
        R6[Audit Trail<br/>Trazabilidad]
    end
    
    A[Seleccionar Reporte] --> B{Tipo}
    B --> R1
    B --> R2
    B --> R3
    B --> R4
    B --> R5
    B --> R6
    
    R1 --> C[Aplicar Filtros]
    R2 --> C
    R3 --> C
    R4 --> C
    R5 --> C
    R6 --> C
    
    C --> D[Generar Reporte]
    D --> E{Formato}
    E -->|Visualizar| F[Mostrar en Pantalla]
    E -->|Exportar| G[Descargar Archivo]
```

**Tipos de Reportes:**

1. **Análisis ABC (Pareto)**
   - Clasificación de productos A, B, C
   - Por contribución a ventas
   - Top 20 productos

2. **Rentabilidad por Categoría**
   - Ventas por género
   - Margen por categoría
   - Productos más rentables

3. **Estacionalidad**
   - Ventas por mes
   - Tendencias temporales
   - Patrones estacionales

4. **Rotación de Stock**
   - Días promedio de rotación
   - Productos de alta rotación
   - Productos de baja rotación

5. **Audit Trail**
   - Historial de cambios
   - Usuario que realizó cambio
   - Valores anteriores y nuevos

### UC15: Ver Predicciones

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as Analytics Service
    participant DB as Database
    
    U->>F: Solicitar predicciones
    F->>A: GET /predictive/demand
    A->>DB: Obtener predicciones recientes
    DB-->>A: Datos de predicción
    A->>A: Calcular confianza
    A-->>F: Predicciones + Recomendaciones
    F->>F: Renderizar visualización
    F-->>U: Mostrar predicciones
    
    Note over F,U: Muestra:<br/>- Demanda esperada<br/>- Nivel de confianza<br/>- Recomendación de stock
```

**Información de Predicciones:**
- Libro predicho
- Demanda esperada (unidades)
- Nivel de confianza (0-1)
- Recomendación de reabastecimiento
- Fecha de predicción

### UC16: Gestionar Alertas

```mermaid
stateDiagram-v2
    [*] --> VerAlertas
    
    VerAlertas --> FiltrarAlertas
    FiltrarAlertas --> VerAlertas
    
    VerAlertas --> VerDetalle
    VerDetalle --> MarcarResuelta
    VerDetalle --> MarcarPendiente
    
    MarcarResuelta --> VerAlertas
    MarcarPendiente --> VerAlertas
    
    VerAlertas --> [*]
```

**Tipos de Alertas:**
- 🔴 **LOW_STOCK**: Stock por debajo del mínimo
- 🔵 **HIGH_DEMAND**: Demanda superior al promedio
- 🟡 **LOW_ROTATION**: Producto con baja rotación
- 🟢 **RESTOCK_NEEDED**: Necesidad de reabastecimiento

## 🤖 Casos de Uso del Sistema (Automáticos) {#administrativos}

### UC17: Procesar Analytics (Worker)

```mermaid
flowchart TD
    A[Evento Kafka] --> B{Tipo Evento}
    
    B -->|sale.created| C[Procesar Venta]
    B -->|inventory.updated| D[Procesar Inventario]
    
    C --> E[Actualizar BookAnalytics]
    C --> F[Crear StockMovement]
    C --> G[Recalcular Predicciones]
    
    D --> H[Actualizar Métricas]
    D --> I[Verificar Alertas]
    
    E --> J[Guardar en DB]
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K{Éxito?}
    K -->|Sí| L[Commit]
    K -->|No| M[Rollback]
    
    L --> N[Fin]
    M --> O[Log Error]
    O --> N
```

### UC18: Generar Alertas Automáticas (Cron)

```mermaid
sequenceDiagram
    participant C as Cron Job
    participant A as Alert Service
    participant DB as Database
    
    Note over C: Cada hora
    C->>A: Ejecutar checkLowStock()
    A->>DB: Buscar libros con stock bajo
    DB-->>A: Lista de libros
    
    loop Para cada libro
        A->>A: Verificar alerta existente
        alt Alerta no existe
            A->>DB: Crear nueva alerta
        else Alerta existe
            A->>A: Skip (ya existe)
        end
    end
    
    A->>DB: Buscar libros con alta demanda
    DB-->>A: Lista de libros
    
    loop Para cada libro
        A->>A: Verificar alerta existente
        alt Alerta no existe
            A->>DB: Crear nueva alerta
        end
    end
    
    Note over C: Cada día
    C->>A: Ejecutar checkLowRotation()
    A->>DB: Buscar libros baja rotación
    DB-->>A: Lista de libros
    
    loop Para cada libro
        A->>DB: Crear alerta rotación
    end
```

**Frecuencias:**
- Stock bajo: Cada hora
- Alta demanda: Cada hora
- Baja rotación: Diaria (00:00)

### UC19: Actualizar Predicciones

```mermaid
flowchart TD
    A[Trigger: Nueva Venta] --> B[Obtener Histórico]
    B --> C[Preparar Dataset]
    C --> D{Suficientes Datos?}
    
    D -->|Sí| E[Ejecutar Modelo TensorFlow]
    D -->|No| F[Predicción Basada en Promedio]
    
    E --> G[Calcular Confianza]
    F --> G
    
    G --> H[Generar Recomendación]
    H --> I{Predicción > Stock?}
    
    I -->|Sí| J[Recomendar Reabastecimiento]
    I -->|No| K[Stock Suficiente]
    
    J --> L[Guardar Predicción]
    K --> L
    
    L --> M[Fin]
```

**Factores considerados:**
- Histórico de ventas (30 días)
- Tendencia actual
- Estacionalidad
- Stock actual
- Tasa de rotación

## 📝 Resumen de Actores y Permisos

| Actor | Casos de Uso Permitidos |
|-------|------------------------|
| **Usuario** | UC1, UC2, UC4, UC5, UC10, UC11, UC13, UC14, UC15 |
| **Administrador** | Todos los casos de uso de Usuario + UC3, UC6, UC7, UC8, UC9, UC12, UC16 |
| **Sistema** | UC17, UC18, UC19 (automáticos) |

## 🔄 Flujos Principales vs Alternativos

### Flujo Principal: Compra de Libro
1. Usuario se autentica (UC2)
2. Busca libro (UC4)
3. Ve detalles (UC5)
4. Admin registra venta (UC10)
5. Sistema procesa analytics (UC17)
6. Actualiza predicciones (UC19)
7. Genera alertas si necesario (UC18)

### Flujo Alternativo: Gestión Proactiva
1. Admin ve dashboard (UC13)
2. Revisa alertas (UC16)
3. Ve predicciones (UC15)
4. Ajusta inventario (UC12)
5. Sistema actualiza métricas (UC17)
