/**
 * Client Messages Page
 * Real-time messaging interface for client-freelancer communication
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import MessagingInterface from '@/components/MessagingInterface'

export default async function ClientMessagesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = session.user as any

  // Verify user is a client
  if (user.role !== 'client') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-400">
            Communicate with your freelancers in real-time
          </p>
        </div>

        <MessagingInterface userRole="client" />
      </div>
    </div>
  )
}
