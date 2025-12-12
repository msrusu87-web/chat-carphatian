/**
 * AI Job Matching API
 * 
 * Find matching jobs for freelancers or freelancers for jobs.
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
  findMatchingJobsForFreelancer, 
  findMatchingFreelancersForJob,
  explainJobMatch 
} from '@/lib/ai/job-matching'
import { isAIEnabled } from '@/lib/ai/openai'
import { withRateLimit } from '@/lib/security/rate-limit'

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(req, 'api')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (type === 'jobs' && user.role === 'freelancer') {
      // Find matching jobs for freelancer
      const result = await findMatchingJobsForFreelancer(
        parseInt(user.id),
        limit
      )
      return NextResponse.json(result)
    }

    if (type === 'freelancers' && user.role === 'client') {
      // Find matching freelancers for a job
      const jobId = searchParams.get('jobId')
      if (!jobId) {
        return NextResponse.json({ error: 'jobId required' }, { status: 400 })
      }
      
      const result = await findMatchingFreelancersForJob(
        parseInt(jobId),
        limit
      )
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid match type' }, { status: 400 })
  } catch (error: any) {
    console.error('AI match error:', error)
    return NextResponse.json({ 
      error: error.message || 'Matching failed'
    }, { status: 500 })
  }
}

/**
 * POST - Get explanation for a specific match
 */
export async function POST(req: NextRequest) {
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

    const { job, freelancerProfile } = await req.json()

    if (!job || !freelancerProfile) {
      return NextResponse.json({ error: 'job and freelancerProfile required' }, { status: 400 })
    }

    const explanation = await explainJobMatch(job, freelancerProfile)

    return NextResponse.json({ explanation })
  } catch (error: any) {
    console.error('AI match explanation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Explanation failed'
    }, { status: 500 })
  }
}
