# Winston Logger Configuration

## Niveles de Log Configurados

Este proyecto utiliza Winston como logger, reemplazando el logger por defecto de NestJS. Los niveles de log están clasificados de la siguiente manera (de mayor a menor prioridad):

### Niveles Disponibles

1. **error** (0) - Errores críticos que requieren atención inmediata
   - Fallos al crear usuarios admin
   - Errores en seed de catálogo
   - Excepciones no manejadas
   
2. **warn** (1) - Advertencias de situaciones anormales que no detienen la aplicación
   - Configuración faltante (ADMIN_EMAIL, ADMIN_PASSWORD)
   - Intentos de operaciones duplicadas
   
3. **info** (2) - Información general sobre el flujo de la aplicación
   - Inicio de servicios
   - Operaciones de seeding exitosas
   - URLs de servicios y documentación
   
4. **http** (3) - Logs de peticiones HTTP (si se configura)
   
5. **verbose** (4) - Información detallada para debugging
   
6. **debug** (5) - Información de desarrollo y debugging
   
7. **silly** (6) - Todo el detalle posible

## Configuración del Nivel de Log

El nivel de log se configura mediante la variable de entorno `LOG_LEVEL`:

```bash
# En desarrollo - muestra info, warn y error
LOG_LEVEL=info

# En producción - solo errores y advertencias
LOG_LEVEL=warn

# Para debugging detallado
LOG_LEVEL=debug

# Máximo detalle (no recomendado en producción)
LOG_LEVEL=silly
```

## Clasificación de Logs en el Código

### Auth Service

#### main.ts
- `logger.log()` - **info**: Inicio del servicio, URLs de endpoints

#### admin.seeder.ts
- `logger.log()` - **info**: Usuario admin ya existe, usuario creado exitosamente
- `logger.warn()` - **warn**: Credenciales de admin no configuradas
- `logger.error()` - **error**: Error al crear usuario admin inicial

### Catalog Service

#### main.ts
- `logger.log()` - **info**: Inicio del servicio, URLs de endpoints

#### catalog.seeder.ts
- `logger.log()` - **info**: Catálogo ya existe, inicio de seed, operaciones exitosas
- `logger.error()` - **error**: Error al crear datos del catálogo

## Archivos de Log

Winston está configurado para escribir logs en:

- `logs/combined.log` - Todos los logs según el nivel configurado
- `logs/error.log` - Solo errores (nivel error)

## Formato de Logs

### Desarrollo
Formato colorido y legible en consola:
```
2024-02-02 10:30:45 info [Bootstrap] 🚀 Auth Service running on: http://localhost:3001
```

### Producción
Formato JSON estructurado para procesamiento automatizado:
```json
{
  "level": "info",
  "message": "🚀 Auth Service running on: http://localhost:3001",
  "service": "auth-service",
  "timestamp": "2024-02-02 10:30:45"
}
```

## Uso en Nuevos Módulos

Para usar el logger en nuevos servicios o controladores:

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Operación exitosa'); // info
    this.logger.warn('Advertencia'); // warn
    this.logger.error('Error', error.stack); // error
    this.logger.debug('Debug info'); // debug
  }
}
```

## Recomendaciones por Ambiente

### Development
```bash
LOG_LEVEL=debug
```
Muestra información detallada para desarrollo y debugging.

### Staging
```bash
LOG_LEVEL=info
```
Muestra el flujo general de la aplicación.

### Production
```bash
LOG_LEVEL=warn
```
Solo muestra advertencias y errores para reducir ruido y mejorar rendimiento.
