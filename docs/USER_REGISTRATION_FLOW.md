# Guía de Migración: Campo isActive en Users

## 📋 Resumen

Se ha agregado el campo `isActive` a la entidad `User` para implementar un sistema de registro público con activación manual por parte de los administradores.

## 🔄 Cambios Realizados

### Backend (auth-service)

#### 1. Entidad User
**Archivo:** `libs/shared/src/entities/user.entity.ts`

Se agregó el campo `isActive`:
```typescript
@Column({ default: false })
isActive!: boolean;
```

#### 2. Interface IUser
**Archivo:** `libs/shared/src/interfaces/user.interface.ts`

Se actualizó la interfaz:
```typescript
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;  // ← Nuevo campo
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. Auth Service
**Archivo:** `apps/auth-service/src/auth/auth.service.ts`

- Se agregó validación en el login para verificar que el usuario esté activo
- Se creó el método `publicRegister()` que crea usuarios inactivos sin devolver token
- Se actualizó el método `register()` para admins, que sí devuelve token

#### 4. Auth Controller
**Archivo:** `apps/auth-service/src/auth/auth.controller.ts`

Se agregó el endpoint público de registro:
```typescript
@Post('public-register')
async publicRegister(@Body() registerDto: RegisterDto)
```

#### 5. Users Service
**Archivo:** `apps/auth-service/src/users/users.service.ts`

- Se actualizó `findAll()` para incluir el campo `isActive`
- Se agregó el método `toggleStatus()` para activar/desactivar usuarios

#### 6. Users Controller
**Archivo:** `apps/auth-service/src/users/users.controller.ts`

Se agregó el endpoint para cambiar el estado:
```typescript
@Patch(':id/toggle-status')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
async toggleStatus(@Param('id') id: string)
```

### Frontend (Angular)

#### 1. Modelo User
**Archivo:** `apps/frontend/src/app/core/models/user.model.ts`

Se actualizó de:
- `firstName` y `lastName` → `name`
- `id: number` → `id: string`
- Se mantiene `isActive: boolean`

#### 2. Auth Service
**Archivo:** `apps/frontend/src/app/core/services/auth.service.ts`

Se agregó el método:
```typescript
publicRegister(data: RegisterRequest): Observable<{ message: string; user: {...} }>
```

#### 3. User Service
**Archivo:** `apps/frontend/src/app/core/services/user.service.ts`

Se actualizaron los tipos de `id` de `number` a `string`

#### 4. Componente de Registro
**Archivos nuevos:**
- `apps/frontend/src/app/modules/auth/components/register.component.ts`
- `apps/frontend/src/app/modules/auth/components/register.component.html`
- `apps/frontend/src/app/modules/auth/components/register.component.scss`

#### 5. Auth Module
**Archivo:** `apps/frontend/src/app/modules/auth/auth.module.ts`

Se agregaron rutas:
- `/auth/login` - Iniciar sesión
- `/auth/register` - Registro público

#### 6. User List
**Archivo:** `apps/frontend/src/app/modules/admin/components/user-list.component.html`

Se actualizó para mostrar solo `name` en lugar de `firstName` y `lastName`

## 🗄️ Migración de Base de Datos

### Desarrollo

En desarrollo, TypeORM está configurado con `synchronize: true`, por lo que la columna se creará automáticamente al iniciar el servicio.

### Producción

Si usas migraciones manuales en producción, ejecuta el siguiente SQL:

```sql
-- Agregar columna isActive con valor por defecto false
ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT false NOT NULL;

-- Activar todos los usuarios existentes (opcional, según tu necesidad)
UPDATE users SET is_active = true;

-- Activar solo los usuarios admin existentes
-- UPDATE users SET is_active = true WHERE role = 'admin';
```

### Verificación

```sql
-- Verificar que la columna fue creada
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_active';

-- Ver usuarios y su estado
SELECT id, email, name, role, is_active, created_at 
FROM users;
```

## 🚀 Flujo de Uso

### 1. Registro Público

Los usuarios se registran en `/auth/register`:
1. El formulario envía los datos a `POST /auth/public-register`
2. Se crea un usuario con `isActive = false`
3. El usuario recibe un mensaje: "Usuario registrado exitosamente. Espere la activación por un administrador."
4. No se devuelve token de autenticación

### 2. Activación por Admin

Los administradores pueden activar usuarios desde el dashboard:
1. Van a la lista de usuarios en `/admin/users`
2. Ven los usuarios con su estado (Activo/Inactivo)
3. Hacen clic en "Activar" para cambiar el estado
4. Se llama a `PATCH /users/:id/toggle-status`

### 3. Login

Al intentar iniciar sesión:
1. El sistema valida email y contraseña
2. **Si el usuario no está activo**, se rechaza el login con el mensaje: "Usuario inactivo. Contacte al administrador."
3. Si está activo, se devuelve el token de autenticación

## 🔑 Endpoints API

### Públicos

- `POST /auth/public-register` - Registro público (crea usuario inactivo)
- `POST /auth/login` - Login (valida isActive)

### Protegidos (requieren autenticación)

- `GET /users` - Listar usuarios (incluye campo isActive)
- `PATCH /users/:id/toggle-status` - Cambiar estado (solo admin)

### Protegidos Admin

- `POST /auth/register` - Registro de admin (crea usuario activo con token)

## 📝 Notas Importantes

1. **Usuarios Admin**: El seeder de admin crea usuarios con `isActive = true` automáticamente
2. **Usuarios Existentes**: Si migras desde una BD existente, decide si activar usuarios existentes o no
3. **Frontend**: Las rutas están en:
   - Login: `/auth/login`
   - Registro: `/auth/register`
   - Dashboard usuarios: `/admin/users` (solo admin)

## ✅ Testing

### Backend
```bash
# Ejecutar tests del auth-service
npx nx test auth-service
```

### Frontend
```bash
# Ejecutar tests del frontend
npx nx test frontend
```

### Manual
1. Registrar un nuevo usuario en `/auth/register`
2. Verificar que aparece como "Inactivo" en la lista de usuarios
3. Intentar hacer login → debe fallar con "Usuario inactivo"
4. Como admin, activar el usuario
5. Intentar hacer login nuevamente → debe funcionar

## 🔄 Rollback

Si necesitas revertir los cambios:

```sql
-- Eliminar la columna isActive
ALTER TABLE users DROP COLUMN is_active;
```

Luego revertir los commits de código.
