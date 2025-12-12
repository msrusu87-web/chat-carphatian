/**
 * Email Notification Helper Functions
 * Convenience functions for sending notifications at various platform events
 * Built by Carphatian
 */

import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import {
  applicationReceivedEmail,
  applicationStatusEmail,
  newMessageEmail,
  paymentReleasedEmail,
  milestoneSubmittedEmail,
  reviewRequestEmail,
  welcomeEmail,
} from '@/lib/email/templates'

// Helper to get user email and preferences
async function getUserEmailPrefs(userId: number) {
  const result = await db
    .select({
      email: users.email,
      full_name: profiles.full_name,
      preferences: profiles.email_preferences,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.user_id))
    .where(eq(users.id, userId))
    .limit(1)

  return result[0] || null
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chat.carphatian.ro'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userId: number, role: 'client' | 'freelancer') {
  const user = await getUserEmailPrefs(userId)
  if (!user) return { success: false, error: 'User not found' }

  const html = welcomeEmail({
    userName: user.full_name || 'there',
    userRole: role,
    dashboardUrl: `${BASE_URL}/${role}`,
  })

  return sendEmail({
    to: user.email,
    subject:
      role === 'client'
        ? '🚀 Welcome to Carphatian - Start Hiring Top Talent!'
        : '🎉 Welcome to Carphatian - Start Your Freelance Journey!',
    html,
  })
}

/**
 * Send notification when freelancer applies to a job
 */
export async function sendApplicationReceivedEmail(
  clientId: number,
  freelancerName: string,
  jobId: number,
  jobTitle: string,
  proposedRate: number,
  coverLetter: string
) {
  const client = await getUserEmailPrefs(clientId)
  if (!client) return { success: false, error: 'Client not found' }

  // Check preferences
  const prefs = client.preferences as { applications?: boolean } | null
  if (prefs && prefs.applications === false) {
    return { success: true, skipped: true, reason: 'User disabled application emails' }
  }

  const html = applicationReceivedEmail({
    clientName: client.full_name || 'there',
    freelancerName,
    jobTitle,
    proposedRate,
    coverLetterPreview: coverLetter.substring(0, 300),
    applicationUrl: `${BASE_URL}/client/jobs/${jobId}/applications`,
  })

  return sendEmail({
    to: client.email,
    subject: `New application from ${freelancerName} for "${jobTitle}"`,
    html,
  })
}

/**
 * Send notification when application status changes
 */
export async function sendApplicationStatusEmail(
  freelancerId: number,
  jobId: number,
  jobTitle: string,
  clientName: string,
  status: 'accepted' | 'rejected' | 'withdrawn',
  contractId?: number,
  message?: string
) {
  const freelancer = await getUserEmailPrefs(freelancerId)
  if (!freelancer) return { success: false, error: 'Freelancer not found' }

  // Check preferences
  const prefs = freelancer.preferences as { applications?: boolean } | null
  if (prefs && prefs.applications === false) {
    return { success: true, skipped: true, reason: 'User disabled application emails' }
  }

  const contractUrl = contractId ? `${BASE_URL}/contracts/${contractId}` : undefined

  const html = applicationStatusEmail({
    freelancerName: freelancer.full_name || 'there',
    jobTitle,
    clientName,
    status,
    contractUrl,
    message,
  })

  const subject =
    status === 'accepted'
      ? `🎉 Your application for "${jobTitle}" was accepted!`
      : status === 'rejected'
        ? `Application update for "${jobTitle}"`
        : `Application withdrawn for "${jobTitle}"`

  return sendEmail({
    to: freelancer.email,
    subject,
    html,
  })
}

/**
 * Send notification for new message
 */
export async function sendNewMessageEmail(
  recipientId: number,
  senderName: string,
  messageContent: string,
  conversationId?: number
) {
  const recipient = await getUserEmailPrefs(recipientId)
  if (!recipient) return { success: false, error: 'Recipient not found' }

  // Check preferences
  const prefs = recipient.preferences as { messages?: boolean } | null
  if (prefs && prefs.messages === false) {
    return { success: true, skipped: true, reason: 'User disabled message emails' }
  }

  const conversationUrl = conversationId
    ? `${BASE_URL}/messages?conversation=${conversationId}`
    : `${BASE_URL}/messages`

  const html = newMessageEmail({
    recipientName: recipient.full_name || 'there',
    senderName,
    messagePreview: messageContent.substring(0, 300),
    conversationUrl,
  })

  return sendEmail({
    to: recipient.email,
    subject: `New message from ${senderName}`,
    html,
  })
}

/**
 * Send notification when payment is released
 */
export async function sendPaymentReleasedEmail(
  freelancerId: number,
  clientName: string,
  jobTitle: string,
  milestoneTitle: string,
  amount: number
) {
  const freelancer = await getUserEmailPrefs(freelancerId)
  if (!freelancer) return { success: false, error: 'Freelancer not found' }

  // Check preferences
  const prefs = freelancer.preferences as { payments?: boolean } | null
  if (prefs && prefs.payments === false) {
    return { success: true, skipped: true, reason: 'User disabled payment emails' }
  }

  const html = paymentReleasedEmail({
    freelancerName: freelancer.full_name || 'there',
    clientName,
    jobTitle,
    milestoneTitle,
    amount,
    earningsUrl: `${BASE_URL}/freelancer/earnings`,
  })

  return sendEmail({
    to: freelancer.email,
    subject: `💰 Payment of $${amount} released for "${milestoneTitle}"`,
    html,
  })
}

/**
 * Send notification when milestone is submitted for review
 */
export async function sendMilestoneSubmittedEmail(
  clientId: number,
  freelancerName: string,
  jobTitle: string,
  milestoneTitle: string,
  amount: number,
  contractId: number,
  submissionNote?: string
) {
  const client = await getUserEmailPrefs(clientId)
  if (!client) return { success: false, error: 'Client not found' }

  // Check preferences
  const prefs = client.preferences as { payments?: boolean } | null
  if (prefs && prefs.payments === false) {
    return { success: true, skipped: true, reason: 'User disabled payment emails' }
  }

  const html = milestoneSubmittedEmail({
    clientName: client.full_name || 'there',
    freelancerName,
    jobTitle,
    milestoneTitle,
    amount,
    submissionNote,
    contractUrl: `${BASE_URL}/contracts/${contractId}`,
  })

  return sendEmail({
    to: client.email,
    subject: `📋 ${freelancerName} submitted "${milestoneTitle}" for review`,
    html,
  })
}

/**
 * Send review request after contract completion
 */
export async function sendReviewRequestEmail(
  recipientId: number,
  otherPartyName: string,
  jobTitle: string,
  contractId: number,
  isClient: boolean
) {
  const recipient = await getUserEmailPrefs(recipientId)
  if (!recipient) return { success: false, error: 'Recipient not found' }

  // Check preferences
  const prefs = recipient.preferences as { reviews?: boolean } | null
  if (prefs && prefs.reviews === false) {
    return { success: true, skipped: true, reason: 'User disabled review emails' }
  }

  const html = reviewRequestEmail({
    recipientName: recipient.full_name || 'there',
    otherPartyName,
    jobTitle,
    reviewUrl: `${BASE_URL}/contracts/${contractId}#review`,
    isClient,
  })

  return sendEmail({
    to: recipient.email,
    subject: `⭐ How was your experience with ${otherPartyName}?`,
    html,
  })
}
