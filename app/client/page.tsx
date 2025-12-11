/**
 * Client Dashboard Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { jobs, applications, contracts } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'
import Link from 'next/link'

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  // Get stats
  const [jobStats] = await db.select({ count: count() }).from(jobs).where(eq(jobs.client_id, userId))
  const [openJobStats] = await db.select({ count: count() }).from(jobs).where(and(eq(jobs.client_id, userId), eq(jobs.status, 'open')))
  const [contractStats] = await db.select({ count: count() }).from(contracts).where(eq(contracts.client_id, userId))

  // Get recent jobs
  const recentJobs = await db.query.jobs.findMany({
    where: eq(jobs.client_id, userId),
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 5,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user.name || 'Client'}!</h1>
        <p className="text-gray-400 mt-1">Manage your job postings and hire talent</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💼</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{jobStats.count}</p>
          <p className="text-gray-400 text-sm">Jobs Posted</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">🟢</span>
            <span className="text-xs text-green-500 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-4xl font-bold text-green-400 mb-1">{openJobStats.count}</p>
          <p className="text-gray-400 text-sm">Open Jobs</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📄</span>
            <span className="text-xs text-blue-500 uppercase tracking-wider">Contracts</span>
          </div>
          <p className="text-4xl font-bold text-blue-400 mb-1">{contractStats.count}</p>
          <p className="text-gray-400 text-sm">Active Contracts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/client/jobs/new" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg">
            ➕ Post New Job
          </Link>
          <Link href="/client/jobs" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📋 View All Jobs
          </Link>
          <Link href="/client/contracts" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📄 My Contracts
          </Link>
          <Link href="/client/messages" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            💬 Messages
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Jobs</h2>
          <Link href="/client/jobs" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View all →
          </Link>
        </div>
        {recentJobs.length > 0 ? (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                <div>
                  <h3 className="font-medium text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">Budget: ${job.budget_min} - ${job.budget_max}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  job.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💼</div>
            <p className="text-gray-400 mb-4">No jobs posted yet</p>
            <Link href="/client/jobs/new" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
