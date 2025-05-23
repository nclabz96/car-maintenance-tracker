// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // Pattern for test files
  setupFilesAfterEnv: ['./tests/setup.ts'] // Optional: for global setup/teardown
};
