/**
 * AI Content Generation API
 * 
 * Generate job descriptions, proposals, and other content.
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
import { 
  generateJobDescription, 
  generateProposal, 
  improveText,
  generateBioSuggestions 
} from '@/lib/ai/content-generation'
import { isAIEnabled } from '@/lib/ai/openai'
import { withRateLimit } from '@/lib/security/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limiting - AI endpoints are expensive
  const rateLimitResponse = await withRateLimit(req, 'api')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAIEnabled()) {
      return NextResponse.json({ 
        error: 'AI features not available'
      }, { status: 503 })
    }

    const { type, ...data } = await req.json()

    let result

    switch (type) {
      case 'jobDescription':
        result = await generateJobDescription({
          title: data.title,
          skills: data.skills || [],
          budget: data.budget,
          timeline: data.timeline,
          additionalInfo: data.additionalInfo,
        })
        break

      case 'proposal':
        result = await generateProposal({
          jobTitle: data.jobTitle,
          jobDescription: data.jobDescription,
          freelancerName: data.freelancerName || (session.user as any).name,
          freelancerSkills: data.freelancerSkills || [],
          freelancerBio: data.freelancerBio,
          proposedRate: data.proposedRate,
          timeline: data.timeline,
        })
        break

      case 'improveText':
        result = await improveText(data.text, data.textType || 'message')
        break

      case 'bioSuggestions':
        result = await generateBioSuggestions({
          skills: data.skills || [],
          experience: data.experience,
          specialization: data.specialization,
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ 
        error: 'Failed to generate content'
      }, { status: 500 })
    }

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Generation failed'
    }, { status: 500 })
  }
}
