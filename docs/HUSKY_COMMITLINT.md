# Husky - Estandarización de Commits

Este proyecto utiliza [Husky](https://typicode.github.io/husky/) junto con [Commitlint](https://commitlint.js.org/) para estandarizar los mensajes de commit siguiendo la convención de [Conventional Commits](https://www.conventionalcommits.org/).

## ¿Qué hace Husky?

Husky permite ejecutar scripts automáticamente en diferentes momentos del flujo de trabajo de Git (git hooks). En este proyecto:

- **commit-msg**: Valida que los mensajes de commit sigan el formato convencional
- **pre-commit**: Ejecuta verificaciones antes de realizar un commit

## Formato de Commits

Los commits deben seguir el siguiente formato:

```
<tipo>(<alcance opcional>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos permitidos:

- **feat**: Nueva funcionalidad
- **fix**: Corrección de errores
- **docs**: Cambios en documentación
- **style**: Cambios de formato (sin afectar el código)
- **refactor**: Refactorización de código
- **perf**: Mejoras de rendimiento
- **test**: Añadir o modificar tests
- **build**: Cambios en el sistema de build
- **ci**: Cambios en CI/CD
- **chore**: Tareas de mantenimiento
- **revert**: Revertir cambios

### Ejemplos de commits válidos:

```bash
git commit -m "feat: agregar autenticación JWT"
git commit -m "fix: corregir error en validación de usuarios"
git commit -m "docs: actualizar README con instrucciones de instalación"
git commit -m "refactor(auth): mejorar estructura del módulo de autenticación"
git commit -m "test: agregar tests para el servicio de usuarios"
```

### Ejemplos de commits inválidos:

```bash
# ❌ Sin tipo
git commit -m "agregar nueva funcionalidad"

# ❌ Tipo en mayúscula
git commit -m "FEAT: nueva funcionalidad"

# ❌ Descripción con punto final
git commit -m "feat: nueva funcionalidad."

# ❌ Tipo no permitido
git commit -m "update: actualizar dependencias"
```

## Configuración

La configuración de commitlint se encuentra en:
- `commitlint.config.js`: Reglas de validación de commits

Los hooks de Husky están en:
- `.husky/commit-msg`: Valida el formato del commit
- `.husky/pre-commit`: Ejecuta verificaciones antes del commit

## Desactivar temporalmente (no recomendado)

Si necesitas hacer un commit sin pasar por las validaciones (solo en casos excepcionales):

```bash
git commit -m "mensaje" --no-verify
```

**Nota**: Esto no es recomendable ya que rompe la estandarización del proyecto.
