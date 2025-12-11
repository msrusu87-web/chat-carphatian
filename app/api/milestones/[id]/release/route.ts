/**
 * Milestone Payment Release API
 * POST /api/milestones/[id]/release - Release payment for completed milestone
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { milestones, contracts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const milestoneId = parseInt(id)
    if (isNaN(milestoneId)) {
      return NextResponse.json({ error: 'Invalid milestone ID' }, { status: 400 })
    }

    const { contractId } = await req.json()

    // Fetch milestone with contract details
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        contract: {
          with: {
            client: true,
            freelancer: true,
          }
        }
      }
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    // Verify user is the contract client
    if (milestone.contract.client.email !== session.user.email) {
      return NextResponse.json({ 
        error: 'Only the client can release milestone payments' 
      }, { status: 403 })
    }

    // Verify milestone is in escrow (can only release from escrow)
    if (milestone.status !== 'in_escrow') {
      return NextResponse.json({ 
        error: `Cannot release payment. Milestone status is "${milestone.status}". Must be "in_escrow".` 
      }, { status: 400 })
    }

    // Release the milestone payment
    const [updatedMilestone] = await db
      .update(milestones)
      .set({ 
        status: 'released',
        released_at: new Date(),
      })
      .where(eq(milestones.id, milestoneId))
      .returning()

    // Check if all milestones are now released
    const allMilestones = await db.query.milestones.findMany({
      where: eq(milestones.contract_id, milestone.contract.id)
    })

    const allReleased = allMilestones.every(m => m.status === 'released')

    // If all milestones are released, mark contract as completed
    let updatedContract = null
    if (allReleased && milestone.contract.status === 'active') {
      [updatedContract] = await db
        .update(contracts)
        .set({ 
          status: 'completed',
          end_date: new Date()
        })
        .where(eq(contracts.id, milestone.contract.id))
        .returning()
    }

    return NextResponse.json({
      message: 'Payment released successfully',
      milestone: updatedMilestone,
      contract: updatedContract,
      allMilestonesReleased: allReleased,
    })

  } catch (error: any) {
    console.error('Error releasing milestone payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to release payment' },
      { status: 500 }
    )
  }
}
