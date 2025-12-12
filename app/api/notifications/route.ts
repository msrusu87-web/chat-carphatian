/**
 * Notifications API
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'

// Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const whereClause = unreadOnly
      ? and(eq(notifications.user_id, userId), eq(notifications.read, false))
      : eq(notifications.user_id, userId)

    const userNotifications = await db.select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.created_at))
      .limit(limit)

    // Get unread count
    const [unreadCount] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(notifications)
      .where(and(eq(notifications.user_id, userId), eq(notifications.read, false)))

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: unreadCount?.count || 0,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { id, markAllRead } = body

    if (markAllRead) {
      // Mark all as read
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.user_id, userId))
    } else if (id) {
      // Mark single notification as read
      await db.update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, id),
          eq(notifications.user_id, userId)
        ))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

// Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const deleteAll = searchParams.get('all') === 'true'

    if (deleteAll) {
      await db.delete(notifications)
        .where(eq(notifications.user_id, userId))
    } else if (id) {
      await db.delete(notifications)
        .where(and(
          eq(notifications.id, parseInt(id)),
          eq(notifications.user_id, userId)
        ))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
