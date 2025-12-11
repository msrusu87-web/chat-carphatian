/**
 * Contracts API Route
 * 
 * CRUD operations for contracts:
 * - GET /api/contracts - List contracts (filtered by role)
 * - POST /api/contracts - Create contract when accepting application
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { contracts, applications, jobs, milestones } from '@/lib/db/schema'
import { eq, desc, or } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Contract Creation Schema
 */
const createContractSchema = z.object({
  application_id: z.number(),
  total_amount: z.number().min(1, 'Amount must be at least 1'),
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      amount: z.number(),
      due_date: z.string().optional(),
    })
  ).optional(),
})

/**
 * GET /api/contracts
 * 
 * List contracts based on user role:
 * - Freelancer: Their contracts
 * - Client: Their contracts
 * - Admin: All contracts
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
    const status = searchParams.get('status')

    let contractList

    if (user.role === 'admin') {
      // Admin sees all
      contractList = await db.query.contracts.findMany({
        with: {
          job: true,
          client: {
            with: {
              profile: true,
            },
          },
          freelancer: {
            with: {
              profile: true,
            },
          },
          milestones: true,
        },
        orderBy: desc(contracts.created_at),
      })
    } else {
      // User sees their contracts (as client or freelancer)
      contractList = await db.query.contracts.findMany({
        where: or(
          eq(contracts.client_id, parseInt(user.id)),
          eq(contracts.freelancer_id, parseInt(user.id))
        ),
        with: {
          job: true,
          client: {
            with: {
              profile: true,
            },
          },
          freelancer: {
            with: {
              profile: true,
            },
          },
          milestones: true,
        },
        orderBy: desc(contracts.created_at),
      })
    }

    // Filter by status if provided
    if (status) {
      contractList = contractList.filter((c) => c.status === status)
    }

    return NextResponse.json({ contracts: contractList })
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/contracts
 * 
 * Create a contract by accepting an application.
 * Requires authentication as a client.
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
    if (user.role !== 'client' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only clients can create contracts' },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await req.json()
    const validatedData = createContractSchema.parse(body)

    // Get application
    const application = await db.query.applications.findFirst({
      where: eq(applications.id, validatedData.application_id),
      with: {
        job: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify client owns the job
    if (application.job.client_id !== parseInt(user.id) && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to accept this application' },
        { status: 403 }
      )
    }

    // Check application status
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application is not pending' },
        { status: 400 }
      )
    }

    // Calculate platform fee (15%)
    const platformFee = validatedData.total_amount * 0.15

    // Create contract
    const [newContract] = await db
      .insert(contracts)
      .values({
        job_id: application.job_id,
        client_id: application.job.client_id,
        freelancer_id: application.freelancer_id,
        total_amount: validatedData.total_amount.toString(),
        platform_fee: platformFee.toFixed(2),
        status: 'active',
        start_date: new Date(),
      })
      .returning()

    // Update application status
    await db
      .update(applications)
      .set({ status: 'accepted', updated_at: new Date() })
      .where(eq(applications.id, validatedData.application_id))

    // Update job status
    await db
      .update(jobs)
      .set({ status: 'in_progress', updated_at: new Date() })
      .where(eq(jobs.id, application.job_id))

    // Create milestones if provided
    if (validatedData.milestones && validatedData.milestones.length > 0) {
      for (const milestone of validatedData.milestones) {
        await db.insert(milestones).values({
          contract_id: newContract.id,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount.toString(),
          due_date: milestone.due_date ? new Date(milestone.due_date) : undefined,
          status: 'pending',
        })
      }
    }

    return NextResponse.json(
      { message: 'Contract created successfully', contract: newContract },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}
