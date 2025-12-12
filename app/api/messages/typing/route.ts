/**
 * Typing Indicator API
 * 
 * Broadcasts typing status to conversation participants.
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { trigger, Channels, Events } from '@/lib/realtime/pusher'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const { conversationId, isTyping } = await req.json()

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    // Trigger typing event
    const event = isTyping ? Events.TYPING_START : Events.TYPING_STOP
    await trigger(Channels.conversation(conversationId), event, {
      userId: user.id,
      name: user.name || 'Someone',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Typing indicator error:', error)
    return NextResponse.json({ error: 'Failed to send typing indicator' }, { status: 500 })
  }
}
