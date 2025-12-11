/**
 * Freelancer Messages Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function FreelancerMessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-gray-400 mt-1">Communicate with clients</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className="border-r border-gray-700 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Conversations</h3>
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-gray-400 text-sm">No messages yet</p>
            </div>
          </div>

          {/* Message Area */}
          <div className="col-span-2 flex flex-col">
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">📨</span>
                <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                <p className="text-gray-400">Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
