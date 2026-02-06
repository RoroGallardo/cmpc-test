# Frontend Angular - Guía de Configuración

## ✅ Configuración Completada

La aplicación frontend Angular ha sido configurada exitosamente en `apps/frontend/` con las siguientes características:

### Estructura del Proyecto
```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── core/               # Servicios, guards, interceptors, models
│   │   ├── modules/            # Módulos de la aplicación
│   │   │   ├── auth/          # Login y autenticación
│   │   │   ├── books/         # Gestión de libros (CRUD, filtros, búsqueda)
│   │   │   ├── sales/         # Gestión de ventas
│   │   │   └── admin/         # Dashboard, reportes, analytics
│   │   └── shared/            # Componentes compartidos (Layout)
│   ├── environments/          # Configuración de entornos
│   └── styles.scss           # Estilos globales
├── project.json              # Configuración de Nx
└── tsconfig.json            # Configuración de TypeScript
```

### Módulos Implementados

#### 1. **Auth Module** (Autenticación)
- Login con validación reactiva
- Gestión de tokens JWT
- Navegación basada en roles

#### 2. **Books Module** (Gestión de Libros)
- Listado con paginación del lado del servidor
- Filtrado avanzado por género, editorial, autor y disponibilidad
- Ordenamiento dinámico por múltiples campos
- Búsqueda en tiempo real con debounce
- Formulario de alta/edición con validación reactiva
- Carga de imágenes por libro
- Vista de detalle del libro

#### 3. **Sales Module** (Gestión de Ventas)
- Listado de ventas
- Formulario para crear ventas con múltiples items
- Actualización de estado (completar/cancelar)
- Validación de inventario

#### 4. **Admin Module** (Panel de Administración)
- Dashboard con métricas visuales
- Gestión de usuarios
- Reportes y descarga de CSV
- Predictive Analytics

### Servicios Backend Configurados

Los servicios están configurados para conectarse a los siguientes microservicios:

```typescript
// apps/frontend/src/environments/environment.ts
export const environment = {
  production: false,
  authServiceUrl: 'http://localhost:3001/api',
  catalogServiceUrl: 'http://localhost:3002/api',
  analyticsServiceUrl: 'http://localhost:3003/api',
};
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev:frontend         # Inicia el servidor de desarrollo en http://localhost:4200

# Build
npm run build:frontend       # Construye la aplicación para producción

# Testing (pendiente de implementación)
npm test                     # Ejecuta los tests unitarios
```

## 🚀 Cómo Ejecutar

### 1. Instalar Dependencias (si no lo has hecho)
```bash
npm install
```

### 2. Iniciar los Microservicios Backend

Asegúrate de tener los 3 microservicios corriendo:

```bash
# Terminal 1 - Auth Service
npm run dev:auth

# Terminal 2 - Catalog Service
npm run dev:catalog

# Terminal 3 - Analytics Service (si existe)
# npm run dev:analytics
```

### 3. Iniciar el Frontend
```bash
npm run dev:frontend
```

La aplicación estará disponible en: **http://localhost:4200**

## ⚠️ Problema de File Watchers (Linux)

Si ves errores como:
```
ENOSPC: System limit for number of file watchers reached
```

**Solución:**
```bash
# Ver el límite actual
cat /proc/sys/fs/inotify/max_user_watches

# Aumentar el límite temporalmente
sudo sysctl fs.inotify.max_user_watches=524288

# Hacerlo permanente
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

A pesar de este error, la aplicación **sí compila correctamente** y está funcionando. El error solo afecta el hot-reload automático.

## 📝 Características Técnicas

### Autenticación
- Interceptor HTTP que agrega el token JWT a todas las peticiones
- Guard de autenticación para rutas protegidas
- Guard de administrador para rutas exclusivas de admin
- Redirección automática al login si no hay autenticación

### Formularios
- Reactive Forms con validación
- FormArray para items dinámicos (ventas)
- Manejo de errores y mensajes de validación

### Estado
- BehaviorSubject para el usuario actual
- Observable patterns para datos reactivos

### Rutas
- Lazy loading para todos los módulos
- Rutas protegidas con guards
- Navegación basada en roles

## 🔧 Archivos de Configuración

### package.json
Se agregaron los siguientes scripts:
- `dev:frontend`: Inicia el servidor de desarrollo
- `build:frontend`: Construye la aplicación

### project.json
Rutas actualizadas para apuntar a `apps/frontend/`:
- `sourceRoot`: "apps/frontend/src"
- Output en: `dist/apps/frontend`

### tsconfig.json
Extendido de la configuración raíz: `../../tsconfig.json`

## 📦 Dependencias Agregadas

```json
{
  "dependencies": {
    "@angular/common": "~21.1.0",
    "@angular/compiler": "~21.1.0",
    "@angular/core": "~21.1.0",
    "@angular/forms": "~21.1.0",
    "@angular/platform-browser": "~21.1.0",
    "@angular/platform-browser-dynamic": "~21.1.0",
    "@angular/router": "~21.1.0"
  },
  "devDependencies": {
    "@nx/angular": "^22.4.4",
    "@angular-devkit/build-angular": "~21.1.0",
    "@schematics/angular": "^21.1.2",
    "jest-preset-angular": "~16.0.0"
  }
}
```

## 🎯 Próximos Pasos

1. ✅ **Verificar conectividad**: Accede a http://localhost:4200 y verifica que la aplicación carga
2. ✅ **Login**: Usa las credenciales de tu sistema de autenticación
3. ⬜ **Tests**: Implementar tests unitarios (próxima iteración)
4. ⬜ **E2E Tests**: Configurar Playwright para tests end-to-end

## 📚 Documentación Adicional

- [Angular Documentation](https://angular.io/docs)
- [Nx Angular Plugin](https://nx.dev/nx-api/angular)
- [RxJS Documentation](https://rxjs.dev/)

## 🐛 Troubleshooting

### La aplicación no compila
1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Limpia el cache de Nx: `npx nx reset`
3. Reinicia el daemon: `npx nx daemon --stop`

### No puedo ver cambios en hot-reload
Esto es debido al límite de file watchers. Sigue las instrucciones en la sección "Problema de File Watchers" arriba. Mientras tanto, puedes refrescar manualmente el navegador.

### Errores 401 Unauthorized
Verifica que los servicios backend estén corriendo en los puertos correctos (3001, 3002, 3003).

### CORS errors
Asegúrate de que los microservicios tengan habilitado CORS para `http://localhost:4200`.
