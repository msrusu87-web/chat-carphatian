/**
 * Pusher Authentication Endpoint
 * 
 * Authenticates users for private and presence channels.
 * 
 * Security:
 * - Requires authentication
 * - Validates channel access based on relationships
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { authenticateChannel, Channels } from '@/lib/realtime/pusher'
import { db } from '@/lib/db'
import { messages, contracts, jobs, applications } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'

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
  const userId = parseInt(user.id)

  // User's own channel - always allowed
  if (channel === Channels.user(userId)) {
    return true
  }

  // Private conversation channel - check if user is participant
  if (channel.startsWith('private-conversation-')) {
    const otherUserId = parseInt(channel.replace('private-conversation-', ''))
    
    if (isNaN(otherUserId)) return false

    // Check if there are any messages between these users
    const hasConversation = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.sender_id, userId), eq(messages.recipient_id, otherUserId)),
          and(eq(messages.sender_id, otherUserId), eq(messages.recipient_id, userId))
        )
      )
      .limit(1)

    return hasConversation.length > 0
  }

  // Private job channel - check if user is client or has applied
  if (channel.startsWith('private-job-')) {
    const jobId = parseInt(channel.replace('private-job-', ''))
    
    if (isNaN(jobId)) return false

    // Check if user is the job client
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1)

    if (job?.client_id === userId) return true

    // Check if user has applied to this job
    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.job_id, jobId),
          eq(applications.freelancer_id, userId)
        )
      )
      .limit(1)

    return !!application
  }

  // Private contract channel - check if user is party to contract
  if (channel.startsWith('private-contract-')) {
    const contractId = parseInt(channel.replace('private-contract-', ''))
    
    if (isNaN(contractId)) return false

    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1)

    // User must be either the client or freelancer
    return contract?.client_id === userId || contract?.freelancer_id === userId
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
