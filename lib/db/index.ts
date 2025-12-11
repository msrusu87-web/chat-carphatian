/**
 * Database Connection Configuration
 * 
 * This file sets up the connection to our PostgreSQL database.
 * We use 'postgres' package (official PostgreSQL driver) with Drizzle ORM.
 * 
 * Built by Carphatian
 */

// Load environment variables (for non-Next.js contexts like seed scripts)
if (typeof window === 'undefined' && !process.env.DATABASE_URL && !process.env.POSTGRES_USER) {
  try {
    const { config } = require('dotenv');
    const { resolve } = require('path');
    config({ path: resolve(process.cwd(), '.env.local') });
  } catch (e) {
    // dotenv might not be available in production
  }
}

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * PostgreSQL Connection String
 * 
 * Format: postgres://user:password@host:port/database
 * 
 * Uses DATABASE_URL from environment if available,
 * otherwise falls back to individual POSTGRES_* variables
 */
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`

if (!connectionString || connectionString.includes('undefined')) {
  throw new Error('Database connection string is not configured. Set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB')
}

/**
 * Create PostgreSQL Client
 * 
 * Connection Pool Configuration:
 * - max: Maximum number of connections (default: 10)
 * - idle_timeout: Close connections idle for 20s
 * - connect_timeout: Fail if connection takes > 10s
 * 
 * In Production:
 * - Increase max to 20-50 based on traffic
 * - Monitor connection usage with pg_stat_activity
 * - Use connection pooling service (PgBouncer) for high traffic
 */
const client = postgres(connectionString, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout after 10 seconds if can't connect
})

/**
 * Drizzle Database Instance
 * 
 * This is the main object you'll use for all database operations.
 * It provides type-safe queries, automatic SQL generation, and migrations.
 * 
 * Usage Examples:
 * 
 * 1. Insert a user:
 * ```ts
 * import { db } from '@/lib/db'
 * import { users } from '@/lib/db/schema'
 * 
 * await db.insert(users).values({
 *   email: 'user@example.com',
 *   password_hash: hashedPassword,
 *   role: 'client'
 * })
 * ```
 * 
 * 2. Query with relations:
 * ```ts
 * const jobsWithApplications = await db.query.jobs.findMany({
 *   with: {
 *     applications: true,
 *     client: {
 *       with: {
 *         profile: true
 *       }
 *     }
 *   }
 * })
 * ```
 * 
 * 3. Complex filtering:
 * ```ts
 * import { eq, and, gte } from 'drizzle-orm'
 * 
 * const activeJobs = await db.select()
 *   .from(jobs)
 *   .where(
 *     and(
 *       eq(jobs.status, 'open'),
 *       gte(jobs.budget_min, 1000)
 *     )
 *   )
 * ```
 */
export const db = drizzle(client, { schema })

/**
 * Export schema for direct access
 * Useful when you need to reference tables or types
 */
export { schema }
