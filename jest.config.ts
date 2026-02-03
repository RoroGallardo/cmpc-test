export default {
  projects: [
    '<rootDir>/apps/auth-service/jest.config.ts',
    '<rootDir>/apps/catalog-service/jest.config.ts',
    '<rootDir>/libs/shared/jest.config.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: false,
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
};
