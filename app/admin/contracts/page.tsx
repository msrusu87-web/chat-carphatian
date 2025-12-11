/**
 * Admin Contracts Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function AdminContractsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  const allContracts = await db.query.contracts.findMany({
    orderBy: (contracts, { desc }) => [desc(contracts.created_at)],
    limit: 50,
    with: { 
      job: true,
      client: true,
      freelancer: true,
    },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Contract Management</h1>
        <p className="text-gray-400 mt-1">View and manage all contracts</p>
      </div>

      <div className="grid gap-4">
        {allContracts.map((contract) => (
          <div key={contract.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{contract.job?.title || 'No title'}</h3>
                <p className="text-gray-400 text-sm">
                  {contract.client?.name || 'Unknown'} → {contract.freelancer?.name || 'Unknown'}
                </p>
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
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">💰 ${contract.total_amount}</span>
              <span className="text-gray-400">📅 {new Date(contract.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
