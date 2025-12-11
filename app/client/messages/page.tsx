/**
 * Client Messages Page
 * Message center for client-freelancer communication
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { messages, users, contracts } from '@/lib/db/schema'
import { eq, or, desc, and, ne, sql } from 'drizzle-orm'
import Link from 'next/link'

export default async function ClientMessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  // Get conversations (unique sender/receiver pairs)
  const allMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      sender_id: messages.sender_id,
      recipient_id: messages.recipient_id,
      read_at: messages.read_at,
      created_at: messages.created_at,
    })
    .from(messages)
    .where(
      or(
        eq(messages.sender_id, userId),
        eq(messages.recipient_id, userId)
      )
    )
    .orderBy(desc(messages.created_at))

  // Group messages by conversation partner
  const conversationMap = new Map<number, {
    partnerId: number
    lastMessage: typeof allMessages[0]
    unreadCount: number
  }>()

  for (const msg of allMessages) {
    const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
    
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        lastMessage: msg,
        unreadCount: 0,
      })
    }
    
    if (msg.recipient_id === userId && !msg.read_at) {
      const conv = conversationMap.get(partnerId)!
      conv.unreadCount++
    }
  }

  // Get partner details
  const conversations = await Promise.all(
    Array.from(conversationMap.values()).map(async (conv) => {
      const partner = await db.query.users.findFirst({
        where: eq(users.id, conv.partnerId),
        columns: {
          id: true,
          email: true,
          role: true,
        },
      })
      
      return {
        ...conv,
        partner,
      }
    })
  )

  // Sort by last message date
  conversations.sort((a, b) => 
    new Date(b.lastMessage.created_at!).getTime() - new Date(a.lastMessage.created_at!).getTime()
  )

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/client" className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-gray-400 mt-1">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-4xl mx-auto">
        {conversations.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Messages Yet</h2>
            <p className="text-gray-400 mb-6">
              When you start working with freelancers, your conversations will appear here
            </p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
            {conversations.map((conv, idx) => (
              <Link
                key={conv.partnerId}
                href={`/client/messages/${conv.partnerId}`}
                className={`block p-4 hover:bg-gray-700/30 transition-colors ${
                  idx !== conversations.length - 1 ? 'border-b border-gray-700/50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conv.partner?.email?.charAt(0) || '?'}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${conv.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>
                        {conv.partner?.email || 'Unknown User'}
                      </h3>
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(conv.lastMessage.created_at!)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage.sender_id === userId && (
                        <span className="text-gray-500">You: </span>
                      )}
                      {conv.lastMessage.content}
                    </p>
                    <span className="text-xs text-purple-400 capitalize">{conv.partner?.role}</span>
                  </div>
                  
                  <div className="text-gray-500">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
