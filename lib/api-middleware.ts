/**
 * API Middleware Utilities
 * 
 * Common utilities for API routes:
 * - Response helpers
 * - Error handling
 * - Pagination
 * - Performance monitoring
 * 
 * Built by Carphatian
 */

import { NextResponse } from 'next/server'

/**
 * Standard API Response
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
) {
  return NextResponse.json(data, {
    status,
    headers: {
      'X-Response-Time': `${Date.now()}`,
      ...headers,
    },
  })
}

/**
 * API Error Response
 */
export function apiError(
  message: string,
  status: number = 500,
  details?: any
) {
  console.error(`API Error [${status}]:`, message, details)
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Paginated Response Helper
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

/**
 * Parse pagination params from URL
 */
export function parsePaginationParams(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

/**
 * Measure execution time
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = Math.round(performance.now() - start)
  
  if (label && duration > 100) {
    console.log(`[Performance] ${label}: ${duration}ms`)
  }
  
  return { result, duration }
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error('Unhandled API error:', error)
      return apiError(
        error.message || 'Internal server error',
        error.status || 500
      )
    }
  }
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })
  return { valid: missing.length === 0, missing }
}
