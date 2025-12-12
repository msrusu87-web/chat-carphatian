/**
 * OpenAI Client Configuration
 * 
 * Provides OpenAI client for AI features.
 * 
 * Built by Carphatian
 */

import OpenAI from 'openai'

// OpenAI client singleton
let openaiClient: OpenAI | null = null

/**
 * Get or create OpenAI client
 */
export function getOpenAI(): OpenAI | null {
  if (openaiClient) {
    return openaiClient
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('[AI] OpenAI API key not configured')
    return null
  }

  openaiClient = new OpenAI({
    apiKey,
  })

  return openaiClient
}

/**
 * Check if AI is available
 */
export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Model configurations
 */
export const AIModels = {
  // Fast, cost-effective
  GPT_35_TURBO: 'gpt-3.5-turbo',
  
  // Best quality
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4: 'gpt-4',
  
  // Embeddings
  EMBEDDING: 'text-embedding-3-small',
  EMBEDDING_LARGE: 'text-embedding-3-large',
}

/**
 * Generate text embeddings
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const openai = getOpenAI()
  if (!openai) return null

  try {
    const response = await openai.embeddings.create({
      model: AIModels.EMBEDDING,
      input: text.slice(0, 8000), // Limit input length
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('[AI] Embedding error:', error)
    return null
  }
}

/**
 * Generate chat completion
 */
export async function generateCompletion(
  prompt: string,
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
): Promise<string | null> {
  const openai = getOpenAI()
  if (!openai) return null

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      })
    }

    messages.push({
      role: 'user',
      content: prompt,
    })

    const response = await openai.chat.completions.create({
      model: options?.model || AIModels.GPT_35_TURBO,
      messages,
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
    })

    return response.choices[0]?.message?.content || null
  } catch (error) {
    console.error('[AI] Completion error:', error)
    return null
  }
}
