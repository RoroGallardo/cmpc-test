# Sistema de Configuración de Variables de Entorno para Frontend

## Descripción

El frontend ahora utiliza un sistema automatizado de generación de configuración basado en variables de entorno. Esto sigue las mejores prácticas de **12-factor app** y permite configurar la aplicación sin modificar el código.

## ¿Cómo funciona?

1. **Archivo `.env`**: Contiene todas las variables de entorno del proyecto
2. **Script generador**: `apps/frontend/scripts/generate-env-config.js` lee las variables de entorno y genera el archivo `environment.ts`
3. **Archivo `environment.ts`**: Generado automáticamente, **NO se sube a Git**
4. **Build/Serve automático**: Los targets `build` y `serve` ejecutan automáticamente el script generador antes de compilar

## Variables de Entorno Utilizadas

### Para desarrollo:
```bash
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost
AUTH_PORT=3001
CATALOG_SERVICE_URL=http://localhost
CATALOG_PORT=3002
ANALYTICS_SERVICE_URL=http://localhost
ANALYTICS_PORT=3003
```

### Para producción:
```bash
NODE_ENV=production
# En producción, las URLs se configuran como rutas relativas: /api/auth, /api/catalog, /api/analytics
```

## Uso

### Desarrollo

1. Asegúrate de tener un archivo `.env` en la raíz del proyecto (usa `.env.example` como referencia)

2. Ejecuta el servidor de desarrollo:
```bash
npx nx serve frontend
```

El script generador se ejecutará automáticamente y creará el archivo `environment.ts` con la configuración correcta.

### Generar manualmente la configuración

Si necesitas regenerar el archivo de configuración sin iniciar el servidor:

```bash
npx nx run frontend:generate-env
```

### Producción

Para builds de producción, asegúrate de establecer:

```bash
export NODE_ENV=production
npx nx build frontend --configuration=production
```

El archivo generado usará rutas relativas (`/api/auth`, `/api/catalog`, `/api/analytics`) asumiendo que existe un reverse proxy (nginx, etc.) que redirija estas rutas a los servicios correspondientes.

## Estructura de Archivos

```
apps/frontend/
├── scripts/
│   └── generate-env-config.js       # Script generador
├── src/
│   └── environments/
│       ├── environment.ts           # ⚠️ GENERADO AUTOMÁTICAMENTE (no editar)
│       └── environment.template.ts  # Template de referencia
└── project.json                      # Configuración con target generate-env
```

## Importante

- ❌ **NO editar** `environment.ts` manualmente - será sobrescrito
- ✅ El archivo `environment.ts` está en `.gitignore` y NO se sube al repositorio
- ✅ Usa `.env.example` como referencia para saber qué variables debes configurar
- ✅ Los cambios en `.env` requieren regenerar la configuración (automático en build/serve)

## Ventajas de este Enfoque

1. ✅ **Configuración centralizada**: Todas las URLs en un solo lugar (`.env`)
2. ✅ **Sin hardcodeo**: No hay valores quemados en el código
3. ✅ **Entornos flexibles**: Fácil cambio entre dev, staging, prod
4. ✅ **Seguridad**: Las configuraciones sensibles no se suben a Git
5. ✅ **12-factor app compliant**: Sigue las mejores prácticas de la industria
