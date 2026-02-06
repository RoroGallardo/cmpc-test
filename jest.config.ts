export default {
  projects: [
    '<rootDir>/apps/auth-service/jest.config.ts',
    '<rootDir>/apps/catalog-service/jest.config.ts',
    '<rootDir>/apps/analytics-service/jest.config.ts',
    '<rootDir>/apps/analytics-worker/jest.config.ts',
    '<rootDir>/apps/frontend/jest.config.cts',
    '<rootDir>/libs/shared/jest.config.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: false,
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
};
