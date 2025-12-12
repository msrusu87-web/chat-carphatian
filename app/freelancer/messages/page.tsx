/**
 * Freelancer Messages Page
 * Real-time messaging interface with automatic conversation initialization
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import MessagingInterface from '@/components/MessagingInterface'

export default async function FreelancerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = session.user as any

  // Verify user is a freelancer
  if (user.role !== 'freelancer') {
    redirect('/unauthorized')
  }

  const params = await searchParams
  let initialPartnerId: number | null = null
  let initialPartnerInfo = null

  // If client parameter provided, fetch client info
  if (params.client) {
    const clientId = parseInt(params.client)
    const clientUser = await db.query.users.findFirst({
      where: eq(users.id, clientId),
      columns: {
        id: true,
        email: true,
        role: true,
      }
    })

    if (clientUser) {
      initialPartnerId = clientUser.id
      initialPartnerInfo = {
        id: clientUser.id,
        email: clientUser.email,
        role: clientUser.role,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-400">
            Communicate with your clients in real-time
          </p>
        </div>

        <MessagingInterface
          userRole="freelancer"
          initialPartnerId={initialPartnerId}
          initialPartnerInfo={initialPartnerInfo}
        />
      </div>
    </div>
  )
}
