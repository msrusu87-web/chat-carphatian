/**
 * Review Request Email Template
 * Sent after contract completion to request reviews
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface ReviewRequestProps {
  recipientName: string
  otherPartyName: string
  jobTitle: string
  reviewUrl: string
  isClient: boolean
}

export function reviewRequestEmail({
  recipientName,
  otherPartyName,
  jobTitle,
  reviewUrl,
  isClient,
}: ReviewRequestProps): string {
  const roleText = isClient ? 'freelancer' : 'client'

  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${recipientName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      Congratulations on completing your project! We'd love to hear about your experience working with ${otherPartyName}.
    </p>
    
    <!-- Project Card -->
    <div style="background-color: #374151; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
              Completed Project
            </p>
            <h3 style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 600;">
              ${jobTitle}
            </h3>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 40px; vertical-align: middle;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">
                      ${otherPartyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <p style="margin: 0; font-size: 14px; color: #e5e7eb; font-weight: 500;">
                    ${otherPartyName}
                  </p>
                  <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">
                    ${roleText.charAt(0).toUpperCase() + roleText.slice(1)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Stars Preview -->
    <div style="text-align: center; padding: 24px 0;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
        How was your experience?
      </p>
      <div style="font-size: 32px;">
        ⭐ ⭐ ⭐ ⭐ ⭐
      </div>
    </div>
    
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      Your review helps other users make informed decisions and helps ${otherPartyName} build their reputation on the platform.
    </p>
  `

  return baseEmailTemplate({
    previewText: `How was your experience with ${otherPartyName}? Leave a review!`,
    title: 'Share Your Experience ⭐',
    content,
    ctaText: 'Leave a Review',
    ctaUrl: reviewUrl,
    footerNote: 'Reviews typically take less than 2 minutes and make a big difference!',
  })
}
