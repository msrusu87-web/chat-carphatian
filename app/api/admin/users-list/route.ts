/**
 * Admin Users List API
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get users with their profile names
    const usersData = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      email_verified: users.email_verified,
      created_at: users.created_at,
      name: profiles.full_name,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.user_id))
    .orderBy(users.created_at)

    return NextResponse.json({ users: usersData })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}
