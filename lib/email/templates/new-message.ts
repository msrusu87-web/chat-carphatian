/**
 * New Message Email Template
 * Sent when user receives a new message
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface NewMessageProps {
  recipientName: string
  senderName: string
  messagePreview: string
  conversationUrl: string
  senderAvatarInitial?: string
}

export function newMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
  senderAvatarInitial,
}: NewMessageProps): string {
  const initial = senderAvatarInitial || senderName.charAt(0).toUpperCase()

  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${recipientName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      You have a new message from ${senderName}.
    </p>
    
    <!-- Message Card -->
    <div style="background-color: #374151; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 48px; vertical-align: top;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border-radius: 50%; text-align: center; line-height: 48px;">
              <span style="color: #ffffff; font-size: 20px; font-weight: 600;">
                ${initial}
              </span>
            </div>
          </td>
          <td style="padding-left: 16px; vertical-align: top;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">
              ${senderName}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">
              ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 16px;">
            <div style="background-color: #1f2937; border-radius: 8px; padding: 16px; border-left: 3px solid #7c3aed;">
              <p style="margin: 0; font-size: 15px; color: #e5e7eb; line-height: 1.5;">
                ${messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview}
              </p>
            </div>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      Reply to continue the conversation and keep your project moving forward.
    </p>
  `

  return baseEmailTemplate({
    previewText: `New message from ${senderName}: "${messagePreview.substring(0, 50)}..."`,
    title: 'New Message 💬',
    content,
    ctaText: 'Reply Now',
    ctaUrl: conversationUrl,
    footerNote: 'Quick responses lead to better collaborations!',
  })
}
