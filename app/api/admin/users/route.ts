/**
 * Admin User Management API
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

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
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await db.delete(users).where(eq(users.id, userId))

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
    const { id, email, role, password } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (email) updateData.email = email
    if (role && ['admin', 'client', 'freelancer'].includes(role)) {
      updateData.role = role
    }
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
