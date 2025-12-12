/**
 * Caching Utilities
 * Redis-based caching with fallback to in-memory cache
 * Built by Carphatian
 */

import { Redis } from '@upstash/redis'

// Redis client (optional - falls back to memory cache if not configured)
let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.warn('Redis not configured, using in-memory cache')
}

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expires: number }>()

// Cache TTL presets (in seconds)
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get(key)
      return value as T | null
    }

    // Memory cache fallback
    const cached = memoryCache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.value as T
    }
    memoryCache.delete(key)
    return null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * Set value in cache
 */
export async function cacheSet(key: string, value: any, ttlSeconds: number = CacheTTL.MEDIUM): Promise<void> {
  try {
    if (redis) {
      await redis.set(key, value, { ex: ttlSeconds })
      return
    }

    // Memory cache fallback
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key)
      return
    }
    memoryCache.delete(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return
    }

    // Memory cache pattern matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
      }
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error)
  }
}

/**
 * Cache wrapper - Automatically caches the result of a function
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cachedValue = await cacheGet<T>(key)
  if (cachedValue !== null) {
    return cachedValue
  }

  // Execute function and cache result
  const result = await fn()
  await cacheSet(key, result, ttlSeconds)
  return result
}

/**
 * Generate cache key from parts
 */
export function cacheKey(...parts: (string | number)[]): string {
  return `carphatian:${parts.join(':')}`
}

// Cache key prefixes for different entities
export const CacheKeys = {
  user: (id: number | string) => cacheKey('user', id),
  profile: (userId: number | string) => cacheKey('profile', userId),
  job: (id: number | string) => cacheKey('job', id),
  jobs: (status: string) => cacheKey('jobs', status),
  contract: (id: number | string) => cacheKey('contract', id),
  reviews: (userId: number | string) => cacheKey('reviews', userId),
  notifications: (userId: number | string) => cacheKey('notifications', userId),
  analytics: (period: number | string) => cacheKey('analytics', period),
  freelancers: (page: number | string) => cacheKey('freelancers', page),
  search: (type: string, query: string) => cacheKey('search', type, query),
}

// Cleanup memory cache periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, { expires }] of memoryCache.entries()) {
      if (expires < now) {
        memoryCache.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
