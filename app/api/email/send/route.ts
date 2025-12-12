/**
 * Email Sending API Route
 * POST /api/email/send
 * Built by Carphatian
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, to, data } = body

    if (!type || !to || !data) {
      return NextResponse.json({ error: 'Missing required fields: type, to, data' }, { status: 400 })
    }

    let subject: string
    let html: string

    switch (type) {
      case 'application-received':
        subject = `New application from ${data.freelancerName} for "${data.jobTitle}"`
        html = applicationReceivedEmail({
          clientName: data.clientName,
          freelancerName: data.freelancerName,
          jobTitle: data.jobTitle,
          proposedRate: data.proposedRate,
          coverLetterPreview: data.coverLetterPreview,
          applicationUrl: data.applicationUrl,
        })
        break

      case 'application-status':
        subject =
          data.status === 'accepted'
            ? `🎉 Your application for "${data.jobTitle}" was accepted!`
            : data.status === 'rejected'
              ? `Application update for "${data.jobTitle}"`
              : `Application withdrawn for "${data.jobTitle}"`
        html = applicationStatusEmail({
          freelancerName: data.freelancerName,
          jobTitle: data.jobTitle,
          clientName: data.clientName,
          status: data.status,
          contractUrl: data.contractUrl,
          message: data.message,
        })
        break

      case 'new-message':
        subject = `New message from ${data.senderName}`
        html = newMessageEmail({
          recipientName: data.recipientName,
          senderName: data.senderName,
          messagePreview: data.messagePreview,
          conversationUrl: data.conversationUrl,
        })
        break

      case 'payment-released':
        subject = `💰 Payment of ${data.amount} released for "${data.milestoneTitle}"`
        html = paymentReleasedEmail({
          freelancerName: data.freelancerName,
          clientName: data.clientName,
          jobTitle: data.jobTitle,
          milestoneTitle: data.milestoneTitle,
          amount: data.amount,
          currency: data.currency,
          earningsUrl: data.earningsUrl,
        })
        break

      case 'milestone-submitted':
        subject = `📋 ${data.freelancerName} submitted "${data.milestoneTitle}" for review`
        html = milestoneSubmittedEmail({
          clientName: data.clientName,
          freelancerName: data.freelancerName,
          jobTitle: data.jobTitle,
          milestoneTitle: data.milestoneTitle,
          amount: data.amount,
          currency: data.currency,
          submissionNote: data.submissionNote,
          contractUrl: data.contractUrl,
        })
        break

      case 'review-request':
        subject = `⭐ How was your experience with ${data.otherPartyName}?`
        html = reviewRequestEmail({
          recipientName: data.recipientName,
          otherPartyName: data.otherPartyName,
          jobTitle: data.jobTitle,
          reviewUrl: data.reviewUrl,
          isClient: data.isClient,
        })
        break

      case 'welcome':
        subject =
          data.userRole === 'client'
            ? '🚀 Welcome to Carphatian - Start Hiring Top Talent!'
            : '🎉 Welcome to Carphatian - Start Your Freelance Journey!'
        html = welcomeEmail({
          userName: data.userName,
          userRole: data.userRole,
          dashboardUrl: data.dashboardUrl,
        })
        break

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    const result = await sendEmail({
      to,
      subject,
      html,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
