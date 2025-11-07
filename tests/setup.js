// Jest setup file
const { request } = require('supertest');
const app = require('../index.js');

// Global test setup
global.app = app;
global.request = request(app);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test-password';

// Mock console methods to reduce noise in test output
const originalConsole = { ...console };

beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// Set up test database connections or mocks if needed
beforeEach(() => {
  // Clear any test data before each test
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  // Close any open connections
  if (app && app.close) {
    app.close();
  }
});