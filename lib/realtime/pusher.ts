/**
 * Pusher Real-time Configuration
 * 
 * Server-side Pusher client for triggering events.
 * Falls back to polling if Pusher is not configured.
 * 
 * Built by Carphatian
 */

import Pusher from 'pusher'

// Server-side Pusher client
let pusherServer: Pusher | null = null

if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
) {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  })
}

/**
 * Check if real-time is available
 */
export function isRealtimeEnabled(): boolean {
  return pusherServer !== null
}

/**
 * Channel naming conventions
 */
export const Channels = {
  // Private user channel - for notifications, messages
  user: (userId: number | string) => `private-user-${userId}`,
  
  // Conversation channel - for chat messages
  conversation: (conversationId: number | string) => `private-conversation-${conversationId}`,
  
  // Job channel - for job updates
  job: (jobId: number | string) => `private-job-${jobId}`,
  
  // Contract channel - for contract updates
  contract: (contractId: number | string) => `private-contract-${contractId}`,
  
  // Presence channel - for online status
  presence: (roomId: string) => `presence-${roomId}`,
  
  // Public channel - for platform-wide announcements
  public: () => 'public-announcements',
}

/**
 * Event types
 */
export const Events = {
  // Message events
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  
  // Notification events
  NEW_NOTIFICATION: 'new-notification',
  NOTIFICATION_READ: 'notification-read',
  
  // Application events
  NEW_APPLICATION: 'new-application',
  APPLICATION_STATUS: 'application-status',
  
  // Contract events
  CONTRACT_UPDATE: 'contract-update',
  MILESTONE_COMPLETE: 'milestone-complete',
  PAYMENT_RECEIVED: 'payment-received',
  
  // Job events
  JOB_UPDATE: 'job-update',
  NEW_PROPOSAL: 'new-proposal',
  
  // User events
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
}

/**
 * Trigger an event on a channel
 */
export async function trigger(
  channel: string,
  event: string,
  data: any
): Promise<boolean> {
  if (!pusherServer) {
    console.log(`[Realtime] Event skipped (not configured): ${channel}/${event}`)
    return false
  }

  try {
    await pusherServer.trigger(channel, event, data)
    return true
  } catch (error) {
    console.error('[Realtime] Trigger error:', error)
    return false
  }
}

/**
 * Trigger events on multiple channels
 */
export async function triggerBatch(
  events: { channel: string; event: string; data: any }[]
): Promise<boolean> {
  if (!pusherServer) {
    return false
  }

  try {
    await pusherServer.triggerBatch(events.map(e => ({
      channel: e.channel,
      name: e.event,
      data: e.data,
    })))
    return true
  } catch (error) {
    console.error('[Realtime] Batch trigger error:', error)
    return false
  }
}

/**
 * Authenticate a user for a private/presence channel
 */
export function authenticateChannel(
  socketId: string,
  channel: string,
  userId: string,
  userInfo?: Record<string, any>
): string | null {
  if (!pusherServer) {
    return null
  }

  try {
    // For presence channels, include user info
    if (channel.startsWith('presence-')) {
      const presenceData = {
        user_id: userId,
        user_info: userInfo || {},
      }
      return JSON.stringify(pusherServer.authorizeChannel(socketId, channel, presenceData))
    }

    // For private channels
    return JSON.stringify(pusherServer.authorizeChannel(socketId, channel))
  } catch (error) {
    console.error('[Realtime] Auth error:', error)
    return null
  }
}

// Export the server instance for advanced usage
export { pusherServer }
