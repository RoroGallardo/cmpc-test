export const env = {
  authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
  catalogServiceUrl: process.env.NEXT_PUBLIC_CATALOG_SERVICE_URL || 'http://localhost:3002',
  analyticsServiceUrl: process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL || 'http://localhost:3003',
};
