# CMPC Test - Monorepo

[![Tests Microservicios](https://github.com/rorogallardo/cmpc-test/actions/workflows/test.yml/badge.svg)](https://github.com/TU_USUARIO/cmpc-test/actions/workflows/test-microservices.yml)

Monorepo con microservicios NestJS para gestión de biblioteca y autenticación.

## 🧪 Tests y Coverage

- **Total de Tests**: 83 ✅
- **Coverage**: 100% Statements | 92.92% Branches | 100% Functions | 100% Lines

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm run test:cov

# Tests por servicio
npm run test:auth
npm run test:catalog
npm run test:shared

# Modo watch
npm run test:watch
```

## Estructura del Proyecto

```
cmpc-test/
├── apps/
│   ├── auth-service/          # Microservicio de autenticación y usuarios
│   └── catalog-service/       # Microservicio de catálogo (libros, autores, etc.)
└── libs/
    └── shared/                # Código compartido (entidades, DTOs, interfaces)
```

## Arquitectura

### 🔐 Auth Service (Puerto 3001)
Gestiona la autenticación y administración de usuarios:
- Registro y login de usuarios
- Generación y validación de tokens JWT
- Gestión de roles (USER, ADMIN)
- API de usuarios

### 📚 Catalog Service (Puerto 3002)
Gestiona el catálogo de la biblioteca:
- CRUD de libros con filtros
- CRUD de autores
- CRUD de géneros
- CRUD de editoriales
- Relaciones entre entidades
- Validación de tokens JWT del auth-service

### 📦 Shared Library
Biblioteca compartida que contiene:
- Entidades de TypeORM (User, Book, Author, Genre, Publisher)
- DTOs de validación (CreateDto, UpdateDto, FilterDto)
- Interfaces de TypeScript
- Código reutilizable entre microservicios y frontend

## Instalación

```bash
# Instalar todas las dependencias del monorepo
npm install
```

## Configuración

### Variables de Entorno

El proyecto usa un archivo `.env` global en la raíz del monorepo:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### Generar Claves JWT

El sistema usa **criptografía asimétrica (RS256)** para JWT:
- Auth-service firma tokens con la **clave privada**
- Otros servicios validan con la **clave pública**

```bash
# Generar el par de claves
./scripts/generate-jwt-keys.sh

# Copiar las claves generadas al archivo .env
```

O manualmente con OpenSSL:
```bash
# Generar clave privada
openssl genrsa -out jwt.private.pem 4096

# Generar clave pública
openssl rsa -in jwt.private.pem -pubout -out jwt.public.pem

# Convertir a formato para .env (con \n)
awk '{printf "%s\\n", $0}' jwt.private.pem
awk '{printf "%s\\n", $0}' jwt.public.pem
```

**Variables importantes:**
- `JWT_PRIVATE_KEY`: Clave privada RSA (solo para auth-service)
- `JWT_PUBLIC_KEY`: Clave pública RSA (compartida, para validar)
- `AUTH_PORT` y `CATALOG_PORT`: Puertos de cada servicio
- `DB_*`: Configuración de la base de datos PostgreSQL compartida

## Base de Datos

Ambos microservicios comparten la misma base de datos PostgreSQL: `cmpc_db`

Crear la base de datos:
```sql
CREATE DATABASE cmpc_db;
```

Las tablas de ambos servicios coexisten en el mismo schema:
- **Auth Service**: `users`
- **Catalog Service**: `books`, `authors`, `genres`, `publishers`

## Ejecución

### Desarrollo

```bash
# Ejecutar auth-service
npm run dev:auth
# o
nx serve auth-service

# Ejecutar catalog-service
npm run dev:catalog
# o
nx serve catalog-service

# Ver el grafo de dependencias
npm run graph

# Compilar solo los proyectos afectados
npm run affected:build
```

### Producción

```bash
# Build de todos los proyectos
npm run build:all

# Build individual
npm run build:auth
npm run build:catalog

# Start
node dist/apps/auth-service/main.js
node dist/apps/catalog-service/main.js
```

## Documentación API

Cada microservicio tiene su propia documentación Swagger:

- Auth Service: http://localhost:3001/api/docs
- Catalog Service: http://localhost:3002/api/docs

## Flujo de Autenticación

1. El usuario se registra o inicia sesión en el **auth-service**
2. El auth-service devuelve un token JWT
3. El usuario usa este token para hacer peticiones al **catalog-service**
4. El catalog-service valida el token usando el mismo JWT_SECRET

## Uso de la Librería Compartida

### En los microservicios (NestJS)
```typescript
import { User, LoginDto, RegisterDto } from '@cmpc-test/shared';
```

### En el frontend
```typescript
import { 
  Book, 
  Author, 
  CreateBookDto, 
  FilterBookDto 
} from '@cmpc-test/shared';
```

## Tecnologías

- **Monorepo**: Nx
- **Framework**: NestJS
- **Base de datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: Passport + JWT (RS256)
- **Validación**: class-validator
- **Documentación**: Swagger
- **Logger**: Winston (configuración centralizada)
- **Package Manager**: npm workspaces

## Logging

El proyecto utiliza **Winston** como sistema de logging, reemplazando el logger por defecto de NestJS.

### Configuración del Nivel de Log

El nivel de log se controla mediante la variable de entorno `LOG_LEVEL`:

```bash
LOG_LEVEL=info    # Recomendado para desarrollo
LOG_LEVEL=warn    # Recomendado para producción
LOG_LEVEL=debug   # Para debugging detallado
```

### Niveles Disponibles

- `error` - Solo errores críticos
- `warn` - Errores y advertencias
- `info` - Información general (default)
- `http` - Logs HTTP
- `verbose` - Información detallada
- `debug` - Debugging
- `silly` - Máximo detalle

### Archivos de Log

Los logs se escriben en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

Para más información, consulta [docs/WINSTON_LOGGER.md](docs/WINSTON_LOGGER.md)

## Scripts Disponibles

```bash
# Desarrollo
npm run dev:auth           # Ejecutar auth-service en modo desarrollo
npm run dev:catalog        # Ejecutar catalog-service en modo desarrollo

# Build
npm run build:auth         # Compilar auth-service
npm run build:catalog      # Compilar catalog-service
npm run build:all          # Compilar todos los proyectos

# Nx
npm run graph              # Ver grafo de dependencias del monorepo
npm run affected:build     # Compilar solo proyectos afectados por cambios
npm run affected:test      # Ejecutar tests de proyectos afectado
npm test                   # Ejecutar tests
```

## Estructura de la Librería Shared

```
libs/shared/
├── src/
│   ├── entities/          # Entidades TypeORM
│   ├── interfaces/        # Interfaces TypeScript
│   ├── dtos/              # DTOs de validación
│   │   ├── auth/          # Login, Register
│   │   ├── books/         # Create, Update, Filter
│   │   ├── authors/       # Create, Update
│   │   ├── genres/        # Create, Update
│   │   └── publishers/    # Create, Update
│   └── index.ts           # Exports centralizados
```

## Próximos Pasos

1. Copiar `.env.example` a `.env` en la raíz del proyecto
2. Generar claves JWT RSA: `./scripts/generate-jwt-keys.sh`
3. Copiar las claves generadas al archivo `.env`
4. Configurar las demás variables de entorno (puertos, base de datos)
5. Crear la base de datos PostgreSQL: `CREATE DATABASE cmpc_db;`
6. Ejecutar `npm install` en la raíz del proyecto
7. Iniciar ambos microservicios
8. Probar los endpoints con Swagger o Postman
9. Integrar con tu aplicación frontend

## Notas Importantes

- **Criptografía Asimétrica**: Auth-service firma tokens con clave privada, otros servicios solo validan con clave pública
- **Seguridad**: Solo auth-service puede crear tokens, otros servicios solo pueden verificarlos
- **Base de datos compartida**: Ambos servicios usan la misma base de datos PostgreSQL
- Los microservicios son independientes y pueden escalarse por separado
- La librería `@cmpc-test/shared` puede ser usada tanto en backend como en frontend
- Todas las configuraciones de entorno están centralizadas en `.env` en la raíz
