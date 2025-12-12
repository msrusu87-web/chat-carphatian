/**
 * Milestone Submitted Email Template
 * Sent to client when freelancer submits work for a milestone
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface MilestoneSubmittedProps {
  clientName: string
  freelancerName: string
  jobTitle: string
  milestoneTitle: string
  amount: number
  currency?: string
  submissionNote?: string
  contractUrl: string
}

export function milestoneSubmittedEmail({
  clientName,
  freelancerName,
  jobTitle,
  milestoneTitle,
  amount,
  currency = 'USD',
  submissionNote,
  contractUrl,
}: MilestoneSubmittedProps): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)

  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${clientName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      ${freelancerName} has submitted work for a milestone on your project. Please review the deliverables and release the payment if you're satisfied.
    </p>
    
    <!-- Milestone Card -->
    <div style="background-color: #374151; border-radius: 12px; overflow: hidden; margin: 24px 0; border: 2px solid #f59e0b;">
      <!-- Header -->
      <div style="background-color: #f59e0b20; padding: 16px 24px; border-bottom: 1px solid #4b5563;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="font-size: 14px; font-weight: 600; color: #f59e0b;">
                ⏳ Pending Review
              </span>
            </td>
            <td align="right">
              <span style="font-size: 18px; font-weight: 700; color: #ffffff;">
                ${formattedAmount}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Details -->
      <div style="padding: 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                Project
              </p>
              <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                ${jobTitle}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                Milestone
              </p>
              <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                ${milestoneTitle}
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                Submitted By
              </p>
              <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                ${freelancerName}
              </p>
            </td>
          </tr>
          ${
            submissionNote
              ? `
          <tr>
            <td style="padding-top: 16px; border-top: 1px solid #4b5563; margin-top: 16px;">
              <p style="margin: 16px 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                Freelancer Note
              </p>
              <div style="background-color: #1f2937; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; font-size: 14px; color: #e5e7eb; font-style: italic; line-height: 1.5;">
                  "${submissionNote}"
                </p>
              </div>
            </td>
          </tr>
          `
              : ''
          }
        </table>
      </div>
    </div>
    
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      <strong style="color: #f59e0b;">⚡ Action required:</strong> Review the submitted work and release the payment if you're satisfied, or request revisions if needed.
    </p>
  `

  return baseEmailTemplate({
    previewText: `${freelancerName} submitted "${milestoneTitle}" for review`,
    title: 'Milestone Ready for Review 📋',
    content,
    ctaText: 'Review & Release Payment',
    ctaUrl: contractUrl,
    footerNote: 'Quick reviews help build trust and keep projects on track.',
  })
}
