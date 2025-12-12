/**
 * Rate Limiting Configuration
 * Using Upstash Redis for distributed rate limiting
 * Built by Carphatian
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// Initialize Redis client (lazy initialization)
let redis: Redis | null = null

function getRedisClient(): Redis | null {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

// Rate limit configurations for different endpoints
export const rateLimiters = {
  // General API rate limit: 100 requests per minute
  api: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  },

  // Auth endpoints: 10 attempts per minute (prevent brute force)
  auth: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  },

  // AI endpoints: 20 requests per minute (expensive operations)
  ai: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: 'ratelimit:ai',
    })
  },

  // File uploads: 30 per hour
  upload: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      analytics: true,
      prefix: 'ratelimit:upload',
    })
  },

  // Email sending: 50 per hour
  email: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(50, '1 h'),
      analytics: true,
      prefix: 'ratelimit:email',
    })
  },

  // Search: 60 per minute
  search: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'ratelimit:search',
    })
  },

  // Strict limit for sensitive operations: 5 per minute
  strict: () => {
    const client = getRedisClient()
    if (!client) return null
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:strict',
    })
  },
}

export type RateLimiterType = keyof typeof rateLimiters

/**
 * Get client identifier (user ID or IP)
 */
export async function getClientIdentifier(request: NextRequest): Promise<string> {
  // Try to get user ID from session
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      return `user:${session.user.id}`
    }
  } catch {
    // Session retrieval failed, fall back to IP
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown'
  return `ip:${ip}`
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimiterType = 'api'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[type]()
  
  if (!limiter) {
    // No Redis configured, allow all requests
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  const identifier = await getClientIdentifier(request)
  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  type: RateLimiterType = 'api'
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, type)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null // Continue with request
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function rateLimited(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  type: RateLimiterType = 'api'
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const rateLimitResponse = await withRateLimit(req, type)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const response = await handler(req, context)

    // Add rate limit headers to successful responses
    const result = await checkRateLimit(req, type)
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toString())

    return response
  }
}
