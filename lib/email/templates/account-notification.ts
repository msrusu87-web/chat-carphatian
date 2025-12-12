/**
 * Account Notification Email Templates
 * Various account-related notifications
 * Built by Carphatian
 */

import { baseEmailTemplate } from './base'

// Password Changed Notification
interface PasswordChangedData {
  userName: string
  ipAddress?: string
  userAgent?: string
}

export function passwordChangedEmail(data: PasswordChangedData): { subject: string; html: string; text: string } {
  const subject = 'Password Changed - Carphatian AI Marketplace'
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔒</span>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Password Changed</h1>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Your password has been successfully changed. If you made this change, no further action is needed.
    </p>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #991b1b; font-size: 14px; margin: 0;">
        ⚠️ <strong>If you didn't make this change</strong>, please contact our support team immediately and reset your password.
      </p>
    </div>
    
    ${data.ipAddress ? `
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        <strong>Change Details:</strong><br>
        IP Address: ${data.ipAddress}<br>
        Time: ${new Date().toISOString()}
      </p>
    </div>
    ` : ''}
  `
  
  const html = baseEmailTemplate({
    title: subject,
    previewText: 'Your Carphatian account password has been changed',
    content,
  })
  
  const text = `
Password Changed - Carphatian AI Marketplace

Hi ${data.userName},

Your password has been successfully changed. If you made this change, no further action is needed.

If you didn't make this change, please contact our support team immediately and reset your password.

${data.ipAddress ? `Change IP Address: ${data.ipAddress}` : ''}
Time: ${new Date().toISOString()}

---
Carphatian AI Marketplace
https://chat.carphatian.ro
  `
  
  return { subject, html, text }
}

// Email Changed Notification
interface EmailChangedData {
  userName: string
  oldEmail: string
  newEmail: string
}

export function emailChangedEmail(data: EmailChangedData): { subject: string; html: string; text: string } {
  const subject = 'Email Address Changed - Carphatian AI Marketplace'
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">📧</span>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Email Address Changed</h1>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      The email address for your Carphatian account has been changed.
    </p>
    
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #4b5563; font-size: 14px; margin: 0;">
        <strong>Old email:</strong> ${data.oldEmail}<br>
        <strong>New email:</strong> ${data.newEmail}
      </p>
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px;">
      <p style="color: #991b1b; font-size: 14px; margin: 0;">
        ⚠️ If you didn't make this change, please contact our support team immediately.
      </p>
    </div>
  `
  
  const html = baseEmailTemplate({
    title: subject,
    previewText: 'Your Carphatian account email has been changed',
    content,
  })
  
  const text = `
Email Address Changed - Carphatian AI Marketplace

Hi ${data.userName},

The email address for your Carphatian account has been changed.

Old email: ${data.oldEmail}
New email: ${data.newEmail}

If you didn't make this change, please contact our support team immediately.

---
Carphatian AI Marketplace
https://chat.carphatian.ro
  `
  
  return { subject, html, text }
}

// New Login Notification
interface NewLoginData {
  userName: string
  ipAddress: string
  location?: string
  device?: string
  time: string
}

export function newLoginEmail(data: NewLoginData): { subject: string; html: string; text: string } {
  const subject = 'New Login Detected - Carphatian AI Marketplace'
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6, #a855f7); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔑</span>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">New Login Detected</h1>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We noticed a new login to your Carphatian account.
    </p>
    
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #4b5563; font-size: 14px; margin: 0;">
        <strong>Login Details:</strong><br>
        IP Address: ${data.ipAddress}<br>
        ${data.location ? `Location: ${data.location}<br>` : ''}
        ${data.device ? `Device: ${data.device}<br>` : ''}
        Time: ${data.time}
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If this was you, no action is needed. If you don't recognize this activity, please change your password immediately.
    </p>
  `
  
  const html = baseEmailTemplate({
    title: subject,
    previewText: 'New login detected on your Carphatian account',
    content,
  })
  
  const text = `
New Login Detected - Carphatian AI Marketplace

Hi ${data.userName},

We noticed a new login to your Carphatian account.

Login Details:
IP Address: ${data.ipAddress}
${data.location ? `Location: ${data.location}` : ''}
${data.device ? `Device: ${data.device}` : ''}
Time: ${data.time}

If this was you, no action is needed. If you don't recognize this activity, please change your password immediately.

---
Carphatian AI Marketplace
https://chat.carphatian.ro
  `
  
  return { subject, html, text }
}

// Account Verified Notification
interface AccountVerifiedData {
  userName: string
}

export function accountVerifiedEmail(data: AccountVerifiedData): { subject: string; html: string; text: string } {
  const subject = 'Account Verified! - Carphatian AI Marketplace'
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">✅</span>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Account Verified!</h1>
    </div>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Great news! Your email address has been verified and your Carphatian account is now fully activated.
    </p>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #166534; font-size: 14px; margin: 0;">
        ✓ Email verified<br>
        ✓ Account activated<br>
        ✓ Full platform access enabled
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://chat.carphatian.ro/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      You're all set to start using Carphatian AI Marketplace. Browse jobs, apply to projects, or post your first job!
    </p>
  `
  
  const html = baseEmailTemplate({
    title: subject,
    previewText: 'Your Carphatian account is now verified and ready!',
    content,
  })
  
  const text = `
Account Verified! - Carphatian AI Marketplace

Hi ${data.userName},

Great news! Your email address has been verified and your Carphatian account is now fully activated.

✓ Email verified
✓ Account activated
✓ Full platform access enabled

Go to Dashboard: https://chat.carphatian.ro/dashboard

You're all set to start using Carphatian AI Marketplace. Browse jobs, apply to projects, or post your first job!

---
Carphatian AI Marketplace
https://chat.carphatian.ro
  `
  
  return { subject, html, text }
}
