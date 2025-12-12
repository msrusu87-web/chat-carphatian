/**
 * Audit Logging System
 * Track security-relevant events for compliance
 * Built by Carphatian
 */

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextRequest } from 'next/server'

// Audit event types
export type AuditEventType =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.password_change'
  | 'auth.signup'
  | 'user.profile_update'
  | 'user.settings_change'
  | 'user.delete_account'
  | 'user.data_export'
  | 'job.create'
  | 'job.update'
  | 'job.delete'
  | 'application.submit'
  | 'application.accept'
  | 'application.reject'
  | 'contract.create'
  | 'contract.complete'
  | 'contract.cancel'
  | 'payment.initiate'
  | 'payment.release'
  | 'payment.refund'
  | 'admin.user_update'
  | 'admin.user_delete'
  | 'admin.settings_change'
  | 'security.rate_limit_exceeded'
  | 'security.suspicious_activity'
  | 'api.error'

// Audit log entry
export interface AuditLogEntry {
  id?: number
  timestamp: Date
  event_type: AuditEventType
  user_id?: number
  user_email?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  action?: string
  details?: Record<string, unknown>
  status: 'success' | 'failure' | 'warning'
}

// In-memory buffer for batch inserts
const auditBuffer: AuditLogEntry[] = []
const BUFFER_SIZE = 10
const FLUSH_INTERVAL = 5000 // 5 seconds

// Flush buffer periodically
let flushTimer: NodeJS.Timeout | null = null

/**
 * Start the audit flush timer
 */
function startFlushTimer() {
  if (!flushTimer) {
    flushTimer = setInterval(flushAuditBuffer, FLUSH_INTERVAL)
  }
}

/**
 * Flush audit buffer to database
 */
async function flushAuditBuffer() {
  if (auditBuffer.length === 0) return

  const entries = [...auditBuffer]
  auditBuffer.length = 0

  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      entries.forEach(entry => {
        console.log(`[AUDIT] ${entry.event_type}:`, {
          user: entry.user_email || entry.user_id || 'anonymous',
          resource: entry.resource_type ? `${entry.resource_type}/${entry.resource_id}` : undefined,
          status: entry.status,
          details: entry.details
        })
      })
    }

    // In production, you would insert to database
    // For now, we'll store in a JSON file or external service
    // This could be extended to use a proper audit logging service
    
    // Example: Store to database table (create audit_logs table)
    // await db.insert(auditLogs).values(entries)
    
  } catch (error) {
    console.error('Failed to flush audit logs:', error)
    // Re-add failed entries to buffer
    auditBuffer.unshift(...entries)
  }
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  options: {
    userId?: number
    userEmail?: string
    ipAddress?: string
    userAgent?: string
    resourceType?: string
    resourceId?: string
    action?: string
    details?: Record<string, unknown>
    status?: 'success' | 'failure' | 'warning'
  } = {}
): Promise<void> {
  const entry: AuditLogEntry = {
    timestamp: new Date(),
    event_type: eventType,
    user_id: options.userId,
    user_email: options.userEmail,
    ip_address: options.ipAddress,
    user_agent: options.userAgent,
    resource_type: options.resourceType,
    resource_id: options.resourceId,
    action: options.action,
    details: options.details,
    status: options.status || 'success',
  }

  auditBuffer.push(entry)
  startFlushTimer()

  // Flush immediately if buffer is full
  if (auditBuffer.length >= BUFFER_SIZE) {
    await flushAuditBuffer()
  }
}

/**
 * Log audit event from API request
 */
export async function logApiAudit(
  request: NextRequest,
  eventType: AuditEventType,
  options: {
    resourceType?: string
    resourceId?: string
    action?: string
    details?: Record<string, unknown>
    status?: 'success' | 'failure' | 'warning'
  } = {}
): Promise<void> {
  // Get user from session
  let userId: number | undefined
  let userEmail: string | undefined
  
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      userId = parseInt(session.user.id as string)
      userEmail = session.user.email || undefined
    }
  } catch {
    // Session not available
  }

  // Get IP and user agent
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded?.split(',')[0]?.trim() || 
                    request.headers.get('x-real-ip') || 
                    undefined
  const userAgent = request.headers.get('user-agent') || undefined

  await logAuditEvent(eventType, {
    userId,
    userEmail,
    ipAddress,
    userAgent,
    ...options,
  })
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: 'security.rate_limit_exceeded' | 'security.suspicious_activity',
  request: NextRequest,
  details?: Record<string, unknown>
): Promise<void> {
  await logApiAudit(request, eventType, {
    details,
    status: 'warning',
  })
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  eventType: 'auth.login' | 'auth.logout' | 'auth.login_failed' | 'auth.signup' | 'auth.password_change',
  options: {
    userId?: number
    userEmail?: string
    ipAddress?: string
    userAgent?: string
    details?: Record<string, unknown>
    status?: 'success' | 'failure'
  }
): Promise<void> {
  await logAuditEvent(eventType, options)
}

/**
 * Clean up old audit logs (for GDPR compliance)
 */
export async function cleanupOldAuditLogs(retentionDays = 90): Promise<number> {
  // This would delete logs older than retention period
  // Implementation depends on where logs are stored
  console.log(`Would clean up audit logs older than ${retentionDays} days`)
  return 0
}

// Ensure buffer is flushed on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await flushAuditBuffer()
  })
}
