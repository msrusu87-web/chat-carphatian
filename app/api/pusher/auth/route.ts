/**
 * Pusher Authentication Endpoint
 * 
 * Authenticates users for private and presence channels.
 * 
 * Security:
 * - Requires authentication
 * - Validates channel access
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { authenticateChannel, Channels } from '@/lib/realtime/pusher'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const formData = await req.formData()
    const socketId = formData.get('socket_id') as string
    const channel = formData.get('channel_name') as string

    if (!socketId || !channel) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 })
    }

    // Validate channel access
    const isAuthorized = await validateChannelAccess(channel, user)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Channel access denied' }, { status: 403 })
    }

    // Generate auth response
    const authResponse = authenticateChannel(
      socketId,
      channel,
      user.id.toString(),
      {
        name: user.name || 'Anonymous',
        email: user.email,
        image: user.image,
        role: user.role,
      }
    )

    if (!authResponse) {
      return NextResponse.json({ error: 'Pusher not configured' }, { status: 500 })
    }

    return new NextResponse(authResponse, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Pusher auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

/**
 * Validate if user can access the channel
 */
async function validateChannelAccess(channel: string, user: any): Promise<boolean> {
  // User's own channel - always allowed
  if (channel === Channels.user(user.id)) {
    return true
  }

  // Private conversation channel - check if user is participant
  if (channel.startsWith('private-conversation-')) {
    const conversationId = channel.replace('private-conversation-', '')
    // TODO: Check if user is participant in conversation
    return true // For now, allow all authenticated users
  }

  // Private job channel - check if user is client or applicant
  if (channel.startsWith('private-job-')) {
    return true // For now, allow all authenticated users
  }

  // Private contract channel - check if user is party to contract
  if (channel.startsWith('private-contract-')) {
    return true // For now, allow all authenticated users
  }

  // Presence channels - allow authenticated users
  if (channel.startsWith('presence-')) {
    return true
  }

  // Public channel - allow all
  if (channel === 'public-announcements') {
    return true
  }

  return false
}
