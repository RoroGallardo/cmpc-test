# Catalog Service

Microservicio de catálogo para la gestión de libros, autores, géneros y editoriales.

## Características

- CRUD de libros con filtros
- CRUD de autores
- CRUD de géneros
- CRUD de editoriales
- Autenticación con JWT (validación de tokens del auth-service)
- Relaciones entre entidades
- Soft delete
- Validación de datos
- Documentación con Swagger

## Configuración

Las variables de entorno se configuran en el archivo `.env` de la raíz del monorepo.

Variables utilizadas por este servicio:
- `CATALOG_PORT` - Puerto del servicio (default: 3002)
- `DB_HOST` - Host de PostgreSQL
- `DB_PORT` - Puerto de PostgreSQL
- `DB_USERNAME` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos
- `DB_DATABASE` - Nombre de la base de datos (compartida con auth-service)
- `JWT_SECRET` - Secret para JWT (debe ser el mismo que auth-service)
- `NODE_ENV` - Entorno (development/production)

## Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev:catalog

# O desde este directorio
npm run start:dev
```

## API Endpoints

### Books
- `GET /books` - Listar libros (con filtros opcionales)
- `GET /books/:id` - Obtener libro por ID
- `POST /books` - Crear libro
- `PATCH /books/:id` - Actualizar libro
- `DELETE /books/:id` - Eliminar libro (soft delete)

### Authors
- `GET /authors` - Listar autores
- `POST /authors` - Crear autor
- `PATCH /authors/:id` - Actualizar autor
- `DELETE /authors/:id` - Eliminar autor

### Genres
- `GET /genres` - Listar géneros
- `POST /genres` - Crear género
- `PATCH /genres/:id` - Actualizar género
- `DELETE /genres/:id` - Eliminar género

### Publishers
- `GET /publishers` - Listar editoriales
- `POST /publishers` - Crear editorial
- `PATCH /publishers/:id` - Actualizar editorial
- `DELETE /publishers/:id` - Eliminar editorial

## Autenticación

Todos los endpoints requieren autenticación mediante JWT. Usa el token obtenido del auth-service en el header:

```
Authorization: Bearer <token>
```

## Documentación

La documentación Swagger está disponible en: `http://localhost:3002/api/docs`
