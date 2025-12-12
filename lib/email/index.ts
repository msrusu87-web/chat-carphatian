/**
 * Email Service Module
 * Send transactional emails using local SMTP (Postfix) with Resend as fallback
 * Built by Carphatian
 */

import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// ============================================
// LOCAL SMTP (PRIMARY)
// ============================================

// Create transporter for local Postfix
const smtpTransporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
})

// ============================================
// RESEND (FALLBACK)
// ============================================

let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// ============================================
// EMAIL SERVICE
// ============================================

// Default sender
const DEFAULT_FROM = 'Carphatian AI Marketplace <noreply@chat.carphatian.ro>'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
  text?: string
}

/**
 * Send an email using local SMTP first, then Resend as fallback
 */
export async function sendEmail(
  options: EmailOptions
): Promise<{ success: boolean; id?: string; error?: string; provider?: string }> {
  const from = options.from || DEFAULT_FROM
  const to = Array.isArray(options.to) ? options.to : [options.to]

  // Try local SMTP first
  try {
    const info = await smtpTransporter.sendMail({
      from,
      to: to.join(', '),
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    console.log('Email sent via SMTP:', info.messageId)
    return { success: true, id: info.messageId, provider: 'smtp' }
  } catch (smtpError: any) {
    console.warn('SMTP failed, trying Resend fallback:', smtpError.message)

    // Fallback to Resend
    const resendClient = getResendClient()
    if (resendClient) {
      try {
        const { data, error } = await resendClient.emails.send({
          from,
          to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo,
        })

        if (error) {
          console.error('Resend error:', error)
          return { success: false, error: error.message, provider: 'resend' }
        }

        console.log('Email sent via Resend:', data?.id)
        return { success: true, id: data?.id, provider: 'resend' }
      } catch (resendError: any) {
        console.error('Resend error:', resendError)
        return { success: false, error: resendError.message, provider: 'resend' }
      }
    }

    // Both failed
    return {
      success: false,
      error: `SMTP failed: ${smtpError.message}. No Resend fallback configured.`,
      provider: 'none',
    }
  }
}

/**
 * Send email via SMTP only (for internal use)
 */
export async function sendSmtpEmail(
  options: EmailOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const info = await smtpTransporter.sendMail({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    return { success: true, id: info.messageId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Verify SMTP connection is working
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await smtpTransporter.verify()
    console.log('SMTP server is ready to send emails')
    return true
  } catch (error) {
    console.error('SMTP verification failed:', error)
    return false
  }
}

/**
 * Send email via Resend only
 */
export async function sendResendEmail(
  options: EmailOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resendClient = getResendClient()
  if (!resendClient) {
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
