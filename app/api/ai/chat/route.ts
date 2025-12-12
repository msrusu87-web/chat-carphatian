/**
 * AI Chatbot API
 * 
 * Conversational AI assistant endpoint.
 * 
 * Security:
 * - Requires authentication
 * - Rate limited
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getChatbotResponse, getQuickAnswer, type ChatMessage } from '@/lib/ai/chatbot'
import { isAIEnabled } from '@/lib/ai/openai'
import { withRateLimit } from '@/lib/security/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(req, 'api')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAIEnabled()) {
      return NextResponse.json({ 
        error: 'AI features not available',
        fallback: 'Please contact support for assistance.'
      }, { status: 503 })
    }

    const user = session.user as any
    const { messages, quickQuestion } = await req.json()

    // Quick question mode (single question, no history)
    if (quickQuestion) {
      const answer = await getQuickAnswer(quickQuestion, user.role)
      
      if (!answer) {
        return NextResponse.json({ 
          error: 'Failed to generate response',
          fallback: 'Sorry, I couldn\'t process that question. Please try again.'
        }, { status: 500 })
      }

      return NextResponse.json(answer)
    }

    // Full chat mode
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }

    const response = await getChatbotResponse(
      messages as ChatMessage[],
      {
        role: user.role,
        name: user.name,
        currentPage: req.headers.get('x-current-page') || undefined,
      }
    )

    if (!response) {
      return NextResponse.json({ 
        error: 'Failed to generate response',
        fallback: 'Sorry, I\'m having trouble right now. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: response,
      role: 'assistant',
    })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json({ 
      error: error.message || 'Chat failed',
      fallback: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
}
