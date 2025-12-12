/**
 * GDPR Data Export API
 * Export all user data for GDPR compliance
 * GET /api/gdpr/export
 * Built by Carphatian
 */

import { NextResponse } from 'next/server'
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
} from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import { logAuditEvent } from '@/lib/security/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id as string)
    const userEmail = session.user.email

    // Collect all user data
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      exportedFor: userEmail,
      dataCategories: [],
    }

    // 1. User account data
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userData[0]) {
      const { password_hash, ...safeUserData } = userData[0]
      exportData.account = safeUserData
      ;(exportData.dataCategories as string[]).push('account')
    }

    // 2. Profile data
    const profileData = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))

    if (profileData.length > 0) {
      exportData.profile = profileData[0]
      ;(exportData.dataCategories as string[]).push('profile')
    }

    // 3. Jobs (if client)
    const jobData = await db
      .select()
      .from(jobs)
      .where(eq(jobs.client_id, userId))

    if (jobData.length > 0) {
      exportData.jobs = jobData
      ;(exportData.dataCategories as string[]).push('jobs')
    }

    // 4. Applications (if freelancer)
    const applicationData = await db
      .select()
      .from(applications)
      .where(eq(applications.freelancer_id, userId))

    if (applicationData.length > 0) {
      exportData.applications = applicationData
      ;(exportData.dataCategories as string[]).push('applications')
    }

    // 5. Contracts (as client or freelancer)
    const contractData = await db
      .select()
      .from(contracts)
      .where(or(eq(contracts.client_id, userId), eq(contracts.freelancer_id, userId)))

    if (contractData.length > 0) {
      exportData.contracts = contractData
      ;(exportData.dataCategories as string[]).push('contracts')
    }

    // 6. Milestones for user's contracts
    if (contractData.length > 0) {
      const contractIds = contractData.map((c) => c.id)
      const milestoneData = await db.query.milestones.findMany()
      const userMilestones = milestoneData.filter((m) => contractIds.includes(m.contract_id))
      if (userMilestones.length > 0) {
        exportData.milestones = userMilestones
        ;(exportData.dataCategories as string[]).push('milestones')
      }
    }

    // 7. Messages (sent or received)
    const messageData = await db
      .select()
      .from(messages)
      .where(or(eq(messages.sender_id, userId), eq(messages.recipient_id, userId)))

    if (messageData.length > 0) {
      exportData.messages = messageData
      ;(exportData.dataCategories as string[]).push('messages')
    }

    // 8. Payments
    const paymentData = await db
      .select()
      .from(payments)
      .where(eq(payments.user_id, userId))

    if (paymentData.length > 0) {
      exportData.payments = paymentData
      ;(exportData.dataCategories as string[]).push('payments')
    }

    // 9. Reviews (given or received)
    const reviewData = await db
      .select()
      .from(reviews)
      .where(or(eq(reviews.reviewer_id, userId), eq(reviews.reviewee_id, userId)))

    if (reviewData.length > 0) {
      exportData.reviews = reviewData
      ;(exportData.dataCategories as string[]).push('reviews')
    }

    // 10. Portfolio items
    const portfolioData = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.user_id, userId))

    if (portfolioData.length > 0) {
      exportData.portfolios = portfolioData
      ;(exportData.dataCategories as string[]).push('portfolios')
    }

    // Log the export for audit
    await logAuditEvent('user.data_export', {
      userId,
      userEmail: userEmail || undefined,
      details: {
        categories: exportData.dataCategories,
      },
    })

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="carphatian-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
