/**
 * Real-time Provider
 * 
 * Provides real-time connection context to the app.
 * Handles connection lifecycle and provides hooks.
 * 
 * Built by Carphatian
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { getPusherClient, disconnectPusher } from '@/lib/realtime/client'
import { useNotifications, useRealtimeConnection } from '@/lib/realtime/hooks'
import { Channels } from '@/lib/realtime/pusher'
import type { Channel } from 'pusher-js'

interface RealtimeContextType {
  isConnected: boolean
  isEnabled: boolean
  notifications: any[]
  unreadCount: number
  markAllRead: () => Promise<void>
  userChannel: Channel | null
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  isEnabled: false,
  notifications: [],
  unreadCount: 0,
  markAllRead: async () => {},
  userChannel: null,
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id
  const { isConnected, isEnabled } = useRealtimeConnection()
  const { notifications, unreadCount, markAllRead } = useNotifications(userId)
  const [userChannel, setUserChannel] = useState<Channel | null>(null)

  // Subscribe to user channel when authenticated
  useEffect(() => {
    if (!userId || !isEnabled) return

    const client = getPusherClient()
    if (!client) return

    const channelName = Channels.user(userId)
    const channel = client.subscribe(channelName)
    setUserChannel(channel)

    return () => {
      client.unsubscribe(channelName)
      setUserChannel(null)
    }
  }, [userId, isEnabled])

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      disconnectPusher()
    }
  }, [])

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        isEnabled,
        notifications,
        unreadCount,
        markAllRead,
        userChannel,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}
