/**
 * Email Verification Email Template
 * Sent when a user registers to verify their email address
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

interface EmailVerificationData {
  userName: string
  verificationUrl: string
  expiresIn: string
}

export function emailVerificationEmail(data: EmailVerificationData): { subject: string; html: string; text: string } {
  const subject = 'Verify Your Email - Carphatian AI Marketplace'
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">✉️</span>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Verify Your Email</h1>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Thanks for signing up for Carphatian AI Marketplace! Please verify your email address by clicking the button below.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.verificationUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Verify Email Address
      </a>
    </div>
    
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        This link will expire in <strong>${data.expiresIn}</strong>. If you didn't create an account with Carphatian, you can safely ignore this email.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
      ${data.verificationUrl}
    </p>
  `
  
  const html = baseEmailTemplate({
    title: subject,
    previewText: 'Please verify your email to activate your account',
    content,
  })
  
  const text = `
Verify Your Email - Carphatian AI Marketplace

Hi ${data.userName},

Thanks for signing up for Carphatian AI Marketplace! Please verify your email address by clicking the link below.

Verify Email: ${data.verificationUrl}

This link will expire in ${data.expiresIn}. If you didn't create an account with Carphatian, you can safely ignore this email.

---
Carphatian AI Marketplace
https://chat.carphatian.ro
  `
  
  return { subject, html, text }
}
