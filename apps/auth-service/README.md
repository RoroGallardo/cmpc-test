# Auth Service

Microservicio de autenticación y gestión de usuarios.

## Características

- Registro de usuarios
- Login con JWT
- Gestión de usuarios
- Roles y permisos
- Validación de datos con class-validator
- Documentación con Swagger

## Configuración

Las variables de entorno se configuran en el archivo `.env` de la raíz del monorepo.

Variables utilizadas por este servicio:
- `AUTH_PORT` - Puerto del servicio (default: 3001)
- `DB_HOST` - Host de PostgreSQL
- `DB_PORT` - Puerto de PostgreSQL
- `DB_USERNAME` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos
- `DB_DATABASE` - Nombre de la base de datos (compartida con catalog-service)
- `JWT_SECRET` - Secret para JWT (compartido con catalog-service)
- `JWT_EXPIRATION` - Tiempo de expiración del token
- `NODE_ENV` - Entorno (development/production)

## Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev:auth

# O desde este directorio
npm run start:dev
```

## API Endpoints

- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (requiere auth)
- `GET /users` - Listar usuarios (requiere auth)

## Documentación

La documentación Swagger está disponible en: `http://localhost:3001/api/docs`
