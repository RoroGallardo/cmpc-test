# Ejemplo de Configuración de Niveles de Log

## Cambiar nivel de log en runtime

Puedes cambiar el nivel de log simplemente modificando la variable de entorno `LOG_LEVEL` en el archivo `.env`:

### Ejemplo 1: Desarrollo con logs detallados

```bash
# .env
LOG_LEVEL=debug
NODE_ENV=development
```

**Salida en consola (colorida):**
```
2026-02-02 15:50:32 info [NestFactory] Starting Nest application...
2026-02-02 15:50:32 info [InstanceLoader] TypeOrmModule dependencies initialized
2026-02-02 15:50:32 info [InstanceLoader] PassportModule dependencies initialized
2026-02-02 15:50:32 info [Bootstrap] 🚀 Auth Service running on: http://localhost:3001
2026-02-02 15:50:32 info [Bootstrap] 📚 Swagger docs: http://localhost:3001/api/docs
2026-02-02 15:50:32 info [AdminSeeder] Usuario admin ya existe, saltando seed
```

### Ejemplo 2: Producción solo errores y advertencias

```bash
# .env
LOG_LEVEL=warn
NODE_ENV=production
```

**Salida en archivo JSON (`logs/combined.log`):**
```json
{
  "context": "AdminSeeder",
  "level": "warn",
  "message": "ADMIN_EMAIL o ADMIN_PASSWORD no están configurados. Saltando creación de admin inicial.",
  "service": "auth-service",
  "timestamp": "2026-02-02 15:50:32"
}
{
  "context": "AuthService",
  "level": "error",
  "message": "Error al crear usuario admin inicial:",
  "service": "auth-service",
  "timestamp": "2026-02-02 15:50:33",
  "trace": "Error: Database connection failed\n    at ..."
}
```

### Ejemplo 3: Solo errores críticos

```bash
# .env
LOG_LEVEL=error
NODE_ENV=production
```

En este caso, solo verás mensajes de error en la consola y archivos de log.

## Prueba rápida de niveles

Puedes probar diferentes niveles sin reiniciar la aplicación modificando `.env` y reiniciando:

```bash
# Terminal 1
echo "LOG_LEVEL=debug" >> .env
npm run dev:auth

# Terminal 2 (modificar nivel)
sed -i 's/LOG_LEVEL=debug/LOG_LEVEL=warn/' .env

# Terminal 1 (reiniciar servicio)
Ctrl+C
npm run dev:auth
```

## Estructura de logs por nivel

| Nivel | Qué muestra |
|-------|-------------|
| **error** | Solo errores críticos |
| **warn** | Errores + advertencias |
| **info** | Errores + advertencias + información general (default) |
| **http** | Todo lo anterior + logs HTTP |
| **verbose** | Todo lo anterior + información detallada |
| **debug** | Todo lo anterior + debugging |
| **silly** | TODO |

## Logs en archivos

Los logs se escriben automáticamente en:
- `logs/combined.log` - Todos los logs según el nivel configurado
- `logs/error.log` - Solo errores (siempre, independiente del nivel)

## Formato por ambiente

### Development (NODE_ENV=development)
- Consola: Colorido y legible
- Archivo: JSON estructurado

### Production (NODE_ENV=production)
- Consola: JSON estructurado
- Archivo: JSON estructurado

## Recomendaciones

| Ambiente | LOG_LEVEL | Razón |
|----------|-----------|-------|
| **Local** | `debug` o `info` | Ver todo el flujo de la aplicación |
| **Staging** | `info` | Información suficiente para debugging |
| **Production** | `warn` | Reducir ruido, solo advertencias y errores |
| **Production Critical** | `error` | Solo errores críticos, máximo rendimiento |

## Rotación de logs (próximos pasos)

Para producción, considera usar `winston-daily-rotate-file`:

```bash
npm install winston-daily-rotate-file
```

Esto creará archivos de log por día y los comprimirá automáticamente:
- `combined-2026-02-02.log`
- `combined-2026-02-01.log.gz`
- `error-2026-02-02.log`
