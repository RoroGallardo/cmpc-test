# Colecciones Bruno para CMPC Test API

Esta carpeta contiene las colecciones de [Bruno](https://www.usebruno.com/) para probar los servicios de la aplicación CMPC Test.

## Estructura

```
bruno/
├── bruno.json                    # Configuración de la colección
├── environments/
│   └── local.bru                 # Variables de entorno local
├── Auth Service/                 # Endpoints de autenticación
│   ├── Login.bru
│   ├── Login Admin.bru
│   ├── Register.bru
│   ├── Get Profile.bru
│   └── Seed Admin.bru
└── Catalog Service/              # Endpoints del catálogo
    ├── Books/
    │   ├── Search Books - Simple.bru
    │   ├── Search Books - Advanced.bru
    │   ├── Get All Books.bru
    │   ├── Create Book.bru
    │   ├── Update Book.bru
    │   └── Delete Book.bru
    ├── Authors/
    │   ├── Get All Authors.bru
    │   └── Create Author.bru
    ├── Genres/
    │   ├── Get All Genres.bru
    │   └── Create Genre.bru
    ├── Publishers/
    │   ├── Get All Publishers.bru
    │   └── Create Publisher.bru
    └── Database/
        └── Seed Catalog.bru
```

## Uso

### 1. Instalar Bruno

Descarga e instala Bruno desde [https://www.usebruno.com/](https://www.usebruno.com/)

### 2. Abrir la Colección

1. Abre Bruno
2. Click en "Open Collection"
3. Selecciona la carpeta `docs/bruno`

### 3. Configurar el Entorno

La colección incluye un entorno `local` con las siguientes variables:

- `auth_service_url`: http://localhost:3001
- `catalog_service_url`: http://localhost:3002
- `access_token`: Se completa automáticamente al hacer login
- `admin_email`: admin@cmpc.com
- `admin_password`: Admin123!

### 4. Flujo de Prueba Recomendado

#### Primer Uso (Base de datos vacía)

1. **Seed Admin** - Crear el usuario administrador inicial
2. **Login Admin** - Autenticarse como admin (guarda el token automáticamente)
3. **Seed Catalog** - Poblar el catálogo con datos de prueba
4. **Register** - Crear un usuario regular (requiere token de admin)
5. **Login** - Autenticarse como usuario regular

#### Uso Normal

1. **Login** o **Login Admin** - El token se guarda automáticamente en `access_token`
2. Ejecutar cualquier otro endpoint - La autenticación se maneja automáticamente

### 5. Tests Automáticos

Cada request incluye tests automáticos que verifican:

- Códigos de estado HTTP correctos
- Estructura de las respuestas
- Validaciones de negocio (ej: libros disponibles, rol de admin, etc.)

Los resultados de los tests se muestran en la pestaña "Tests" después de ejecutar cada request.

## Ejemplos de Uso

### Buscar Libros

**Simple**: Busca por texto "soledad" con paginación básica

**Advanced**: Busca por texto "amor", solo disponibles, ordenados por precio ascendente

### CRUD Completo

Cada recurso (Books, Authors, Genres, Publishers) incluye operaciones:
- GET - Listar todos
- POST - Crear nuevo
- PATCH - Actualizar (solo Books por ahora)
- DELETE - Eliminar (solo Books por ahora)

### Gestión de Base de Datos

- **Seed Admin**: Crea el usuario admin desde variables de entorno
- **Seed Catalog**: Puebla el catálogo con 8 géneros, 8 autores, 5 editoriales y 15 libros

## Notas

- Todos los endpoints (excepto Login y Login Admin) requieren autenticación Bearer
- El token se guarda automáticamente en la variable `access_token` después de login exitoso
- Las operaciones de creación, actualización y eliminación requieren permisos de admin
- Los IDs en las URLs deben reemplazarse con UUIDs válidos obtenidos de las respuestas
