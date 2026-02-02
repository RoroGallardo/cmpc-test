# Shared Library (@cmpc-test/shared)

Librería compartida que contiene código reutilizable para todos los microservicios y aplicaciones frontend.

## 📦 Contenido

### 🗃️ Entidades TypeORM
- `User` - Usuario del sistema
- `Book` - Libro del catálogo
- `Author` - Autor de libros
- `Genre` - Género literario
- `Publisher` - Editorial

### 📝 DTOs (Data Transfer Objects)
- **Auth**: `LoginDto`, `RegisterDto`
- **Books**: `CreateBookDto`, `UpdateBookDto`, `FilterBookDto`
- **Authors**: `CreateAuthorDto`, `UpdateAuthorDto`
- **Genres**: `CreateGenreDto`, `UpdateGenreDto`
- **Publishers**: `CreatePublisherDto`, `UpdatePublisherDto`

### 🔒 Autenticación
- `JwtStrategy` - Estrategia base de autenticación JWT
- `JwtAuthGuard` - Guard para proteger endpoints
- `RolesGuard` - Guard para validar roles de usuario
- `@Roles()` - Decorator para especificar roles requeridos
- `JwtPayload` - Interface del payload JWT

### 📐 Interfaces TypeScript
- Interfaces para todas las entidades
- Enums (ej: `UserRole`)
- Tipos compartidos

## 🚀 Instalación

Esta librería se instala automáticamente como parte del monorepo mediante npm workspaces.

## 💻 Uso

### En Microservicios NestJS

```typescript
// Importar entidades
import { User, Book, Author } from '@cmpc-test/shared';

// Importar DTOs
import { CreateBookDto, FilterBookDto } from '@cmpc-test/shared';

// Importar guards y strategies
import { JwtAuthGuard, JwtStrategy, Roles, RolesGuard } from '@cmpc-test/shared';
import { UserRole } from '@cmpc-test/shared';

// Usar en controladores
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  findAll() {
    // ...
  }
}

// Configurar strategy en módulo
@Module({
  providers: [JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

### Extender JwtStrategy con Lógica Personalizada

Si necesitas agregar validación adicional (como en auth-service):

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy as BaseJwtStrategy, JwtPayload } from '@cmpc-test/shared';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends BaseJwtStrategy {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super(configService);
  }

  async validate(payload: JwtPayload) {
    // Validación base
    await super.validate(payload);
    
    // Lógica adicional personalizada
    const user = await this.authService.validateUser(payload.sub);
    return user;
  }
}
```

### En Frontend (React, Angular, Vue, etc.)

```typescript
// Importar interfaces y tipos
import type { Book, Author, Genre } from '@cmpc-test/shared';
import { UserRole } from '@cmpc-test/shared';

// Usar en componentes
const book: Book = {
  id: '123',
  title: 'Mi libro',
  // ...
};
```

## 🔧 Desarrollo

```bash
# Compilar la librería
npm run build

# Modo watch para desarrollo
npm run watch
```

## 📁 Estructura

```
libs/shared/
├── src/
│   ├── auth/                    # Guards, strategies y decorators
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.guard.ts
│   │   └── roles.decorator.ts
│   ├── entities/                # Entidades TypeORM
│   │   ├── user.entity.ts
│   │   ├── book.entity.ts
│   │   ├── author.entity.ts
│   │   ├── genre.entity.ts
│   │   └── publisher.entity.ts
│   ├── interfaces/              # Interfaces TypeScript
│   │   ├── user.interface.ts
│   │   ├── book.interface.ts
│   │   └── ...
│   ├── dtos/                    # DTOs de validación
│   │   ├── auth/
│   │   ├── books/
│   │   ├── authors/
│   │   ├── genres/
│   │   └── publishers/
│   └── index.ts                 # Exports centralizados
├── package.json
└── tsconfig.json
```

## 🎯 Ventajas

- ✅ **Código DRY**: No repetir entidades, DTOs ni lógica de autenticación
- ✅ **Type Safety**: Tipos compartidos entre frontend y backend
- ✅ **Consistencia**: Validaciones y reglas de negocio centralizadas
- ✅ **Mantenibilidad**: Cambios en un solo lugar
- ✅ **Reutilización**: Usado por múltiples servicios y aplicaciones

## 🔐 Autenticación Compartida

Los guards y strategies de JWT están centralizados para garantizar:
- Mismo comportamiento de autenticación en todos los servicios
- Configuración consistente del JWT
- Fácil mantenimiento y actualización
- Posibilidad de extender con lógica específica del servicio

## 📝 Notas

- Esta librería se compila junto con el resto del monorepo
- Los cambios se reflejan automáticamente en los servicios que la usan
- Para producción, compilar antes de desplegar
