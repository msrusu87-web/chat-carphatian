/**
 * Welcome Email Template
 * Sent to new users after signup
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface WelcomeEmailProps {
  userName: string
  userRole: 'client' | 'freelancer'
  dashboardUrl: string
}

export function welcomeEmail({ userName, userRole, dashboardUrl }: WelcomeEmailProps): string {
  const roleConfig = {
    client: {
      title: 'Welcome to Carphatian! 🚀',
      subtitle: 'Start finding top talent for your projects',
      features: [
        { icon: '🎯', title: 'Post a Job', description: 'Describe your project and let AI help you craft the perfect job posting.' },
        { icon: '🤖', title: 'AI Matching', description: "We'll recommend the best freelancers based on skills, reviews, and project fit." },
        { icon: '💳', title: 'Secure Payments', description: 'Funds are held in escrow until you approve the work.' },
      ],
      ctaText: 'Post Your First Job',
      ctaUrl: 'https://chat.carphatian.ro/client/jobs/new',
    },
    freelancer: {
      title: 'Welcome to Carphatian! 🎉',
      subtitle: "Start your freelance journey and land your dream projects",
      features: [
        { icon: '💼', title: 'Complete Your Profile', description: 'Add your skills, portfolio, and hourly rate to stand out.' },
        { icon: '🔍', title: 'AI Job Matching', description: 'Get personalized job recommendations based on your expertise.' },
        { icon: '💰', title: 'Get Paid Securely', description: 'Receive milestone payments directly to your bank account.' },
      ],
      ctaText: 'Complete Your Profile',
      ctaUrl: 'https://chat.carphatian.ro/profile/edit',
    },
  }

  const config = roleConfig[userRole]

  const featuresHtml = config.features
    .map(
      (f) => `
      <tr>
        <td style="padding: 16px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 48px; vertical-align: top;">
                <div style="width: 48px; height: 48px; background-color: #374151; border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px;">
                  ${f.icon}
                </div>
              </td>
              <td style="padding-left: 16px; vertical-align: top;">
                <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                  ${f.title}
                </h4>
                <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                  ${f.description}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join('')

  const content = `
    <p style="color: #e5e7eb; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    
    <p style="color: #9ca3af; margin: 0 0 24px 0;">
      ${config.subtitle}. We're thrilled to have you join our AI-powered freelance marketplace!
    </p>
    
    <!-- Getting Started -->
    <div style="background-color: #374151; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 600;">
        🚀 Get Started in 3 Easy Steps
      </h3>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${featuresHtml}
      </table>
    </div>
    
    <p style="color: #9ca3af; margin: 24px 0 0 0;">
      If you have any questions, our support team is here to help. Just reply to this email!
    </p>
  `

  return baseEmailTemplate({
    previewText: `Welcome to Carphatian! ${config.subtitle}`,
    title: config.title,
    content,
    ctaText: config.ctaText,
    ctaUrl: config.ctaUrl,
    footerNote: "We're excited to see what you'll accomplish on Carphatian!",
  })
}
