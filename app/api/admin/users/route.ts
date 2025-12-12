/**
 * Admin User Management API
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, role, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const validRole = ['admin', 'client', 'freelancer'].includes(role) ? role : 'client'

    const [newUser] = await db.insert(users).values({
      email,
      role: validRole,
      password_hash: passwordHash,
      email_verified: true, // Admin-created users are auto-verified
    }).returning({ id: users.id })

    // Create profile with name if provided
    if (name && newUser) {
      await db.insert(profiles).values({
        user_id: newUser.id,
        full_name: name,
      })
    }

    return NextResponse.json({ success: true, userId: newUser.id })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Prevent deleting yourself
    if (userId === String((session.user as any).id)) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete profile first (foreign key)
    await db.delete(profiles).where(eq(profiles.user_id, parseInt(userId)))
    // Then delete user
    await db.delete(users).where(eq(users.id, parseInt(userId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, email, name, role, password } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Update user table fields
    const updateData: any = {}
    
    if (email) updateData.email = email
    if (role && ['admin', 'client', 'freelancer'].includes(role)) {
      updateData.role = role
    }
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, parseInt(id)))
    }

    // Update profile name if provided
    if (name !== undefined) {
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.user_id, parseInt(id)),
      })

      if (existingProfile) {
        await db.update(profiles)
          .set({ full_name: name || null })
          .where(eq(profiles.user_id, parseInt(id)))
      } else if (name) {
        await db.insert(profiles).values({
          user_id: parseInt(id),
          full_name: name,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
