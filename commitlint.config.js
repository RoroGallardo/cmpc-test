module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de errores
        'docs',     // Cambios en documentación
        'style',    // Cambios de formato (sin afectar el código)
        'refactor', // Refactorización de código
        'perf',     // Mejoras de rendimiento
        'test',     // Añadir o modificar tests
        'build',    // Cambios en el sistema de build
        'ci',       // Cambios en CI/CD
        'chore',    // Tareas de mantenimiento
        'revert'    // Revertir cambios
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0], // Permite cualquier caso en el subject
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
