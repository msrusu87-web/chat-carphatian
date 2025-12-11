/**
 * Applications API Route
 * 
 * CRUD operations for job applications:
 * - GET /api/applications - List applications (filtered by role)
 * - POST /api/applications - Create new application (freelancers only)
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { applications, jobs, profiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Application Creation Schema
 */
const createApplicationSchema = z.object({
  job_id: z.number(),
  cover_letter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  proposed_rate: z.number().min(1, 'Rate must be at least 1'),
  estimated_hours: z.number().optional(),
})

/**
 * GET /api/applications
 * 
 * List applications based on user role:
 * - Freelancer: Their own applications
 * - Client: Applications to their jobs
 * - Admin: All applications
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = session.user as any
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('job_id')
    const status = searchParams.get('status')

    let applicationList

    if (user.role === 'admin') {
      // Admin sees all
      applicationList = await db.query.applications.findMany({
        with: {
          job: true,
          freelancer: {
            with: {
              profile: true,
            },
          },
        },
        orderBy: desc(applications.created_at),
      })
    } else if (user.role === 'freelancer') {
      // Freelancer sees their own applications
      applicationList = await db.query.applications.findMany({
        where: eq(applications.freelancer_id, parseInt(user.id)),
        with: {
          job: true,
        },
        orderBy: desc(applications.created_at),
      })
    } else if (user.role === 'client') {
      // Client sees applications to their jobs
      const clientJobs = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(eq(jobs.client_id, parseInt(user.id)))

      const jobIds = clientJobs.map((j) => j.id)

      if (jobIds.length === 0) {
        return NextResponse.json({ applications: [] })
      }

      // Filter by specific job if provided
      if (jobId) {
        applicationList = await db.query.applications.findMany({
          where: eq(applications.job_id, parseInt(jobId)),
          with: {
            job: true,
            freelancer: {
              with: {
                profile: true,
              },
            },
          },
          orderBy: desc(applications.created_at),
        })
      } else {
        applicationList = await db.query.applications.findMany({
          with: {
            job: true,
            freelancer: {
              with: {
                profile: true,
              },
            },
          },
          orderBy: desc(applications.created_at),
        })
        // Filter to only their jobs
        applicationList = applicationList.filter((a) =>
          jobIds.includes(a.job_id)
        )
      }
    } else {
      return NextResponse.json({ applications: [] })
    }

    // Filter by status if provided
    if (status) {
      applicationList = applicationList.filter((a) => a.status === status)
    }

    return NextResponse.json({ applications: applicationList })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications
 * 
 * Create a new job application.
 * Requires authentication as a freelancer.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = session.user as any
    if (user.role !== 'freelancer') {
      return NextResponse.json(
        { error: 'Only freelancers can apply to jobs' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await req.json()
    const validatedData = createApplicationSchema.parse(body)

    // Check job exists and is open
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, validatedData.job_id),
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'Job is not accepting applications' },
        { status: 400 }
      )
    }

    // Check if already applied
    const existingApp = await db.query.applications.findFirst({
      where: and(
        eq(applications.job_id, validatedData.job_id),
        eq(applications.freelancer_id, parseInt(user.id))
      ),
    })

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Create application
    const [newApplication] = await db
      .insert(applications)
      .values({
        job_id: validatedData.job_id,
        freelancer_id: parseInt(user.id),
        cover_letter: validatedData.cover_letter,
        proposed_rate: validatedData.proposed_rate.toString(),
        estimated_hours: validatedData.estimated_hours,
        status: 'pending',
      })
      .returning()

    return NextResponse.json(
      { message: 'Application submitted successfully', application: newApplication },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
