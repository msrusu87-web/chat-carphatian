/**
 * Test Email API
 * POST: Send a test email using configured SMTP settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { email, settings } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }
    
    // Create transporter based on settings
    const transportOptions: any = {
      host: settings.smtp_host || 'localhost',
      port: parseInt(settings.smtp_port || '25'),
      secure: settings.smtp_secure === 'true',
    }
    
    // Add auth only if credentials provided
    if (settings.smtp_user && settings.smtp_password && settings.smtp_password !== '********') {
      transportOptions.auth = {
        user: settings.smtp_user,
        pass: settings.smtp_password,
      }
    }
    
    // For local postfix, disable TLS verification
    if (settings.smtp_host === 'localhost') {
      transportOptions.tls = {
        rejectUnauthorized: false,
      }
    }
    
    const transporter = nodemailer.createTransport(transportOptions)
    
    // Verify connection
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      return NextResponse.json({ 
        success: false, 
        error: `SMTP connection failed: ${verifyError.message}` 
      }, { status: 400 })
    }
    
    // Build from address
    const fromName = settings.smtp_from_name || 'Carphatian AI Marketplace'
    const fromEmail = settings.smtp_from_email || 'noreply@chat.carphatian.ro'
    const from = `${fromName} <${fromEmail}>`
    
    // Send test email
    const result = await transporter.sendMail({
      from,
      to: email,
      subject: '✅ Test Email - Carphatian AI Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 28px;">✉️</span>
                </div>
                <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Email Test Successful!</h1>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                This is a test email from your <strong>Carphatian AI Marketplace</strong> platform. 
                If you're receiving this, your SMTP configuration is working correctly!
              </p>
              
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">✓ Configuration Details</h3>
                <ul style="color: #166534; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li>SMTP Host: ${settings.smtp_host || 'localhost'}</li>
                  <li>SMTP Port: ${settings.smtp_port || '25'}</li>
                  <li>From: ${from}</li>
                  <li>Sent: ${new Date().toISOString()}</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your email system is ready to send verification emails, password resets, and notifications.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Carphatian AI Marketplace &bull; <a href="https://chat.carphatian.ro" style="color: #3b82f6; text-decoration: none;">chat.carphatian.ro</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Test Email - Carphatian AI Marketplace

This is a test email from your Carphatian AI Marketplace platform.
If you're receiving this, your SMTP configuration is working correctly!

Configuration Details:
- SMTP Host: ${settings.smtp_host || 'localhost'}
- SMTP Port: ${settings.smtp_port || '25'}
- From: ${from}
- Sent: ${new Date().toISOString()}

Your email system is ready to send verification emails, password resets, and notifications.

---
Carphatian AI Marketplace
https://chat.carphatian.ro
      `,
    })
    
    console.log('Test email sent:', result.messageId)
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      response: result.response 
    })
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send test email' 
    }, { status: 500 })
  }
}
