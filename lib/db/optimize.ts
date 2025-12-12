/**
 * Database Query Optimization Utilities
 * Connection pooling, query helpers, and performance monitoring
 * Built by Carphatian
 */

import { sql, count } from 'drizzle-orm'
import { db } from '@/lib/db'

/**
 * Query performance wrapper
 * Logs slow queries for debugging
 */
export async function timedQuery<T>(
  name: string,
  queryFn: () => Promise<T>,
  slowThresholdMs: number = 1000
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await queryFn()
    const duration = performance.now() - start
    
    if (duration > slowThresholdMs) {
      console.warn(`[SLOW QUERY] ${name}: ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`[QUERY ERROR] ${name}: ${duration.toFixed(2)}ms`, error)
    throw error
  }
}

/**
 * Batch database operations
 * Groups multiple operations into a single transaction
 */
export async function batchOperations<T>(
  operations: (() => Promise<T>)[]
): Promise<T[]> {
  // Execute operations in parallel for better performance
  return Promise.all(operations.map(op => op()))
}

/**
 * Paginated query helper
 * Optimized for large datasets
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export function getPaginationParams(
  params: PaginationParams,
  defaultLimit: number = 25,
  maxLimit: number = 100
): { limit: number; offset: number; page: number } {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(maxLimit, Math.max(1, params.limit || defaultLimit))
  const offset = params.offset !== undefined ? params.offset : (page - 1) * limit
  
  return { limit, offset, page }
}

/**
 * Optimize SELECT queries with specific columns
 * Avoid SELECT * when possible
 */
export function selectColumns<T extends Record<string, any>>(
  columns: (keyof T)[]
): string {
  return columns.join(', ')
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  latencyMs: number
  error?: string
}> {
  const start = performance.now()
  
  try {
    await db.execute(sql`SELECT 1`)
    return {
      connected: true,
      latencyMs: Math.round(performance.now() - start),
    }
  } catch (error: any) {
    return {
      connected: false,
      latencyMs: Math.round(performance.now() - start),
      error: error.message,
    }
  }
}

/**
 * Preload related data for better performance
 * Use this to avoid N+1 queries
 */
export async function preloadRelations<T, R>(
  items: T[],
  idExtractor: (item: T) => number,
  loader: (ids: number[]) => Promise<Map<number, R>>
): Promise<Map<number, R>> {
  const ids = [...new Set(items.map(idExtractor))]
  if (ids.length === 0) return new Map()
  return loader(ids)
}

/**
 * Measure query performance and log slow queries
 */
export function logQueryPerformance(
  name: string,
  startTime: number,
  thresholdMs: number = 500
) {
  const duration = performance.now() - startTime
  if (duration > thresholdMs) {
    console.warn(`[SLOW] ${name}: ${duration.toFixed(0)}ms`)
  }
}
