/**
 * Drizzle Kit Configuration
 * 
 * Drizzle Kit is the CLI tool for managing database migrations.
 * It analyzes your schema and generates SQL migration files automatically.
 * 
 * Commands:
 * - `npx drizzle-kit generate` - Generate migration SQL from schema changes
 * - `npx drizzle-kit push` - Push schema directly to database (development)
 * - `npx drizzle-kit studio` - Launch Drizzle Studio (database GUI)
 * 
 * How Migration Works:
 * 1. You modify schema.ts (add table, column, index, etc.)
 * 2. Run `drizzle-kit generate` → Creates SQL file in lib/db/migrations/
 * 3. Run `drizzle-kit push` → Applies SQL to your database
 * 4. Commit migration files to git → Team members get same schema
 * 
 * Built by Carphatian
 */

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  /**
   * Database Dialect
   * Options: 'postgresql' | 'mysql' | 'sqlite'
   */
  dialect: 'postgresql',
  
  /**
   * Schema File Location
   * Points to where Drizzle tables are defined
   */
  schema: './lib/db/schema.ts',
  
  /**
   * Migration Files Directory
   * Where generated SQL files will be stored
   */
  out: './lib/db/migrations',
  
  /**
   * Database Connection
   * Uses same environment variables as our app
   */
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://carphatian:carphatian_dev_2024@localhost:5432/carphatian_marketplace',
  },
  
  /**
   * Verbose Logging
   * Shows detailed SQL statements during migration
   */
  verbose: true,
  
  /**
   * Strict Mode
   * Prevents accidental destructive operations
   */
  strict: true,
})
