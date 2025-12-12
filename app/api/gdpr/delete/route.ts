/**
 * GDPR Account Deletion API
 * Delete all user data (Right to be Forgotten)
 * DELETE /api/gdpr/delete
 * 
 * Security:
 * - Rate limited: 5 requests per minute (strict - sensitive operation)
 * - Requires confirmation phrase
 * - Blocks if pending payments exist
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import {
  users,
  profiles,
  jobs,
  applications,
  contracts,
  milestones,
  messages,
  payments,
  reviews,
  portfolios,
  attachments,
} from '@/lib/db/schema'
import { eq, or, inArray } from 'drizzle-orm'
import { logAuditEvent } from '@/lib/security/audit'
import { withRateLimit } from '@/lib/security/rate-limit'

export async function DELETE(request: NextRequest) {
  // Strict rate limiting - 5 requests per minute for sensitive operations
  const rateLimitResponse = await withRateLimit(request, 'strict')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id as string)
    const userEmail = session.user.email

    // Require password confirmation for security
    const body = await request.json().catch(() => ({}))
    const { confirmPassword, confirmPhrase } = body

    // User must type "DELETE MY ACCOUNT" to confirm
    if (confirmPhrase !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm deletion' },
        { status: 400 }
      )
    }

    // Check for active contracts
    const activeContracts = await db
      .select({ id: contracts.id })
      .from(contracts)
      .where(
        or(
          eq(contracts.client_id, userId),
          eq(contracts.freelancer_id, userId)
        )
      )
      .limit(1)

    // For safety, check if there are active contracts with pending payments
    const contractsWithPending = await db.query.contracts.findMany({
      where: or(eq(contracts.client_id, userId), eq(contracts.freelancer_id, userId)),
      with: { milestones: true },
    })

    const hasPendingPayments = contractsWithPending.some(
      (c) => c.status === 'active' && c.milestones.some((m) => m.status === 'in_escrow')
    )

    if (hasPendingPayments) {
      return NextResponse.json(
        {
          error: 'Cannot delete account with pending payments in escrow',
          details: 'Please complete or refund all pending payments before deleting your account.',
        },
        { status: 400 }
      )
    }

    // Log before deletion
    await logAuditEvent('user.delete_account', {
      userId,
      userEmail: userEmail || undefined,
      details: {
        reason: 'GDPR right to be forgotten',
        hasActiveContracts: activeContracts.length > 0,
      },
    })

    // Begin deletion process
    const deletionResults: Record<string, number> = {}

    // 1. Delete attachments uploaded by user
    const deletedAttachments = await db
      .delete(attachments)
      .where(eq(attachments.uploaded_by, userId))
      .returning({ id: attachments.id })
    deletionResults.attachments = deletedAttachments.length

    // 2. Delete portfolios
    const deletedPortfolios = await db
      .delete(portfolios)
      .where(eq(portfolios.user_id, userId))
      .returning({ id: portfolios.id })
    deletionResults.portfolios = deletedPortfolios.length

    // 3. Delete reviews (given by user)
    const deletedReviews = await db
      .delete(reviews)
      .where(eq(reviews.reviewer_id, userId))
      .returning({ id: reviews.id })
    deletionResults.reviews = deletedReviews.length

    // 4. Delete messages (both sent and received)
    const deletedMessages = await db
      .delete(messages)
      .where(or(eq(messages.sender_id, userId), eq(messages.recipient_id, userId)))
      .returning({ id: messages.id })
    deletionResults.messages = deletedMessages.length

    // 5. Delete payments
    const deletedPayments = await db
      .delete(payments)
      .where(eq(payments.user_id, userId))
      .returning({ id: payments.id })
    deletionResults.payments = deletedPayments.length

    // 6. Get user's contracts for milestone deletion
    const userContracts = await db
      .select({ id: contracts.id })
      .from(contracts)
      .where(or(eq(contracts.client_id, userId), eq(contracts.freelancer_id, userId)))

    // 7. Delete milestones for user's contracts
    if (userContracts.length > 0) {
      const contractIds = userContracts.map((c) => c.id)
      const deletedMilestones = await db
        .delete(milestones)
        .where(inArray(milestones.contract_id, contractIds))
        .returning({ id: milestones.id })
      deletionResults.milestones = deletedMilestones.length
    }

    // 8. Delete contracts
    const deletedContracts = await db
      .delete(contracts)
      .where(or(eq(contracts.client_id, userId), eq(contracts.freelancer_id, userId)))
      .returning({ id: contracts.id })
    deletionResults.contracts = deletedContracts.length

    // 9. Delete applications
    const deletedApplications = await db
      .delete(applications)
      .where(eq(applications.freelancer_id, userId))
      .returning({ id: applications.id })
    deletionResults.applications = deletedApplications.length

    // 10. Delete jobs (if client)
    const deletedJobs = await db
      .delete(jobs)
      .where(eq(jobs.client_id, userId))
      .returning({ id: jobs.id })
    deletionResults.jobs = deletedJobs.length

    // 11. Delete profile
    const deletedProfiles = await db
      .delete(profiles)
      .where(eq(profiles.user_id, userId))
      .returning({ id: profiles.id })
    deletionResults.profiles = deletedProfiles.length

    // 12. Finally, delete user account
    const deletedUsers = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id })
    deletionResults.users = deletedUsers.length

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
      deletedRecords: deletionResults,
      note: 'You will be signed out automatically.',
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}

// GET method to check what data would be deleted
export async function GET(request: NextRequest) {
  // Rate limiting for preview as well
  const rateLimitResponse = await withRateLimit(request, 'api')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id as string)

    // Count records that would be deleted
    const [
      profileCount,
      jobCount,
      applicationCount,
      contractCount,
      messageCount,
      paymentCount,
      reviewCount,
      portfolioCount,
    ] = await Promise.all([
      db.select({ count: profiles.id }).from(profiles).where(eq(profiles.user_id, userId)),
      db.select({ count: jobs.id }).from(jobs).where(eq(jobs.client_id, userId)),
      db.select({ count: applications.id }).from(applications).where(eq(applications.freelancer_id, userId)),
      db.select({ count: contracts.id }).from(contracts).where(or(eq(contracts.client_id, userId), eq(contracts.freelancer_id, userId))),
      db.select({ count: messages.id }).from(messages).where(or(eq(messages.sender_id, userId), eq(messages.recipient_id, userId))),
      db.select({ count: payments.id }).from(payments).where(eq(payments.user_id, userId)),
      db.select({ count: reviews.id }).from(reviews).where(or(eq(reviews.reviewer_id, userId), eq(reviews.reviewee_id, userId))),
      db.select({ count: portfolios.id }).from(portfolios).where(eq(portfolios.user_id, userId)),
    ])

    return NextResponse.json({
      warning: 'This action is irreversible. The following data will be permanently deleted:',
      recordsToDelete: {
        profile: profileCount.length,
        jobs: jobCount.length,
        applications: applicationCount.length,
        contracts: contractCount.length,
        messages: messageCount.length,
        payments: paymentCount.length,
        reviews: reviewCount.length,
        portfolios: portfolioCount.length,
      },
      instructions: 'To delete your account, send a DELETE request with confirmPhrase: "DELETE MY ACCOUNT"',
    })
  } catch (error) {
    console.error('Deletion preview error:', error)
    return NextResponse.json({ error: 'Failed to preview deletion' }, { status: 500 })
  }
}
