/**
 * Input Sanitization Utilities
 * Protect against XSS and injection attacks
 * Built by Carphatian
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content (removes dangerous tags/attributes)
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize plain text (strips all HTML)
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize and validate email
 */
export function sanitizeEmail(email: string): string | null {
  const cleaned = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(cleaned) ? cleaned : null
}

/**
 * Sanitize URL (validate and clean)
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize filename (remove dangerous characters)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Remove dangerous chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255) // Limit length
}

/**
 * Sanitize object keys and string values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeText(key)
    
    if (typeof value === 'string') {
      result[sanitizedKey] = sanitizeText(value)
    } else if (Array.isArray(value)) {
      result[sanitizedKey] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : 
        item
      )
    } else if (typeof value === 'object' && value !== null) {
      result[sanitizedKey] = sanitizeObject(value as Record<string, unknown>)
    } else {
      result[sanitizedKey] = value
    }
  }
  
  return result as T
}

/**
 * Escape special characters for SQL LIKE queries
 */
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_\\]/g, '\\$&')
}

/**
 * Validate and sanitize integer
 */
export function sanitizeInteger(value: unknown, min?: number, max?: number): number | null {
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value)
  
  if (isNaN(num) || !Number.isInteger(num)) {
    return null
  }
  
  if (min !== undefined && num < min) return null
  if (max !== undefined && num > max) return null
  
  return num
}

/**
 * Validate and sanitize decimal
 */
export function sanitizeDecimal(value: unknown, min?: number, max?: number, precision = 2): number | null {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  
  if (isNaN(num) || !isFinite(num)) {
    return null
  }
  
  if (min !== undefined && num < min) return null
  if (max !== undefined && num > max) return null
  
  return Number(num.toFixed(precision))
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length <= 100
}

/**
 * Remove null bytes and control characters
 */
export function removeControlChars(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Truncate string to max length safely
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
