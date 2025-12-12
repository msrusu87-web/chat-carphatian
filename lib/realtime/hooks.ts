/**
 * Real-time React Hooks
 * 
 * Hooks for subscribing to real-time events in React components.
 * 
 * Built by Carphatian
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getPusherClient, subscribeToChannel, unsubscribeFromChannel } from './client'
import { Channels, Events } from './pusher'
import type { Channel } from 'pusher-js'

/**
 * Hook to subscribe to a channel and listen for events
 */
export function useChannel(channelName: string | null) {
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    if (!channelName) return

    const ch = subscribeToChannel(channelName)
    setChannel(ch)

    return () => {
      if (channelName) {
        unsubscribeFromChannel(channelName)
      }
    }
  }, [channelName])

  return channel
}

/**
 * Hook to listen for specific events on a channel
 */
export function useEvent<T = any>(
  channel: Channel | null,
  eventName: string,
  callback: (data: T) => void
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!channel) return

    const handler = (data: T) => {
      callbackRef.current(data)
    }

    channel.bind(eventName, handler)

    return () => {
      channel.unbind(eventName, handler)
    }
  }, [channel, eventName])
}

/**
 * Hook for real-time notifications
 */
export function useNotifications(userId: number | string | null) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const channelName = userId ? Channels.user(userId) : null
  const channel = useChannel(channelName)

  useEvent(channel, Events.NEW_NOTIFICATION, (data: any) => {
    setNotifications(prev => [data, ...prev])
    setUnreadCount(prev => prev + 1)
  })

  useEvent(channel, Events.NOTIFICATION_READ, () => {
    setUnreadCount(0)
  })

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }, [])

  return { notifications, unreadCount, markAllRead }
}

/**
 * Hook for real-time messages in a conversation
 */
export function useConversationMessages(conversationId: number | string | null) {
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState<{ userId: string; name: string } | null>(null)

  const channelName = conversationId ? Channels.conversation(conversationId) : null
  const channel = useChannel(channelName)

  // Listen for new messages
  useEvent(channel, Events.NEW_MESSAGE, (data: any) => {
    setMessages(prev => [...prev, data])
  })

  // Listen for typing indicators
  useEvent(channel, Events.TYPING_START, (data: { userId: string; name: string }) => {
    setIsTyping(data)
  })

  useEvent(channel, Events.TYPING_STOP, () => {
    setIsTyping(null)
  })

  // Listen for read receipts
  useEvent(channel, Events.MESSAGE_READ, (data: { messageId: string }) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === data.messageId ? { ...msg, read: true } : msg
      )
    )
  })

  // Send typing indicator
  const sendTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId) return

    try {
      await fetch('/api/messages/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, isTyping }),
      })
    } catch (error) {
      // Ignore typing indicator errors
    }
  }, [conversationId])

  return { messages, setMessages, isTyping, sendTyping }
}

/**
 * Hook for presence - who's online
 */
export function usePresence(roomId: string | null) {
  const [members, setMembers] = useState<Map<string, any>>(new Map())
  const [me, setMe] = useState<any>(null)

  const channelName = roomId ? Channels.presence(roomId) : null
  const channel = useChannel(channelName)

  useEffect(() => {
    if (!channel) return

    // Handle subscription succeeded
    channel.bind('pusher:subscription_succeeded', (data: any) => {
      const memberMap = new Map()
      data.each((member: any) => {
        memberMap.set(member.id, member.info)
      })
      setMembers(memberMap)
      setMe(data.me)
    })

    // Handle member added
    channel.bind('pusher:member_added', (member: any) => {
      setMembers(prev => new Map(prev).set(member.id, member.info))
    })

    // Handle member removed
    channel.bind('pusher:member_removed', (member: any) => {
      setMembers(prev => {
        const newMap = new Map(prev)
        newMap.delete(member.id)
        return newMap
      })
    })

    return () => {
      channel.unbind_all()
    }
  }, [channel])

  return { members, me, isOnline: (userId: string) => members.has(userId) }
}

/**
 * Hook for connection status
 */
export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const client = getPusherClient()
    setIsEnabled(!!client)

    if (!client) return

    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)

    client.connection.bind('connected', handleConnected)
    client.connection.bind('disconnected', handleDisconnected)

    // Check initial state
    if (client.connection.state === 'connected') {
      setIsConnected(true)
    }

    return () => {
      client.connection.unbind('connected', handleConnected)
      client.connection.unbind('disconnected', handleDisconnected)
    }
  }, [])

  return { isConnected, isEnabled }
}
