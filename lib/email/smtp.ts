/**
 * Local SMTP Email Service
 * Send emails using local Postfix server
 * Built by Carphatian
 */

import nodemailer from 'nodemailer'

// Create transporter for local Postfix
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
})

// Default sender
const DEFAULT_FROM = 'Carphatian AI Marketplace <noreply@chat.carphatian.ro>'

export interface SmtpEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Send an email via local SMTP (Postfix)
 */
export async function sendSmtpEmail(
  options: SmtpEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const info = await transporter.sendMail({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('SMTP email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify SMTP connection
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('SMTP server is ready to send emails')
    return true
  } catch (error) {
    console.error('SMTP verification failed:', error)
    return false
  }
}
