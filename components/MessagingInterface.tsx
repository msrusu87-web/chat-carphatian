/**
 * Messaging Interface Component
 * Real-time chat interface with file attachments
 * Built by Carphatian
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import FileViewer from './FileViewer'

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

interface PartnerInfo {
  id: number
  email: string
  role: string
}

interface MessagingInterfaceProps {
  userRole: 'client' | 'freelancer'
  initialPartnerId?: number | null
  initialPartnerInfo?: PartnerInfo | null
}

export default function MessagingInterface({
  userRole,
  initialPartnerId,
  initialPartnerInfo
}: MessagingInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPartner, setSelectedPartner] = useState<number | null>(initialPartnerId || null)
  const [selectedPartnerInfo, setSelectedPartnerInfo] = useState<PartnerInfo | null>(initialPartnerInfo || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [viewingFile, setViewingFile] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // If initial partner provided but not in conversations, add them
  useEffect(() => {
    if (initialPartnerInfo && conversations.length > 0) {
      const existsInConversations = conversations.some(c => c.partnerId === initialPartnerInfo.id)
      if (!existsInConversations) {
        // Add as a new conversation entry (will show in list)
        const newConv: Conversation = {
          partnerId: initialPartnerInfo.id,
          partnerEmail: initialPartnerInfo.email,
          partnerRole: initialPartnerInfo.role,
          lastMessage: 'Start a new conversation',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        }
        setConversations(prev => [newConv, ...prev])
      }
    }
  }, [conversations, initialPartnerInfo])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return []

    setUploading(true)
    try {
      const uploadedUrls: string[] = []

      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('entity_type', 'message')
        formData.append('entity_id', selectedPartner?.toString() || '0')

        const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
        }
      }

      return uploadedUrls
    } catch (error) {
      console.error('File upload failed:', error)
      return []
    } finally {
      setUploading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedPartner || sending) return

    setSending(true)
    try {
      // Upload files first if any
      const attachmentUrls = await uploadFiles()

      // Send message with or without attachments
      const messageContent = newMessage.trim() || (selectedFiles.length > 0 ? '📎 Sent attachments' : '')

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedPartner,
          content: messageContent,
          attachmentUrl: attachmentUrls.length > 0 ? attachmentUrls[0] : null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        setSelectedFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        fetchConversations() // Refresh conversation list
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const viewAttachment = (attachmentUrl: string, filename?: string) => {
    // Create a file object for the viewer
    setViewingFile({
      id: Date.now(),
      filename: filename || attachmentUrl.split('/').pop() || 'file',
      url: attachmentUrl,
      mime_type: getMimeType(attachmentUrl),
      size: 0,
      uploaded_at: new Date(),
    })
  }

  const getMimeType = (url: string): string => {
    const ext = url.split('.').pop()?.toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      'zip': 'application/zip',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSelectPartner = (partnerId: number) => {
    setSelectedPartner(partnerId)
    const conv = conversations.find(c => c.partnerId === partnerId)
    if (conv) {
      setSelectedPartnerInfo({
        id: conv.partnerId,
        email: conv.partnerEmail,
        role: conv.partnerRole,
      })
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
                onClick={() => handleSelectPartner(conv.partnerId)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${selectedPartner === conv.partnerId
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
        {selectedPartner && selectedPartnerInfo ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {selectedPartnerInfo.email}
              </h2>
              <p className="text-sm text-gray-400 capitalize">
                {selectedPartnerInfo.role}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-400 mb-2">No messages yet</p>
                    <p className="text-sm text-gray-500">
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSender = msg.sender.role === userRole
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${isSender
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                          }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.sender.email}</p>
                        <p>{msg.content}</p>
                        {msg.attachment_url && (
                          <div className="mt-2 space-y-1">
                            <button
                              onClick={() => viewAttachment(msg.attachment_url!, msg.attachment_url!.split('/').pop())}
                              className="flex items-center gap-2 text-xs bg-black/20 hover:bg-black/30 px-3 py-2 rounded transition-colors w-full"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {msg.attachment_url.split('/').pop()?.substring(0, 30) || 'Attachment'}
                            </button>
                            <div className="flex gap-2">
                              <a
                                href={msg.attachment_url}
                                download
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                ⬇ Download
                              </a>
                              <button
                                onClick={() => viewAttachment(msg.attachment_url!)}
                                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                              >
                                👁 View
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="text-xs mt-2 opacity-75">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-300 font-medium">Selected Files ({selectedFiles.length})</p>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="ml-2 text-red-400 hover:text-red-300 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="message-file-input"
                />
                <label
                  htmlFor="message-file-input"
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="hidden sm:inline">Attach</span>
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={sending || uploading}
                />
                <button
                  type="submit"
                  disabled={sending || uploading || (!newMessage.trim() && selectedFiles.length === 0)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-400 mb-2">Select a conversation to start messaging</p>
              <p className="text-sm text-gray-500">
                Choose from the list on the left
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  )
}
