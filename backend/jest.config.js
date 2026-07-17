/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/middleware/auth.ts',
    'src/middleware/rateLimiter.ts',
    'src/utils/validators.ts',
    'src/utils/encryption.ts',
    'src/websocket/socket-server.ts',
  ],
  coverageThreshold: {
    global: { statements: 80, lines: 80, functions: 80 },
    './src/middleware/auth.ts': { statements: 100, lines: 100, functions: 100 },
    './src/utils/validators.ts': { statements: 100, lines: 100, functions: 100 },
    './src/websocket/socket-server.ts': { statements: 80, lines: 80, functions: 80 },
  },
};
