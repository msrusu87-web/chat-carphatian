/**
 * Messages API
 * GET /api/messages?partnerId={id} - Get conversation with specific user
 * POST /api/messages - Send new message
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { messages, users } from '@/lib/db/schema'
import { eq, or, and, desc, asc, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const partnerId = searchParams.get('partnerId')

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 })
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get conversation messages
    const conversationMessages = await db.query.messages.findMany({
      where: or(
        and(
          eq(messages.sender_id, currentUser.id),
          eq(messages.recipient_id, parseInt(partnerId))
        ),
        and(
          eq(messages.sender_id, parseInt(partnerId)),
          eq(messages.recipient_id, currentUser.id)
        )
      ),
      with: {
        sender: {
          columns: {
            id: true,
            email: true,
            role: true,
          }
        },
        recipient: {
          columns: {
            id: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: [asc(messages.created_at)]
    })

    // Mark unread messages as read
    await db
      .update(messages)
      .set({ read_at: new Date() })
      .where(
        and(
          eq(messages.recipient_id, currentUser.id),
          eq(messages.sender_id, parseInt(partnerId)),
          sql`${messages.read_at} IS NULL`
        )
      )

    return NextResponse.json({ messages: conversationMessages })

  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId, content, attachmentUrl } = await req.json()

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Recipient ID and content required' },
        { status: 400 }
      )
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create message
    const [message] = await db
      .insert(messages)
      .values({
        sender_id: currentUser.id,
        recipient_id: recipientId,
        content,
        attachment_url: attachmentUrl || null,
      })
      .returning()

    // Fetch complete message with sender/recipient info
    const fullMessage = await db.query.messages.findFirst({
      where: eq(messages.id, message.id),
      with: {
        sender: {
          columns: {
            id: true,
            email: true,
            role: true,
          }
        },
        recipient: {
          columns: {
            id: true,
            email: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json({ message: fullMessage }, { status: 201 })

  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
