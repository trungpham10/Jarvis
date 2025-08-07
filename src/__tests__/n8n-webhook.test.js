import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../app/page'

// Mock the chromaService module
jest.mock('../services/chromaService', () => ({
  initializeChroma: jest.fn().mockResolvedValue(),
  addToMemory: jest.fn().mockResolvedValue(),
  queryMemory: jest.fn().mockResolvedValue([]),
  queryKnowledge: jest.fn().mockResolvedValue([]),
  getConversationHistory: jest.fn().mockResolvedValue([]),
  clearAllStores: jest.fn().mockResolvedValue(),
}))

// Mock the KnowledgeUploader component
jest.mock('../components/KnowledgeUploader', () => {
  return function MockKnowledgeUploader() {
    return <div data-testid="knowledge-uploader">Knowledge Uploader</div>
  }
})

describe('N8N Webhook Trigger', () => {
  let mockFetch

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup fetch mock
    mockFetch = global.fetch
    mockFetch.mockClear()
    
    // Default successful response for OpenAI API
    mockFetch.mockImplementation((url) => {
      if (url === 'https://api.openai.com/v1/chat/completions') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Test AI response' } }]
          })
        })
      }
      // Default response for other URLs (including n8n webhook)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Webhook Environment Configuration', () => {
    it('should use the correct environment variable for webhook URL', () => {
      expect(process.env.N8N_WEBHOOK_URL).toBe('https://test-n8n-webhook.com/webhook')
    })
  })

}) 