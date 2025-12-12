/**
 * Approve/Reject Deliverable API
 * Client reviews and approves/rejects submitted deliverables
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { contracts, attachments, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Pusher from 'pusher'
import { Resend } from 'resend'

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
})

const resend = new Resend(process.env.RESEND_API_KEY)

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = session.user as any
        const contractId = parseInt(id)

        if (isNaN(contractId)) {
            return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 })
        }

        const body = await request.json()
        const { attachmentId, action, feedback } = body

        if (!attachmentId || !action) {
            return NextResponse.json(
                { error: 'Attachment ID and action required' },
                { status: 400 }
            )
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Action must be approve or reject' },
                { status: 400 }
            )
        }

        // Verify contract exists and user is the client
        const contract = await db.query.contracts.findFirst({
            where: eq(contracts.id, contractId),
            with: {
                client: true,
                freelancer: true,
                job: true,
            },
        })

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        }

        const userId = parseInt(user.id)
        if (contract.client_id !== userId) {
            return NextResponse.json(
                { error: 'Only the client can approve deliverables' },
                { status: 403 }
            )
        }

        // Verify attachment belongs to this contract
        const attachment = await db.query.attachments.findFirst({
            where: and(
                eq(attachments.id, attachmentId),
                eq(attachments.entity_id, contractId),
                eq(attachments.entity_type, 'contract')
            ),
        })

        if (!attachment) {
            return NextResponse.json(
                { error: 'Attachment not found or does not belong to this contract' },
                { status: 404 }
            )
        }

        // Check if already reviewed
        if (attachment.approval_status && attachment.approval_status !== 'pending') {
            return NextResponse.json(
                { error: 'This deliverable has already been reviewed' },
                { status: 400 }
            )
        }

        // Update attachment approval status
        const newStatus = action === 'approve' ? 'approved' : 'rejected'
        await db
            .update(attachments)
            .set({
                approval_status: newStatus,
                feedback: feedback || null,
                reviewed_at: new Date(),
                reviewed_by: userId,
            })
            .where(eq(attachments.id, attachmentId))

        // Send email notification to freelancer
        const emailSubject = action === 'approve'
            ? `✅ Deliverable Approved: ${contract.job.title}`
            : `⚠️ Deliverable Needs Revision: ${contract.job.title}`

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
        .approved { background: #10b981; color: white; }
        .rejected { background: #ef4444; color: white; }
        .feedback-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Deliverable Review</h1>
        </div>
        <div class="content">
            <h2>Hello!</h2>
            <p>The client has reviewed your deliverable for <strong>${contract.job.title}</strong></p>
            
            <div class="status-badge ${action === 'approve' ? 'approved' : 'rejected'}">
                ${action === 'approve' ? '✅ APPROVED' : '⚠️ REVISION REQUESTED'}
            </div>

            <p><strong>File:</strong> ${attachment.filename}</p>

            ${feedback ? `
                <div class="feedback-box">
                    <strong>Client Feedback:</strong>
                    <p>${feedback}</p>
                </div>
            ` : ''}

            ${action === 'approve' ? `
                <p>Great work! The client has approved this deliverable. You're one step closer to completing the project!</p>
            ` : `
                <p>Please review the client's feedback and upload a revised version of the deliverable.</p>
            `}

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/freelancer/contracts/${contractId}" class="button">
                View Contract
            </a>
        </div>
        <div class="footer">
            <p>This is an automated message from Carphatian Platform</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit Platform</a></p>
        </div>
    </div>
</body>
</html>
        `

        try {
            await resend.emails.send({
                from: 'Carphatian Platform <noreply@carphatian.ro>',
                to: contract.freelancer.email,
                subject: emailSubject,
                html: emailHtml,
            })
        } catch (emailError) {
            console.error('Failed to send email:', emailError)
            // Continue even if email fails
        }

        // Send Pusher real-time notifications
        try {
            const eventData = {
                contractId: contractId,
                attachmentId: attachmentId,
                filename: attachment.filename,
                action: action,
                feedback: feedback,
                reviewedAt: new Date().toISOString(),
            }

            // Notify on contract channel (both parties can see)
            await pusher.trigger(`contract-${contractId}`, 'deliverable-reviewed', eventData)

            // Notify on freelancer's personal channel
            await pusher.trigger(
                `private-user-${contract.freelancer_id}`,
                'deliverable-reviewed',
                {
                    ...eventData,
                    message: action === 'approve'
                        ? `Your deliverable "${attachment.filename}" has been approved!`
                        : `Your deliverable "${attachment.filename}" needs revision`,
                }
            )
        } catch (pusherError) {
            console.error('Failed to send Pusher notification:', pusherError)
            // Continue even if Pusher fails
        }

        return NextResponse.json({
            success: true,
            message: `Deliverable ${action}d successfully`,
            attachment: {
                id: attachment.id,
                filename: attachment.filename,
                approval_status: newStatus,
                feedback: feedback,
                reviewed_at: new Date(),
            },
        })
    } catch (error) {
        console.error('Deliverable approval error:', error)
        return NextResponse.json(
            { error: 'Failed to process deliverable review' },
            { status: 500 }
        )
    }
}
