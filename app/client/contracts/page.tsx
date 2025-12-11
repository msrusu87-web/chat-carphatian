/**
 * Client Contracts Page - Enhanced with Chat & Deliverables View
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { contracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import ClientContractCard from './ClientContractCard'

export default async function ClientContractsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  const myContracts = await db.query.contracts.findMany({
    where: eq(contracts.client_id, userId),
    orderBy: (contracts, { desc }) => [desc(contracts.created_at)],
    with: { 
      job: true,
      freelancer: true,
      milestones: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Contracts</h1>
        <p className="text-gray-400 mt-1">Manage contracts with freelancers</p>
      </div>

      {myContracts.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <span className="text-6xl mb-4 block">📄</span>
          <h3 className="text-xl font-bold text-white mb-2">No Contracts Yet</h3>
          <p className="text-gray-400 mb-6">When you hire freelancers, contracts will appear here</p>
          <Link
            href="/client/jobs"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            View My Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {myContracts.map((contract) => (
            <ClientContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  )
}
