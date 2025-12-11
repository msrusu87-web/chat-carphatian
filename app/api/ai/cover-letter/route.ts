/**
 * AI Cover Letter Generation API
 * 
 * POST /api/ai/cover-letter
 * 
 * Generates personalized cover letters for job applications.
 * Requires authentication (freelancer role).
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { aiServiceRequest } from '@/lib/ai-service'
import { z } from 'zod'

// Request validation schema
const coverLetterSchema = z.object({
  job_title: z.string().min(1),
  job_description: z.string().max(5000),
  freelancer_name: z.string().min(1),
  freelancer_skills: z.array(z.string()).min(1),
  freelancer_experience: z.string().max(2000).optional(),
  provider: z.enum(['openai', 'anthropic', 'groq']).optional(),
})

// Response type
interface CoverLetterResponse {
  cover_letter: string
  highlights: string[]
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
    
    // Only freelancers and admins can generate cover letters
    if (user.role !== 'freelancer' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only freelancers can generate cover letters' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = coverLetterSchema.parse(body)

    // Call AI service
    const result = await aiServiceRequest<CoverLetterResponse>(
      '/ai/cover-letter',
      { body: validatedData }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Cover letter generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}
