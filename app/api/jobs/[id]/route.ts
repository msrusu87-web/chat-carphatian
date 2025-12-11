/**
 * Single Job API Route
 * 
 * Operations on individual jobs:
 * - GET /api/jobs/[id] - Get job details
 * - PUT /api/jobs/[id] - Update job (owner only)
 * - DELETE /api/jobs/[id] - Delete job (owner/admin only)
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { jobs, applications, profiles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Job Update Schema
 */
const updateJobSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(50).optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  timeline: z.string().optional(),
  required_skills: z.array(z.string()).optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).optional(),
})

/**
 * GET /api/jobs/[id]
 * 
 * Get job details with applications count.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const jobId = parseInt(id)

    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      )
    }

    // Fetch job
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        client: {
          with: {
            profile: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Count applications
    const appList = await db
      .select()
      .from(applications)
      .where(eq(applications.job_id, jobId))

    return NextResponse.json({
      ...job,
      applications_count: appList.length,
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/jobs/[id]
 * 
 * Update job details. Only the job owner can update.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const jobId = parseInt(id)
    const user = session.user as any

    // Check job exists and user owns it
    const existingJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (existingJob.client_id !== parseInt(user.id) && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this job' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await req.json()
    const validatedData = updateJobSchema.parse(body)

    // Update job
    const [updatedJob] = await db
      .update(jobs)
      .set({
        ...validatedData,
        budget_min: validatedData.budget_min?.toString(),
        budget_max: validatedData.budget_max?.toString(),
        updated_at: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning()

    return NextResponse.json({
      message: 'Job updated successfully',
      job: updatedJob,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/[id]
 * 
 * Delete a job. Only owner or admin can delete.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const jobId = parseInt(id)
    const user = session.user as any

    // Check job exists and user owns it
    const existingJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (existingJob.client_id !== parseInt(user.id) && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this job' },
        { status: 403 }
      )
    }

    // Delete job (cascades to applications)
    await db.delete(jobs).where(eq(jobs.id, jobId))

    return NextResponse.json({
      message: 'Job deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
