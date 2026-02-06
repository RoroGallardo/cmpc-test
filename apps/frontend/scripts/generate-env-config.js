#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const isProduction = process.env.NODE_ENV === 'production';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost';
const authPort = process.env.AUTH_PORT || '3001';
const catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost';
const catalogPort = process.env.CATALOG_PORT || '3002';
const analyticsServiceUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost';
const analyticsPort = process.env.ANALYTICS_PORT || '3003';

// Construir URLs completas
const buildUrl = (url, port, apiPath) => {
  if (isProduction) {
    return apiPath;
  }
  return `${url}:${port}`;
};

// Generar contenido del archivo
const content = `// Este archivo es generado automáticamente por scripts/generate-env-config.js
// NO EDITAR MANUALMENTE - Los cambios serán sobrescritos

export const environment = {
  production: ${isProduction},
  authServiceUrl: '${buildUrl(authServiceUrl, authPort, '/api/auth')}',
  catalogServiceUrl: '${buildUrl(catalogServiceUrl, catalogPort, '/api/catalog')}',
  analyticsServiceUrl: '${buildUrl(analyticsServiceUrl, analyticsPort, '/api/analytics')}',
};
`;

// Escribir el archivo
const outputPath = path.join(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(outputPath, content, 'utf8');

console.log('✅ Archivo de configuración generado correctamente');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Auth Service: ${buildUrl(authServiceUrl, authPort, '/api/auth')}`);
console.log(`   Catalog Service: ${buildUrl(catalogServiceUrl, catalogPort, '/api/catalog')}`);
console.log(`   Analytics Service: ${buildUrl(analyticsServiceUrl, analyticsPort, '/api/analytics')}`);
