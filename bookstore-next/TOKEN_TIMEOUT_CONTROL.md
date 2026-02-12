# Control de Timeout de Token JWT

Este documento explica el sistema implementado para evitar errores 401 persistentes cuando el token JWT expira.

## 🎯 Problema Resuelto

Anteriormente, cuando el token JWT expiraba, la aplicación mostraba múltiples errores 401 en diferentes componentes, causando una mala experiencia de usuario. El usuario veía:
- Múltiples mensajes de error
- Llamadas fallidas constantes
- No había redirección automática al login

## ✅ Solución Implementada

Se implementó un sistema centralizado de manejo de tokens con tres componentes principales:

### 1. Cliente API Centralizado (`api-client.ts`)

Un wrapper sobre `fetch` que:
- **Detecta errores 401 automáticamente** y ejecuta un callback único
- **Evita múltiples llamadas** con un flag `isHandling401`
- **Decodifica tokens JWT** para verificar expiración
- **Configura timers** para alertar antes de que expire el token

```typescript
// Uso básico
import { apiClient } from './api-client';

// Realizar una petición (igual que fetch)
const response = await apiClient.fetch(url, options);

// Verificar si un token está expirado
const isExpired = apiClient.isTokenExpired(token);

// Obtener tiempo restante en segundos
const timeRemaining = apiClient.getTokenTimeRemaining(token);
```

### 2. Auth Service Mejorado (`auth.service.ts`)

Ahora incluye métodos para:
- **Verificar expiración** del token actual
- **Obtener tiempo restante** hasta que expire
- **Decodificar el payload** del token

```typescript
// Verificar si el token está expirado (con 60s de buffer)
authService.isTokenExpired(); // true/false

// Obtener tiempo restante en segundos
authService.getTokenTimeRemaining(); // número

// Obtener información del token
authService.getTokenPayload(); // { exp, sub, email, role }
```

### 3. Auth Context con Control Automático (`AuthContext.tsx`)

El contexto de autenticación ahora:
- **Verifica la expiración** al cargar la aplicación
- **Configura un timer** que cierra sesión automáticamente 60 segundos antes de que expire
- **Maneja errores 401** de forma centralizada con redirección automática
- **Limpia el timer** al cerrar sesión

## 🔄 Flujo de Funcionamiento

### Al Iniciar Sesión
1. Usuario hace login
2. Se guarda el token en localStorage
3. Se configura un timer que:
   - Calcula cuándo expirará el token
   - 60 segundos antes de expirar, ejecuta logout automático
4. Se configura el callback para errores 401

### Al Cargar la Aplicación
1. Se verifica si existe un token guardado
2. Se decodifica y verifica su expiración
3. Si está expirado: se limpia la sesión
4. Si está válido: se configura el timer de expiración

### Durante el Uso
1. Todas las peticiones usan `apiClient.fetch`
2. Si el servidor responde 401:
   - Se limpia localStorage
   - Se ejecuta el callback (solo una vez)
   - Se redirige al usuario a `/login`
3. Si el timer detecta que falta 1 minuto:
   - Se ejecuta logout automático
   - Se limpia la sesión
   - Se redirige a login

## 🛠️ Configuración

### Buffer de Expiración
Por defecto, el sistema cierra sesión **60 segundos** antes de que expire el token. Puedes ajustar este valor:

```typescript
// En AuthContext.tsx
apiClient.setupTokenExpirationTimer(token, () => {
  logout();
}, 60); // 60 segundos de buffer

// Para verificar expiración
authService.isTokenExpired(30); // 30 segundos de buffer
```

### Callback Personalizado para 401
El callback se configura automáticamente en `AuthContext`, pero puedes personalizarlo:

```typescript
apiClient.setOnUnauthorized(() => {
  // Tu lógica personalizada
  console.log('Token expirado');
  // Redireccionar, mostrar modal, etc.
});
```

## 📝 Migración de Servicios

Para migrar un servicio existente:

### Antes
```typescript
async getBooks(): Promise<Book[]> {
  const response = await fetch(`${this.baseUrl}/books`, {
    headers: this.getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Error');
  }
  
  return response.json();
}
```

### Después
```typescript
import { apiClient } from './api-client';

async getBooks(): Promise<Book[]> {
  const response = await apiClient.fetch(`${this.baseUrl}/books`, {
    headers: this.getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Error');
  }
  
  return response.json();
}
```

## ✨ Beneficios

1. **No más errores 401 múltiples**: Un solo punto de manejo
2. **Mejor UX**: Redirección automática y limpia al login
3. **Proactivo**: Cierra sesión antes de que expire (evita llamadas fallidas)
4. **Centralizado**: Un solo lugar para manejar autenticación
5. **Tipo seguro**: Totalmente tipado con TypeScript

## 🧪 Testing

Para probar el sistema:

1. **Simular expiración de token**:
   - Modifica el buffer a 1 segundo
   - Inicia sesión
   - Espera a que cierre sesión automáticamente

2. **Probar 401 del servidor**:
   - Modifica manualmente el token en localStorage
   - Realiza una petición
   - Verifica que redirige a login sin errores múltiples

3. **Verificar tiempo restante**:
   ```typescript
   console.log('Tiempo restante:', authService.getTokenTimeRemaining(), 'segundos');
   ```

## 📚 Servicios Migrados

Los siguientes servicios ya usan el nuevo sistema:
- ✅ `auth.service.ts`
- ✅ `analytics.service.ts`
- ✅ `book.service.ts`
- ✅ `user.service.ts`

Servicios pendientes de migración:
- ⏳ `sale.service.ts`

**Nota**: La migración de los servicios es sencilla. Solo debes:
1. Importar `apiClient` en el servicio
2. Reemplazar todas las llamadas `fetch(...)` por `apiClient.fetch(...)`
3. El resto del código permanece igual

## 🔍 Debugging

Para ver el funcionamiento en acción:

```typescript
// Ver cuándo expira el token
const payload = authService.getTokenPayload();
if (payload?.exp) {
  const expirationDate = new Date(payload.exp * 1000);
  console.log('Token expira:', expirationDate);
}

// Ver si está siendo manejado un 401
console.log('Manejando 401:', apiClient.isHandlingUnauthorized());
```

## 🚀 Próximos Pasos

1. Migrar servicios restantes a `apiClient`
2. Agregar notificación visual cuando el token esté por expirar
3. Implementar refresh token si el backend lo soporta
