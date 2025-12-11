/**
 * Admin Dashboard Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, jobs, contracts, applications } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get platform stats
  const [userStats] = await db.select({ count: count() }).from(users)
  const [clientStats] = await db.select({ count: count() }).from(users).where(eq(users.role, 'client'))
  const [freelancerStats] = await db.select({ count: count() }).from(users).where(eq(users.role, 'freelancer'))
  const [jobStats] = await db.select({ count: count() }).from(jobs)
  const [openJobStats] = await db.select({ count: count() }).from(jobs).where(eq(jobs.status, 'open'))
  const [contractStats] = await db.select({ count: count() }).from(contracts)
  const [activeContractStats] = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, 'active'))
  const [appStats] = await db.select({ count: count() }).from(applications)

  // Get recent activity
  const recentJobs = await db.query.jobs.findMany({
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 5,
    with: { client: { with: { profile: true } } },
  })

  const recentContracts = await db.query.contracts.findMany({
    orderBy: (contracts, { desc }) => [desc(contracts.created_at)],
    limit: 5,
    with: { job: true },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{userStats.count}</p>
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-xs text-gray-500 mt-2">{clientStats.count} clients • {freelancerStats.count} freelancers</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💼</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{jobStats.count}</p>
          <p className="text-gray-400 text-sm">Total Jobs</p>
          <p className="text-xs text-green-500 mt-2">{openJobStats.count} open</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{contractStats.count}</p>
          <p className="text-gray-400 text-sm">Contracts</p>
          <p className="text-xs text-blue-500 mt-2">{activeContractStats.count} active</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{appStats.count}</p>
          <p className="text-gray-400 text-sm">Applications</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Admin Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/users" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
            👥 Manage Users
          </Link>
          <Link href="/admin/jobs" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            💼 Moderate Jobs
          </Link>
          <Link href="/admin/contracts" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📄 View Contracts
          </Link>
          <Link href="/admin/analytics" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📈 Analytics
          </Link>
          <Link href="/admin/settings" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            ⚙️ Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-orange-400 hover:text-orange-300 text-sm font-medium">View all →</Link>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                <div>
                  <h3 className="font-medium text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">by {job.client?.profile?.full_name || job.client?.email}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  job.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Contracts</h2>
            <Link href="/admin/contracts" className="text-orange-400 hover:text-orange-300 text-sm font-medium">View all →</Link>
          </div>
          <div className="space-y-4">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                <div>
                  <h3 className="font-medium text-white">{contract.job?.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">${contract.total_amount} • Fee: ${contract.platform_fee}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  contract.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {contract.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
