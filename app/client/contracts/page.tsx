/**
 * Client Contracts Page
 * View and manage all contracts
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { contracts, jobs, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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

  // Get all contracts with related data
  const clientContracts = await db
    .select({
      id: contracts.id,
      total_amount: contracts.total_amount,
      platform_fee: contracts.platform_fee,
      status: contracts.status,
      start_date: contracts.start_date,
      end_date: contracts.end_date,
      created_at: contracts.created_at,
      job_id: contracts.job_id,
      job_title: jobs.title,
      freelancer_id: contracts.freelancer_id,
      freelancer_email: users.email,
    })
    .from(contracts)
    .leftJoin(jobs, eq(contracts.job_id, jobs.id))
    .leftJoin(users, eq(contracts.freelancer_id, users.id))
    .where(eq(contracts.client_id, userId))
    .orderBy(desc(contracts.created_at))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Contracts</h1>
        <p className="text-gray-400 mt-1">View and manage all your contracts</p>
      </div>

      {clientContracts.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">No contracts found</p>
          <p className="text-gray-500">Your contracts will appear here once you hire freelancers</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {clientContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{contract.job_title || 'No title'}</h3>
                  <p className="text-gray-400 text-sm">Freelancer: {contract.freelancer_email || 'Unknown'}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  contract.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {contract.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Total Amount</p>
                  <p className="text-white font-medium">${contract.total_amount}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Platform Fee</p>
                  <p className="text-white font-medium">${contract.platform_fee}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Start Date</p>
                  <p className="text-white font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <p className="text-white font-medium capitalize">{contract.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
