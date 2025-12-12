/**
 * Pusher Client Configuration
 * 
 * Client-side Pusher for subscribing to real-time events.
 * Use this in React components.
 * 
 * Built by Carphatian
 */

'use client'

import PusherClient from 'pusher-js'

// Singleton Pusher client
let pusherClient: PusherClient | null = null

/**
 * Get or create Pusher client instance
 */
export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (pusherClient) {
    return pusherClient
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!key || !cluster) {
    console.log('[Realtime] Pusher not configured, using polling')
    return null
  }

  pusherClient = new PusherClient(key, {
    cluster,
    authEndpoint: '/api/pusher/auth',
    authTransport: 'ajax',
    auth: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })

  // Connection event handlers
  pusherClient.connection.bind('connected', () => {
    console.log('[Realtime] Connected')
  })

  pusherClient.connection.bind('disconnected', () => {
    console.log('[Realtime] Disconnected')
  })

  pusherClient.connection.bind('error', (error: any) => {
    console.error('[Realtime] Connection error:', error)
  })

  return pusherClient
}

/**
 * Disconnect Pusher client
 */
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect()
    pusherClient = null
  }
}

/**
 * Subscribe to a channel
 */
export function subscribeToChannel(channelName: string) {
  const client = getPusherClient()
  if (!client) return null

  return client.subscribe(channelName)
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribeFromChannel(channelName: string): void {
  const client = getPusherClient()
  if (client) {
    client.unsubscribe(channelName)
  }
}

// Re-export Events for convenience
export { Events, Channels } from './pusher'
