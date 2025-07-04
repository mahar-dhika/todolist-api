// Jest test setup
// This file runs before all tests

// Global test timeout
jest.setTimeout(10000);

// Mock console.log during tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
