/**
 * Payment Released Email Template
 * Sent to freelancer when client releases a milestone payment
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface PaymentReleasedProps {
  freelancerName: string
  clientName: string
  jobTitle: string
  milestoneTitle: string
  amount: number
  currency?: string
  earningsUrl: string
}

export function paymentReleasedEmail({
  freelancerName,
  clientName,
  jobTitle,
  milestoneTitle,
  amount,
  currency = 'USD',
  earningsUrl,
}: PaymentReleasedProps): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)

  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${freelancerName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      Great news! ${clientName} has released a payment for your work. The funds are on their way to your account.
    </p>
    
    <!-- Payment Card -->
    <div style="background-color: #374151; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <!-- Amount Header -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.8);">
          Payment Amount
        </p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff;">
          ${formattedAmount}
        </p>
      </div>
      
      <!-- Details -->
      <div style="padding: 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #4b5563;">
              <span style="font-size: 14px; color: #6b7280;">Project</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #4b5563; text-align: right;">
              <span style="font-size: 14px; color: #e5e7eb; font-weight: 500;">${jobTitle}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #4b5563;">
              <span style="font-size: 14px; color: #6b7280;">Milestone</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #4b5563; text-align: right;">
              <span style="font-size: 14px; color: #e5e7eb; font-weight: 500;">${milestoneTitle}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #4b5563;">
              <span style="font-size: 14px; color: #6b7280;">Client</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #4b5563; text-align: right;">
              <span style="font-size: 14px; color: #e5e7eb; font-weight: 500;">${clientName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="font-size: 14px; color: #6b7280;">Status</span>
            </td>
            <td style="padding: 12px 0; text-align: right;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #10b98120; color: #10b981; font-size: 13px; font-weight: 600; border-radius: 4px;">
                ✓ Released
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
    
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      <strong style="color: #10b981;">💰 Payout timing:</strong> Funds typically arrive in your connected bank account within 2-3 business days.
    </p>
  `

  return baseEmailTemplate({
    previewText: `💰 You've received ${formattedAmount} for "${milestoneTitle}"`,
    title: 'Payment Released! 💸',
    content,
    ctaText: 'View Earnings',
    ctaUrl: earningsUrl,
    footerNote: 'Keep up the great work! Your next opportunity is just around the corner.',
  })
}
