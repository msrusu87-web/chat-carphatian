/**
 * Password Reset Email Template
 * Sent when a user requests to reset their password
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface PasswordResetData {
  userName: string
  resetUrl: string
  expiresIn: string
  ipAddress?: string
}

export function passwordResetEmail(data: PasswordResetData): { subject: string; html: string; text: string } {
  const subject = 'Reset Your Password - Carphatian AI Marketplace'
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔐</span>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Reset Your Password</h1>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to choose a new password.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
    
    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        ⚠️ This link will expire in <strong>${data.expiresIn}</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      </p>
    </div>
    
    ${data.ipAddress ? `
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        <strong>Request Details:</strong><br>
        IP Address: ${data.ipAddress}<br>
        Time: ${new Date().toISOString()}
      </p>
    </div>
    ` : ''}
    
    <p style="color: #6b7280; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
      ${data.resetUrl}
    </p>
  `
  
  const html = baseEmailTemplate({
    title: subject,
    previewText: 'Reset your Carphatian account password',
    content,
  })
  
  const text = `
Reset Your Password - Carphatian AI Marketplace

Hi ${data.userName},

We received a request to reset your password. Click the link below to choose a new password:

Reset Password: ${data.resetUrl}

This link will expire in ${data.expiresIn}. If you didn't request a password reset, please ignore this email and your password will remain unchanged.

${data.ipAddress ? `Request IP Address: ${data.ipAddress}` : ''}

---
Carphatian AI Marketplace
https://chat.carphatian.ro
  `
  
  return { subject, html, text }
}
