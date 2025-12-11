/**
 * Freelancer Contracts Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { contracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function FreelancerContractsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  const myContracts = await db.query.contracts.findMany({
    where: eq(contracts.freelancer_id, userId),
    orderBy: (contracts, { desc }) => [desc(contracts.created_at)],
    with: { 
      job: true,
      client: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Contracts</h1>
        <p className="text-gray-400 mt-1">Manage your active contracts</p>
      </div>

      {myContracts.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <span className="text-6xl mb-4 block">📄</span>
          <h3 className="text-xl font-bold text-white mb-2">No Contracts Yet</h3>
          <p className="text-gray-400 mb-6">When clients hire you, your contracts will appear here</p>
          <Link
            href="/freelancer/jobs"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {myContracts.map((contract) => (
            <div key={contract.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{contract.job?.title}</h3>
                  <p className="text-gray-400 text-sm">Client: {contract.client?.email || 'Unknown'}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  contract.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  contract.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {contract.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-gray-400">💰 ${contract.total_amount}</span>
                <span className="text-gray-400">📅 {new Date(contract.created_at).toLocaleDateString()}</span>
              </div>
              {contract.status === 'active' && (
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
                  View Details
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
