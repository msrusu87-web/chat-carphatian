/**
 * Admin Users List API
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.created_at)],
      columns: {
        id: true,
        email: true,
        role: true,
        email_verified: true,
        created_at: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}
