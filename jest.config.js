module.exports = {
  testEnvironment: 'node',
  
  // Archivo de setup que se ejecuta ANTES de los tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Archivos a analizar para cobertura
  collectCoverageFrom: [
    '*.js',
    'controllers/**/*.js',
    'services/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'langgraph/**/*.js',
    '!instrument.js',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!testSuperAdmin.js',
    '!node_modules/**'
  ],
  
  // Directorio de cobertura
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],
  
  // Patrón de archivos de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Ignorar node_modules excepto algunos paquetes que usan ESM
  transformIgnorePatterns: [
    'node_modules/(?!(@octokit|@langchain)/)'
  ],
  
  // Archivos a ignorar completamente
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    'testSuperAdmin.js'
  ],
  
  // Mock para módulos que causan problemas
  moduleNameMapper: {
    '^@octokit/(.*)$': '<rootDir>/node_modules/@octokit/$1'
  },

  testTimeout: 10000,

  forceExit: true,

  detectOpenHandles: false
}