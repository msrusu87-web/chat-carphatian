/**
 * Conversations API
 * GET /api/conversations - List all conversations for current user
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { messages, users } from '@/lib/db/schema'
import { eq, or, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all messages for current user
    const allMessages = await db.query.messages.findMany({
      where: or(
        eq(messages.sender_id, currentUser.id),
        eq(messages.recipient_id, currentUser.id)
      ),
      with: {
        sender: {
          columns: { id: true, email: true, role: true }
        },
        recipient: {
          columns: { id: true, email: true, role: true }
        }
      },
      orderBy: [desc(messages.created_at)]
    })

    // Group by conversation partner
    const conversationMap = new Map<number, any>()
    
    for (const msg of allMessages) {
      const partnerId = msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id
      const partner = msg.sender_id === currentUser.id ? msg.recipient : msg.sender
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerEmail: partner.email,
          partnerRole: partner.role,
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 0
        })
      }
      
      // Count unread messages
      if (msg.recipient_id === currentUser.id && !msg.read_at) {
        conversationMap.get(partnerId)!.unreadCount++
      }
    }

    const conversations = Array.from(conversationMap.values())

    return NextResponse.json({ conversations })

  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
