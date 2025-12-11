/**
 * Client Contracts Page
 * View and manage all contracts
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { contracts, jobs, users, milestones } from '@/lib/db/schema'
import { eq, desc, and, count, sum } from 'drizzle-orm'
import Link from 'next/link'

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
      title: contracts.title,
      amount: contracts.amount,
      status: contracts.status,
      start_date: contracts.start_date,
      end_date: contracts.end_date,
      created_at: contracts.created_at,
      job_id: contracts.job_id,
      job_title: jobs.title,
      freelancer_id: contracts.freelancer_id,
      freelancer_name: users.name,
      freelancer_email: users.email,
    })
    .from(contracts)
    .leftJoin(jobs, eq(contracts.job_id, jobs.id))
    .leftJoin(users, eq(contracts.freelancer_id, users.id))
    .where(eq(contracts.client_id, userId))
    .orderBy(desc(contracts.created_at))

  // Get milestones for each contract
  const contractsWithMilestones = await Promise.all(
    clientContracts.map(async (contract) => {
      const contractMilestones = await db.query.milestones.findMany({
        where: eq(milestones.contract_id, contract.id),
        orderBy: [milestones.order],
      })
      
      const completedCount = contractMilestones.filter(m => m.status === 'completed').length
      const totalAmount = contractMilestones.reduce((acc, m) => acc + (m.amount || 0), 0)
      const paidAmount = contractMilestones
        .filter(m => m.status === 'completed')
        .reduce((acc, m) => acc + (m.amount || 0), 0)

      return {
        ...contract,
        milestones: contractMilestones,
        progress: contractMilestones.length > 0 
          ? Math.round((completedCount / contractMilestones.length) * 100)
          : 0,
        totalMilestones: contractMilestones.length,
        completedMilestones: completedCount,
        totalAmount,
        paidAmount,
      }
    })
  )

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
    disputed: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  }

  const statusIcons: Record<string, string> = {
    active: '🟢',
    pending: '🟡',
    completed: '✅',
    cancelled: '❌',
    disputed: '⚠️',
  }

  // Calculate totals
  const totalValue = contractsWithMilestones.reduce((acc, c) => acc + (c.amount || 0), 0)
  const activeContracts = contractsWithMilestones.filter(c => c.status === 'active')
  const completedContracts = contractsWithMilestones.filter(c => c.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/client" className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4">My Contracts</h1>
        <p className="text-gray-400 mt-1">Manage your active contracts and milestones</p>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{contractsWithMilestones.length}</p>
            <p className="text-gray-400 text-sm">Total Contracts</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{activeContracts.length}</p>
            <p className="text-gray-400 text-sm">Active</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{completedContracts.length}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">${totalValue.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Value</p>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="max-w-6xl mx-auto">
        {contractsWithMilestones.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Contracts Yet</h2>
            <p className="text-gray-400 mb-6">Contracts are created when you hire a freelancer</p>
            <Link
              href="/client/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              View My Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contractsWithMilestones.map((contract) => (
              <div
                key={contract.id}
                className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{statusIcons[contract.status]}</span>
                      <h3 className="text-xl font-bold text-white">
                        {contract.title || contract.job_title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[contract.status]}`}>
                        {contract.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {contract.freelancer_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{contract.freelancer_name}</p>
                          <p className="text-gray-500 text-xs">{contract.freelancer_email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {contract.totalMilestones > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">
                            Milestones: {contract.completedMilestones}/{contract.totalMilestones}
                          </span>
                          <span className="text-purple-400">{contract.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                            style={{ width: `${contract.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">${contract.amount?.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">Contract Value</p>
                    </div>
                    
                    <Link
                      href={`/client/contracts/${contract.id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>

                {/* Milestones Preview */}
                {contract.milestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {contract.milestones.slice(0, 5).map((milestone, idx) => (
                        <div
                          key={milestone.id}
                          className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs ${
                            milestone.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : milestone.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-700/50 text-gray-400'
                          }`}
                        >
                          <span className="font-medium">M{idx + 1}:</span> {milestone.title}
                          <span className="ml-2 opacity-75">${milestone.amount?.toLocaleString()}</span>
                        </div>
                      ))}
                      {contract.milestones.length > 5 && (
                        <div className="flex-shrink-0 px-3 py-2 text-gray-500 text-xs">
                          +{contract.milestones.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Started {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'Not started'}
                  </span>
                  {contract.end_date && (
                    <span>Due: {new Date(contract.end_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
