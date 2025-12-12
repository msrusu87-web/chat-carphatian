/**
 * Jobs API Route
 * 
 * CRUD operations for job postings:
 * - GET /api/jobs - List all open jobs (public, cached)
 * - POST /api/jobs - Create new job (clients only)
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { jobs, profiles } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, ilike, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { cached, CacheTTL, CacheKeys, cacheDeletePattern } from '@/lib/cache'

/**
 * Job Creation Schema
 * Validates incoming job data
 */
const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  timeline: z.string().optional(),
  required_skills: z.array(z.string()).optional().default([]),
})

/**
 * Fetch jobs from database
 */
async function fetchJobsFromDB(status: string) {
  return db.query.jobs.findMany({
    where: eq(jobs.status, status as any),
    orderBy: [desc(jobs.created_at)],
    with: {
      client: true,
    },
  })
}

/**
 * GET /api/jobs
 * 
 * List all open jobs with client profiles.
 * Public endpoint - no auth required.
 * Cached for 5 minutes.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'open'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const query = searchParams.get('query')
    const budgetMin = searchParams.get('budgetMin')
    const budgetMax = searchParams.get('budgetMax')
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []

    // Use cached job list for the base query (no filters)
    // Cache key includes status for different views
    let jobList = await cached(
      CacheKeys.jobs(status),
      () => fetchJobsFromDB(status),
      CacheTTL.MEDIUM // 5 minutes cache
    )

    // Apply filters client-side from cached data
    // Budget filters
    if (budgetMin) {
      const min = parseFloat(budgetMin)
      jobList = jobList.filter(job => 
        job.budget_min && parseFloat(job.budget_min) >= min
      )
    }
    if (budgetMax) {
      const max = parseFloat(budgetMax)
      jobList = jobList.filter(job => 
        job.budget_max && parseFloat(job.budget_max) <= max
      )
    }

    // Text search filter
    if (query) {
      const lowerQuery = query.toLowerCase()
      jobList = jobList.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) ||
        job.description.toLowerCase().includes(lowerQuery) ||
        (job.required_skills || []).some((s: string) => s.toLowerCase().includes(lowerQuery))
      )
    }

    // Skills filter
    if (skills.length > 0) {
      jobList = jobList.filter(job => {
        if (!job.required_skills) return false
        return skills.some(skill => 
          job.required_skills!.some((js: string) => 
            js.toLowerCase().includes(skill.toLowerCase())
          )
        )
      })
    }

    // Apply pagination
    const total = jobList.length
    jobList = jobList.slice(offset, offset + limit)

    return NextResponse.json({
      jobs: jobList,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/jobs
 * 
 * Create a new job posting.
 * Requires authentication as a client.
 * Invalidates jobs cache on creation.
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check user is a client
    const user = session.user as any
    if (user.role !== 'client' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only clients can create jobs' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await req.json()
    const validatedData = createJobSchema.parse(body)

    // Create job
    const [newJob] = await db
      .insert(jobs)
      .values({
        client_id: parseInt(user.id),
        title: validatedData.title,
        description: validatedData.description,
        budget_min: validatedData.budget_min?.toString(),
        budget_max: validatedData.budget_max?.toString(),
        timeline: validatedData.timeline,
        required_skills: validatedData.required_skills,
        status: 'open',
      })
      .returning()

    // Invalidate jobs cache
    await cacheDeletePattern('jobs:*')

    return NextResponse.json(
      { message: 'Job created successfully', job: newJob },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
