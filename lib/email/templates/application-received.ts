/**
 * Application Received Email Template
 * Sent to clients when a freelancer applies to their job
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface ApplicationReceivedProps {
  clientName: string
  freelancerName: string
  jobTitle: string
  proposedRate: number
  coverLetterPreview: string
  applicationUrl: string
}

export function applicationReceivedEmail({
  clientName,
  freelancerName,
  jobTitle,
  proposedRate,
  coverLetterPreview,
  applicationUrl,
}: ApplicationReceivedProps): string {
  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${clientName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      Great news! You've received a new application for your job posting.
    </p>
    
    <!-- Application Card -->
    <div style="background-color: #374151; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #ffffff;">
              ${jobTitle}
            </h3>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 48px; vertical-align: top;">
                  <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: 600; line-height: 48px; text-align: center; display: block; width: 100%;">
                      ${freelancerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </td>
                <td style="padding-left: 16px; vertical-align: top;">
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                    ${freelancerName}
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #10b981;">
                    Proposed Rate: $${proposedRate}/hr
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 16px;">
            <p style="margin: 0; font-size: 14px; color: #9ca3af; font-style: italic;">
              "${coverLetterPreview.length > 150 ? coverLetterPreview.substring(0, 150) + '...' : coverLetterPreview}"
            </p>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      Review the full application and connect with ${freelancerName} to discuss your project.
    </p>
  `

  return baseEmailTemplate({
    previewText: `New application from ${freelancerName} for "${jobTitle}"`,
    title: 'New Application Received! 🎉',
    content,
    ctaText: 'View Application',
    ctaUrl: applicationUrl,
    footerNote: "Don't miss out on great talent. Applications are reviewed on a first-come basis.",
  })
}
