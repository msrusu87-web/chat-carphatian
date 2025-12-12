/**
 * Base Email Template
 * Common wrapper for all email templates
 * Built by Carphatian
 */

export interface BaseEmailProps {
  previewText?: string
}

const BRAND_COLOR = '#7c3aed' // Purple-600
const SECONDARY_COLOR = '#4f46e5' // Indigo-600

/**
 * Base email wrapper with consistent branding
 */
export function baseEmailTemplate({
  previewText = '',
  title,
  content,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  previewText?: string
  title: string
  content: string
  ctaText?: string
  ctaUrl?: string
  footerNote?: string
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${previewText ? `<meta name="description" content="${previewText}">` : ''}
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button { padding: 12px 24px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text (hidden) -->
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}
  
  <!-- Main container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Content card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #1f2937; border-radius: 16px; overflow: hidden; border: 1px solid #374151;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 40px; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%);">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Carphatian
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">
                      AI-Powered Freelance Marketplace
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                ${title}
              </h2>
              
              <div style="font-size: 16px; line-height: 1.6; color: #9ca3af;">
                ${content}
              </div>
              
              ${
                ctaText && ctaUrl
                  ? `
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%); border-radius: 8px;">
                    <a href="${ctaUrl}" target="_blank" class="button" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
              
              ${
                footerNote
                  ? `
              <p style="margin-top: 32px; font-size: 14px; color: #6b7280; border-top: 1px solid #374151; padding-top: 24px;">
                ${footerNote}
              </p>
              `
                  : ''
              }
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #111827; border-top: 1px solid #374151;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 13px; color: #6b7280;">
                    <p style="margin: 0;">
                      You're receiving this email because you have an account on Carphatian.
                    </p>
                    <p style="margin: 8px 0 0 0;">
                      <a href="https://chat.carphatian.ro/settings/notifications" style="color: ${BRAND_COLOR}; text-decoration: none;">
                        Manage notification preferences
                      </a>
                      &nbsp;•&nbsp;
                      <a href="https://chat.carphatian.ro/privacy" style="color: ${BRAND_COLOR}; text-decoration: none;">
                        Privacy Policy
                      </a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; font-size: 12px; color: #4b5563;">
                    © ${new Date().getFullYear()} Carphatian. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
