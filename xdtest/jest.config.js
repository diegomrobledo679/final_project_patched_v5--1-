
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/dist/$1',
    '^@utils/(.*)$': '<rootDir>/dist/utils/$1',
    '^@core/(.*)$': '<rootDir>/dist/core/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$' : ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!.*(env-paths|sql.js))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  forceExit: true,
  detectOpenHandles: true,
};
