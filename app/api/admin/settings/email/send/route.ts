import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { to, subject, message } = await request.json()

    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: 'No recipients specified' }, { status: 400 })
    }

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Create transporter for local Postfix
    const transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    })

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Send emails to each recipient
    for (const email of to) {
      try {
        await transporter.sendMail({
          from: '"Carphatian AI Marketplace" <noreply@chat.carphatian.ro>',
          to: email,
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Carphatian</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">AI-Powered Marketplace</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
                <div style="color: #4b5563; white-space: pre-wrap;">${message}</div>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  This email was sent by Carphatian AI Marketplace.<br>
                  <a href="https://chat.carphatian.ro" style="color: #3b82f6;">Visit our website</a>
                </p>
              </div>
            </body>
            </html>
          `,
          text: message,
        })
        results.sent++
      } catch (error: any) {
        results.failed++
        results.errors.push(`${email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error: any) {
    console.error('Failed to send emails:', error)
    return NextResponse.json({ error: error.message || 'Failed to send emails' }, { status: 500 })
  }
}
