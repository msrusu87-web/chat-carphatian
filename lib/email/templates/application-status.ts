/**
 * Application Status Email Template
 * Sent to freelancers when their application status changes
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface ApplicationStatusProps {
  freelancerName: string
  jobTitle: string
  clientName: string
  status: 'accepted' | 'rejected' | 'withdrawn'
  contractUrl?: string
  message?: string
}

export function applicationStatusEmail({
  freelancerName,
  jobTitle,
  clientName,
  status,
  contractUrl,
  message,
}: ApplicationStatusProps): string {
  const statusConfig = {
    accepted: {
      emoji: '🎉',
      title: 'Congratulations! Your Application Was Accepted',
      color: '#10b981',
      statusText: 'Accepted',
      description: `Great news! ${clientName} has accepted your application. You're one step closer to starting this exciting project.`,
      cta: { text: 'View Contract', url: contractUrl },
    },
    rejected: {
      emoji: '😔',
      title: 'Application Update',
      color: '#ef4444',
      statusText: 'Not Selected',
      description: `Unfortunately, ${clientName} has decided to go with another freelancer for this project. Don't be discouraged—there are plenty of opportunities waiting for you!`,
      cta: { text: 'Browse More Jobs', url: 'https://chat.carphatian.ro/freelancer/jobs' },
    },
    withdrawn: {
      emoji: '📝',
      title: 'Application Withdrawn',
      color: '#6b7280',
      statusText: 'Withdrawn',
      description: "Your application has been withdrawn as requested. You can always apply to other jobs that match your skills.",
      cta: { text: 'Browse Jobs', url: 'https://chat.carphatian.ro/freelancer/jobs' },
    },
  }

  const config = statusConfig[status]

  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${freelancerName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      ${config.description}
    </p>
    
    <!-- Status Card -->
    <div style="background-color: #374151; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid ${config.color};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
              Job Title
            </p>
            <h3 style="margin: 0; font-size: 18px; color: #ffffff;">
              ${jobTitle}
            </h3>
          </td>
          <td align="right" style="vertical-align: top;">
            <span style="display: inline-block; padding: 6px 12px; background-color: ${config.color}20; color: ${config.color}; font-size: 14px; font-weight: 600; border-radius: 6px;">
              ${config.statusText}
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 16px;">
            <p style="margin: 0; font-size: 14px; color: #9ca3af;">
              Client: <span style="color: #e5e7eb;">${clientName}</span>
            </p>
          </td>
        </tr>
        ${
          message
            ? `
        <tr>
          <td colspan="2" style="padding-top: 16px; border-top: 1px solid #4b5563; margin-top: 16px;">
            <p style="margin: 16px 0 0 0; font-size: 14px; color: #9ca3af;">
              Message from ${clientName}:
            </p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #e5e7eb; font-style: italic;">
              "${message}"
            </p>
          </td>
        </tr>
        `
            : ''
        }
      </table>
    </div>
    
    ${
      status === 'accepted'
        ? `
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      <strong style="color: #10b981;">Next steps:</strong> Review the contract details and discuss project milestones with ${clientName}. Good luck with the project!
    </p>
    `
        : ''
    }
  `

  return baseEmailTemplate({
    previewText: `${config.emoji} Application ${config.statusText.toLowerCase()} for "${jobTitle}"`,
    title: config.title,
    content,
    ctaText: config.cta.text,
    ctaUrl: config.cta.url,
  })
}
