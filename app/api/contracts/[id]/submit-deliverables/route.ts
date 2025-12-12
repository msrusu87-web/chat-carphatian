/**
 * Submit Deliverables API
 * 
 * Allows freelancers to submit uploaded deliverables for client review.
 * Triggers notifications and updates contract status.
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { contracts, attachments, users } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/send'
import { pusher } from '@/lib/realtime/pusher'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contractId = parseInt(params.id)
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 })
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get contract and verify freelancer
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1)

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (contract.freelancer_id !== currentUser.id) {
      return NextResponse.json(
        { error: 'Only the freelancer can submit deliverables' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { fileIds, notes } = body

    if (!fileIds || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one file must be uploaded before submission' },
        { status: 400 }
      )
    }

    // Update all attachments to submitted status
    await db
      .update(attachments)
      .set({
        submission_status: 'submitted',
        submitted_at: new Date(),
      })
      .where(
        and(
          eq(attachments.entity_type, 'contract'),
          eq(attachments.entity_id, contractId),
          inArray(attachments.id, fileIds)
        )
      )

    // Get client details for notification
    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.id, contract.client_id))
      .limit(1)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get job details for email context
    const job = await db.query.jobs.findFirst({
      where: (jobs, { eq }) => eq(jobs.id, contract.job_id)
    })

    // Send email notification to client
    try {
      await sendEmail({
        to: client.email!,
        subject: `Deliverables submitted for: ${job?.title || 'Your project'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>New Deliverables Submitted</h2>
            <p>Hi ${client.name},</p>
            <p><strong>${currentUser.name}</strong> has submitted deliverables for your project: <strong>${job?.title || 'Your contract'}</strong></p>
            
            ${notes ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;"><strong>Delivery Notes:</strong></p>
              <p style="margin: 10px 0 0 0; color: #6b7280;">${notes}</p>
            </div>` : ''}
            
            <p><strong>${fileIds.length}</strong> file(s) are ready for your review.</p>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/contracts/${contractId}" 
                 style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Review Deliverables
              </a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              You can approve, request changes, or provide feedback on each file.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    // Send real-time notification via Pusher
    try {
      await pusher?.trigger(
        `private-contract-${contractId}`,
        'deliverables-submitted',
        {
          contractId,
          freelancerName: currentUser.name,
          fileCount: fileIds.length,
          timestamp: new Date().toISOString(),
          notes,
        }
      )

      // Also notify client's personal channel
      await pusher?.trigger(
        `private-user-${client.id}`,
        'notification',
        {
          type: 'deliverables_submitted',
          contractId,
          message: `${currentUser.name} submitted deliverables for review`,
          url: `/client/contracts/${contractId}`,
        }
      )
    } catch (pusherError) {
      console.error('Failed to send Pusher notification:', pusherError)
      // Don't fail the request if Pusher fails
    }

    return NextResponse.json({
      success: true,
      message: 'Deliverables submitted successfully',
      submittedCount: fileIds.length,
    })

  } catch (error: any) {
    console.error('Submit deliverables error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit deliverables' },
      { status: 500 }
    )
  }
}
