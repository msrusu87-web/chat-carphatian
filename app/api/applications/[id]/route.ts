/**
 * Single Application API
 * PATCH: Update application status (accept/reject)
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { applications, jobs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const applicationId = parseInt(id)
    
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const user = session.user as any
    const userId = parseInt(user.id)

    // Get application with job
    const application = await db.query.applications.findFirst({
      where: eq(applications.id, applicationId),
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Get job to verify ownership
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, application.job_id),
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check permissions
    // Client can accept/reject, Freelancer can withdraw their own
    if (user.role === 'client' || user.role === 'admin') {
      if (job.client_id !== userId && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (user.role === 'freelancer') {
      if (application.freelancer_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (status !== 'withdrawn') {
        return NextResponse.json({ error: 'Freelancers can only withdraw applications' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update application
    const [updated] = await db
      .update(applications)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const applicationId = parseInt(id)
    
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 })
    }

    const application = await db.query.applications.findFirst({
      where: eq(applications.id, applicationId),
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
