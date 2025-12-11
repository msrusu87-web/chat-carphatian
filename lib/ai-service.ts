/**
 * AI Service Client Configuration
 * 
 * Centralized configuration for connecting to the FastAPI AI microservice.
 * 
 * Built by Carphatian
 */

// AI Service URL - defaults to localhost for development
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

/**
 * Make a request to the AI service
 */
export async function aiServiceRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: object
    timeout?: number
  } = {}
): Promise<T> {
  const { method = 'POST', body, timeout = 30000 } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `AI service error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI service request timed out')
    }
    throw error
  }
}

/**
 * Check if AI service is healthy
 */
export async function checkAIServiceHealth(): Promise<{
  status: string
  providers: Record<string, boolean>
  cache_connected: boolean
}> {
  return aiServiceRequest('/health', { method: 'GET', timeout: 5000 })
}
