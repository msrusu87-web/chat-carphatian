/**
 * Client Messages Page
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

export default async function ClientMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ freelancer?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = session.user as any

  // Verify user is a client
  if (user.role !== 'client') {
    redirect('/unauthorized')
  }

  const params = await searchParams
  let initialPartnerId: number | null = null
  let initialPartnerInfo = null

  // If freelancer parameter provided, fetch freelancer info
  if (params.freelancer) {
    const freelancerId = parseInt(params.freelancer)
    const freelancerUser = await db.query.users.findFirst({
      where: eq(users.id, freelancerId),
      columns: {
        id: true,
        email: true,
        role: true,
      }
    })

    if (freelancerUser) {
      initialPartnerId = freelancerUser.id
      initialPartnerInfo = {
        id: freelancerUser.id,
        email: freelancerUser.email,
        role: freelancerUser.role,
      }
    }
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

        <MessagingInterface
          userRole="client"
          initialPartnerId={initialPartnerId}
          initialPartnerInfo={initialPartnerInfo}
        />
      </div>
    </div>
  )
}
