/**
 * Signup API Endpoint
 * 
 * POST /api/auth/signup
 * 
 * Creates a new user account with:
 * - Email and password
 * - User role (client or freelancer)
 * - User profile with full name
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   fullName: string,
 *   role: 'client' | 'freelancer'
 * }
 * 
 * Response:
 * {
 *   id: number,
 *   email: string,
 *   role: string
 * }
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { createUser, authErrors } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    // Validate inputs
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: authErrors.SHORT_PASSWORD },
        { status: 400 }
      )
    }

    if (!['client', 'freelancer'].includes(role)) {
      return NextResponse.json(
        { error: authErrors.INVALID_ROLE },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(email, password, role, fullName)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Email already registered')) {
        return NextResponse.json(
          { error: authErrors.EMAIL_EXISTS },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
}
