# Frontend Angular

Este es el frontend de la aplicación construido con Angular y Nx.

## Estructura

- **Auth Module**: Login y autenticación
- **Books Module**: Gestión de libros (CRUD, filtros, paginación)
- **Sales Module**: Gestión de ventas
- **Admin Module**: Módulo de administración (usuarios, dashboard, reportes, análisis predictivo)
- **Shared Module**: Componentes y servicios compartidos
- **Core**: Guards, interceptors, models y servicios

## Características

### Autenticación
- Login con email/password
- JWT Token management
- Role-based access (admin/user)

### Gestión de Libros
- Listado con filtros avanzados por género, editorial, autor y disponibilidad
- Ordenamiento dinámico por múltiples campos
- Paginación del lado del servidor
- Búsqueda en tiempo real con debounce
- Formulario de alta/edición con validación reactiva
- Carga de imagen por libro
- Vista de detalle completa

### Módulo Admin
- **Dashboard**: Visualización de métricas clave (ventas, ingresos, usuarios, libros)
- **Usuarios**: Administración de usuarios (activar/desactivar, eliminar)
- **Reportes**: Generación de reportes de ventas e inventario (JSON/CSV)
- **Análisis Predictivo**: Predicciones de ventas y tendencias estacionales

### Módulo User
- Gestión completa de libros (CRUD)
- Gestión de ventas (crear, cancelar, completar)
- Vista de mis ventas

## Servicios

- **AuthService**: Gestión de autenticación
- **BookService**: Gestión de libros
- **UserService**: Gestión de usuarios
- **SaleService**: Gestión de ventas
- **AnalyticsService**: Reportes y análisis

## Ejecutar

```bash
npm run dev:frontend
```

La aplicación estará disponible en http://localhost:4200

## Credenciales de prueba

Asegúrate de tener los microservicios corriendo:
- Auth Service: http://localhost:3001
- Catalog Service: http://localhost:3002
- Analytics Service: http://localhost:3003

## Rutas

- `/login` - Página de login
- `/books` - Listado de libros
- `/books/new` - Crear nuevo libro
- `/books/:id` - Ver detalle de libro
- `/books/:id/edit` - Editar libro
- `/sales` - Listado de ventas
- `/sales/new` - Crear nueva venta
- `/admin/dashboard` - Dashboard (solo admin)
- `/admin/users` - Gestión de usuarios (solo admin)
- `/admin/reports` - Reportes (solo admin)
- `/admin/predictive` - Análisis predictivo (solo admin)
