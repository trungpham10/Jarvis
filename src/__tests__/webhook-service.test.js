// Mock environment variables
process.env.N8N_WEBHOOK_URL = 'https://test-n8n-webhook.com/webhook'

// Mock fetch globally
global.fetch = jest.fn()

describe('N8N Webhook Service', () => {
  let mockFetch

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch = global.fetch
    mockFetch.mockClear()
    
    // Default successful response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Webhook Trigger Function', () => {
    it('should send POST request to n8n webhook URL', async () => {
      const triggerWebhook = async (message) => {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
      }

      await triggerWebhook('Test message')

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Test message' }),
        })
      )
    })

    it('should handle webhook success response', async () => {
      const triggerWebhook = async (message) => {
        const response = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
        return response.json()
      }

      const result = await triggerWebhook('Success test')

      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle webhook error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' })
      })

      const triggerWebhook = async (message) => {
        try {
          const response = await fetch(process.env.N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          return response.json()
        } catch (error) {
          return { error: error.message }
        }
      }

      const result = await triggerWebhook('Error test')

      expect(result).toEqual({ error: 'HTTP error! status: 500' })
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const triggerWebhook = async (message) => {
        try {
          await fetch(process.env.N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          })
        } catch (error) {
          return { error: error.message }
        }
      }

      const result = await triggerWebhook('Network error test')

      expect(result).toEqual({ error: 'Network error' })
    })

    it('should send correct JSON payload structure', async () => {
      const triggerWebhook = async (message) => {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
      }

      const testMessage = 'Hello, this is a test message with special chars: !@#$%^&*()'
      await triggerWebhook(testMessage)

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: testMessage }),
        })
      )
    })

    it('should handle empty message gracefully', async () => {
      const triggerWebhook = async (message) => {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
      }

      await triggerWebhook('')

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: '' }),
        })
      )
    })

    it('should handle very long messages', async () => {
      const triggerWebhook = async (message) => {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
      }

      const longMessage = 'A'.repeat(10000) // 10KB message
      await triggerWebhook(longMessage)

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: longMessage }),
        })
      )
    })

    it('should handle special characters in messages', async () => {
      const triggerWebhook = async (message) => {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
      }

      const specialMessage = 'Message with: émojis 🚀, unicode: 你好, and symbols: <>&"\''
      await triggerWebhook(specialMessage)

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: specialMessage }),
        })
      )
    })
  })

  describe('Environment Configuration', () => {
    it('should use correct environment variable', () => {
      expect(process.env.N8N_WEBHOOK_URL).toBe('https://test-n8n-webhook.com/webhook')
    })

    it('should handle missing environment variable', async () => {
      const originalUrl = process.env.N8N_WEBHOOK_URL
      delete process.env.N8N_WEBHOOK_URL

      const triggerWebhook = async (message) => {
        if (!process.env.N8N_WEBHOOK_URL) {
          throw new Error('N8N_WEBHOOK_URL is not configured')
        }
        
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
      }

      await expect(triggerWebhook('test')).rejects.toThrow('N8N_WEBHOOK_URL is not configured')

      // Restore the environment variable
      process.env.N8N_WEBHOOK_URL = originalUrl
    })
  })

  describe('Webhook Payload Validation', () => {
    it('should validate JSON payload structure', async () => {
      const triggerWebhook = async (message) => {
        const payload = { message }
        
        // Validate payload structure
        if (typeof payload.message !== 'string') {
          throw new Error('Message must be a string')
        }
        
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }

      await triggerWebhook('Valid message')

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Valid message' }),
        })
      )
    })

    it('should reject invalid payload types', async () => {
      const triggerWebhook = async (message) => {
        const payload = { message }
        
        // Validate payload structure
        if (typeof payload.message !== 'string') {
          throw new Error('Message must be a string')
        }
        
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }

      await expect(triggerWebhook(123)).rejects.toThrow('Message must be a string')
      await expect(triggerWebhook(null)).rejects.toThrow('Message must be a string')
      await expect(triggerWebhook(undefined)).rejects.toThrow('Message must be a string')
    })
  })
}) 