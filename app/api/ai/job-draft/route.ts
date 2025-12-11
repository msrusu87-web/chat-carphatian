/**
 * AI Job Draft Generation API
 * 
 * POST /api/ai/job-draft
 * 
 * Generates professional job descriptions using AI.
 * Requires authentication (client role).
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { aiServiceRequest } from '@/lib/ai-service'
import { z } from 'zod'

// Request validation schema
const jobDraftSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.string().min(1),
  skills: z.array(z.string()).min(1),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  timeline: z.string().optional(),
  additional_context: z.string().max(1000).optional(),
  provider: z.enum(['openai', 'anthropic', 'groq']).optional(),
})

// Response type
interface JobDraftResponse {
  description: string
  requirements: string[]
  nice_to_have: string[]
  model: string
  provider: string
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

    const user = session.user as { role?: string }
    
    // Only clients and admins can generate job drafts
    if (user.role !== 'client' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only clients can generate job drafts' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = jobDraftSchema.parse(body)

    // Call AI service
    const result = await aiServiceRequest<JobDraftResponse>(
      '/ai/job-draft',
      { body: validatedData }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Job draft generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate job draft' },
      { status: 500 }
    )
  }
}
