/**
 * AI Embedding Generation API
 * 
 * POST /api/ai/embed
 * 
 * Creates vector embeddings for text, used for semantic search.
 * Requires authentication.
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { aiServiceRequest } from '@/lib/ai-service'
import { z } from 'zod'

// Request validation schema
const embedSchema = z.object({
  text: z.string().min(1).max(10000),
  model: z.string().optional(),
})

// Response type
interface EmbedResponse {
  embedding: number[]
  dimensions: number
  model: string
  cached: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = embedSchema.parse(body)

    // Call AI service
    const result = await aiServiceRequest<EmbedResponse>(
      '/ai/embed',
      { body: validatedData }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Embedding generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate embedding' },
      { status: 500 }
    )
  }
}
