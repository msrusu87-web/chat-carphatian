/**
 * Messaging Interface Component
 * Real-time chat interface with conversation list and message thread
 * Built by Carphatian
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: number
  sender_id: number
  recipient_id: number
  content: string
  attachment_url?: string | null
  read_at: string | null
  created_at: string
  sender: {
    id: number
    email: string
    role: string
  }
  recipient: {
    id: number
    email: string
    role: string
  }
}

interface Conversation {
  partnerId: number
  partnerEmail: string
  partnerRole: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface MessagingInterfaceProps {
  userRole: 'client' | 'freelancer'
}

export default function MessagingInterface({ userRole }: MessagingInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch messages when partner selected
  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner)
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedPartner)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [selectedPartner])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (partnerId: number) => {
    try {
      const res = await fetch(`/api/messages?partnerId=${partnerId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedPartner || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedPartner,
          content: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        fetchConversations() // Refresh conversation list
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="col-span-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Conversations</h2>
        
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No conversations yet</p>
            <p className="text-sm text-gray-500">
              Start working with {userRole === 'client' ? 'freelancers' : 'clients'} to begin messaging
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.partnerId}
                onClick={() => setSelectedPartner(conv.partnerId)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  selectedPartner === conv.partnerId
                    ? 'bg-purple-600'
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-white">{conv.partnerEmail}</h3>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 capitalize mb-1">{conv.partnerRole}</p>
                <p className="text-sm text-gray-300 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Thread */}
      <div className="col-span-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg flex flex-col">
        {selectedPartner ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {conversations.find(c => c.partnerId === selectedPartner)?.partnerEmail}
              </h2>
              <p className="text-sm text-gray-400 capitalize">
                {conversations.find(c => c.partnerId === selectedPartner)?.partnerRole}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isSender = msg.sender.role === userRole
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isSender
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{msg.sender.email}</p>
                      <p>{msg.content}</p>
                      {msg.attachment_url && (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline mt-2 block"
                        >
                          📎 Attachment
                        </a>
                      )}
                      <p className="text-xs mt-2 opacity-75">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Select a conversation to start messaging</p>
              <p className="text-sm text-gray-500">
                Choose from the list on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
