/**
 * Authentication Utilities
 * 
 * Helper functions for auth operations:
 * - Password hashing and verification
 * - Session management
 * - User creation
 * - Role-based access
 * 
 * Built by Carphatian
 */

import 'server-only'

import { getServerSession, Session, DefaultSession } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { users, profiles } from './db/schema'
import { eq } from 'drizzle-orm'
import { authOptions } from './auth-options'

/**
 * Extend NextAuth types to include our custom fields
 */
declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: 'client' | 'freelancer' | 'admin'
    emailVerified: boolean
  }

  interface Session extends DefaultSession {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    emailVerified: boolean
  }
}

/**
 * Get the current authenticated session
 * 
 * This is a server-only function for use in Server Components, API routes, etc.
 * Use the `useSession` hook in Client Components instead.
 * 
 * @returns Current session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  return session as Session | null
}

/**
 * Get the current user from session
 * 
 * Throws error if user is not authenticated.
 * Use in protected routes.
 * 
 * @returns Current user
 * @throws Error if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error('Not authenticated')
  }

  return session.user
}

/**
 * Hash a password using bcryptjs
 * 
 * Uses 10 salt rounds (industry standard).
 * This is called during user registration.
 * 
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 * 
 * Used during login to check password.
 * 
 * @param password Plain text password from form
 * @param hash Stored password hash from database
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a new user account
 * 
 * Called during registration.
 * 1. Hash the password
 * 2. Create user record
 * 3. Create profile record
 * 4. Return user data
 * 
 * @param email User email
 * @param password Plain text password
 * @param role User role (client or freelancer)
 * @param fullName User's full name
 * @returns Created user
 * @throws Error if email already exists
 */
export async function createUser(
  email: string,
  password: string,
  role: 'client' | 'freelancer',
  fullName: string
) {
  // Check if user already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existing) {
    throw new Error('Email already registered')
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email,
      password_hash: passwordHash,
      role,
      email_verified: false,
    })
    .returning()

  // Create profile
  await db.insert(profiles).values({
    user_id: user.id,
    full_name: fullName,
  })

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}

/**
 * Check if user has required role
 * 
 * Used for role-based access control.
 * 
 * @param session User session
 * @param requiredRoles Role(s) that are allowed
 * @returns True if user has required role
 */
export function hasRole(
  session: Session | null,
  requiredRoles: string | string[]
): boolean {
  if (!session?.user) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(session.user.role)
}

/**
 * Auth error messages
 * 
 * User-friendly error messages for different auth failures
 */
export const authErrors = {
  INVALID_EMAIL: 'Email and password required',
  INVALID_PASSWORD: 'Invalid password',
  USER_NOT_FOUND: 'No user found with this email',
  EMAIL_EXISTS: 'Email already registered',
  NOT_AUTHENTICATED: 'You must be signed in',
  INVALID_ROLE: 'Invalid user role',
  SHORT_PASSWORD: 'Password must be at least 8 characters',
}
