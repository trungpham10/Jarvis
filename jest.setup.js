import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn()

// Mock environment variables
process.env.N8N_WEBHOOK_URL = 'https://test-n8n-webhook.com/webhook'
process.env.NEXT_PUBLIC_OPENAI_API_KEY = 'test-openai-key'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
} 