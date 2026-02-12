# Bookstore Next.js Application

Aplicación de gestión de librería construida con **Next.js 14**, **React**, **TypeScript** y **Tailwind CSS**.

## ⚠️ IMPORTANTE: Servicios Backend Requeridos

**La aplicación requiere que los servicios backend estén corriendo para funcionar correctamente.**

Si ves errores 404 o la página se ve vacía, consulta **[SERVICES_SETUP.md](./SERVICES_SETUP.md)** para instrucciones detalladas sobre cómo iniciar todos los servicios necesarios.

**Inicio rápido:**
```bash
# Terminal 1: Auth Service (puerto 3001)
npx nx serve auth-service

# Terminal 2: Catalog Service (puerto 3002)
npx nx serve catalog-service

# Terminal 3: Analytics Service (puerto 3003)
npx nx serve analytics-service

# Terminal 4: Frontend Next.js (puerto 4200)
npx nx serve bookstore-next
```

## 🚀 Características

- ✅ **Next.js 14** con App Router
- ✅ **React 18** con Hooks modernos (useState, useEffect, useMemo, useContext)
- ✅ **TypeScript** para type safety
- ✅ **Tailwind CSS** para estilos modernos y responsivos
- ✅ **Context API** para gestión de estado global
- ✅ **React Router** integrado con Next.js
- ✅ **Autenticación** con JWT
- ✅ **Guards de rutas** para protección de páginas
- ✅ **Diseño moderno** con gradientes y animaciones

## 📁 Estructura del Proyecto

```
bookstore-next/
├── src/
│   ├── app/                  # App Router de Next.js
│   │   ├── admin/           # Páginas de administración
│   │   ├── books/           # Catálogo de libros
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── login/           # Página de login
│   │   ├── register/        # Página de registro
│   │   ├── sales/           # Gestión de ventas
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página de inicio
│   ├── components/          # Componentes reutilizables
│   │   ├── AdminRoute.tsx   # Guard para rutas de admin
│   │   ├── Navbar.tsx       # Barra de navegación
│   │   └── ProtectedRoute.tsx # Guard para rutas protegidas
│   ├── contexts/            # Contextos de React
│   │   └── AuthContext.tsx  # Contexto de autenticación
│   ├── hooks/               # Custom hooks
│   │   ├── useBooks.ts      # Hook para gestión de libros
│   │   ├── useDashboard.ts  # Hook para dashboard
│   │   └── useForm.ts       # Hook para formularios
│   ├── services/            # Servicios de API
│   │   ├── analytics.service.ts
│   │   ├── auth.service.ts
│   │   ├── book.service.ts
│   │   ├── sale.service.ts
│   │   └── user.service.ts
│   ├── types/               # Definiciones de tipos TypeScript
│   │   ├── analytics.ts
│   │   ├── book.ts
│   │   ├── sale.ts
│   │   └── user.ts
│   └── config/              # Configuración
│       └── env.ts           # Variables de entorno
├── public/                  # Archivos estáticos
└── package.json
```

## 🛠️ Tecnologías Utilizadas

- **Next.js 14**: Framework de React con App Router
- **React 18**: Biblioteca de UI
- **TypeScript**: Superset tipado de JavaScript
- **Tailwind CSS**: Framework de CSS utility-first
- **Context API**: Para gestión de estado
- **Fetch API**: Para llamadas HTTP

## 📦 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```

3. **Editar `.env.local`** con las URLs de tus servicios backend:
   ```
   NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
   NEXT_PUBLIC_CATALOG_SERVICE_URL=http://localhost:3002
   NEXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost:3003
   ```

## 🚀 Ejecutar la Aplicación

### Desarrollo:
```bash
nx serve bookstore-next
```

La aplicación estará disponible en `http://localhost:4200`

### Producción:
```bash
nx build bookstore-next
nx serve bookstore-next --prod
```

## 🎨 Características del Diseño

- **Diseño moderno** con gradientes vibrantes
- **Animaciones suaves** en transiciones y hover
- **Responsive design** para todos los tamaños de pantalla
- **Paleta de colores personalizada** con Tailwind
- **Componentes con glassmorphism** y sombras modernas
- **Iconos emoji** para una interfaz amigable
- **Cards interactivas** con efectos de hover

## 🔐 Rutas de la Aplicación

### Públicas:
- `/` - Redirección a login
- `/login` - Página de inicio de sesión
- `/register` - Página de registro

### Protegidas (requieren autenticación):
- `/dashboard` - Dashboard principal
- `/books` - Catálogo de libros
- `/sales` - Gestión de ventas

### Admin (requieren rol de administrador):
- `/admin` - Panel de administración
- `/admin/users` - Gestión de usuarios
- `/admin/authors` - Gestión de autores
- `/admin/genres` - Gestión de géneros
- `/admin/publishers` - Gestión de editoriales
- `/admin/reports` - Reportes y análisis
- `/admin/predictions` - Predicciones de ventas

## 🧩 Hooks Personalizados

### `useAuth()`
Hook para acceder al contexto de autenticación:
```typescript
const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
```

### `useForm()`
Hook para gestión de formularios con validación:
```typescript
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { email: '', password: '' },
  validate: (values) => { ... },
  onSubmit: async (values) => { ... }
});
```

### `useBooks()`
Hook para cargar libros con filtros:
```typescript
const { books, pagination, loading, error } = useBooks(filters);
```

### `useDashboard()`
Hook para cargar métricas del dashboard:
```typescript
const { dashboard, loading, error } = useDashboard();
```

## 🎯 Componentes Principales

### `AuthProvider`
Proveedor del contexto de autenticación que envuelve toda la aplicación.

### `ProtectedRoute`
Componente guard que protege rutas que requieren autenticación.

### `AdminRoute`
Componente guard que protege rutas que requieren rol de administrador.

### `Navbar`
Barra de navegación con links dinámicos basados en el rol del usuario.

## 🔄 Servicios de API

Todos los servicios siguen el patrón singleton y utilizan Fetch API:

- **authService**: Autenticación y gestión de usuarios
- **bookService**: CRUD de libros, autores, géneros y editoriales
- **saleService**: Gestión de ventas
- **analyticsService**: Dashboard y reportes
- **userService**: Gestión de usuarios (admin)

## 🎨 Paleta de Colores

```javascript
// Tailwind config personalizado
primary: {
  50: '#f0f9ff',
  500: '#0ea5e9',
  600: '#0284c7',
}
secondary: {
  500: '#d946ef',
  600: '#c026d3',
}
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
nx serve bookstore-next

# Build
nx build bookstore-next

# Linting
nx lint bookstore-next

# Tests
nx test bookstore-next
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👨‍💻 Autor

Desarrollado con ❤️ usando Next.js y Tailwind CSS
