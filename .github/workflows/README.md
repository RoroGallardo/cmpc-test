# GitHub Actions Workflows

## test-microservices.yml - Tests y Coverage

Este workflow se ejecuta automáticamente en:
- Push a las ramas `main` y `develop`
- Pull Requests hacia `main` y `develop`

### Qué hace:

1. ✅ **Ejecuta todos los tests unitarios**
2. 📊 **Genera reporte de cobertura**
3. 📁 **Sube el reporte HTML como artifact** (disponible por 30 días)
4. 💬 **Comenta en PRs con los resultados** de coverage

### Ver reportes:

- **En GitHub Actions**: Ve a la pestaña "Actions" → Selecciona un workflow run → "Artifacts" → Descarga "coverage-report"
- **Localmente**: `npm run test:cov` y abre `coverage/index.html`

### Archivos generados:

- `coverage/index.html` - Reporte HTML interactivo
- `coverage/lcov.info` - Para herramientas de integración
- `coverage/coverage-summary.json` - Resumen en JSON
- `coverage/coverage-final.json` - Datos completos de cobertura

## test-bff.yml - Test y Coverage