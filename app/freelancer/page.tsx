/**
 * Freelancer Dashboard Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { applications, contracts, jobs } from '@/lib/db/schema'
import { eq, count, and, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function FreelancerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  // Get stats
  const [appStats] = await db.select({ count: count() }).from(applications).where(eq(applications.freelancer_id, userId))
  const [pendingStats] = await db.select({ count: count() }).from(applications).where(and(eq(applications.freelancer_id, userId), eq(applications.status, 'pending')))
  const [contractStats] = await db.select({ count: count() }).from(contracts).where(eq(contracts.freelancer_id, userId))

  // Get recent applications with job info
  const recentApps = await db.query.applications.findMany({
    where: eq(applications.freelancer_id, userId),
    with: { job: true },
    orderBy: desc(applications.created_at),
    limit: 5,
  })

  // Get open jobs
  const openJobs = await db.query.jobs.findMany({
    where: eq(jobs.status, 'open'),
    orderBy: desc(jobs.created_at),
    limit: 5,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user.name || 'Freelancer'}!</h1>
        <p className="text-gray-400 mt-1">Find work and manage your career</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📝</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{appStats.count}</p>
          <p className="text-gray-400 text-sm">Applications</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">⏳</span>
            <span className="text-xs text-yellow-500 uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-4xl font-bold text-yellow-400 mb-1">{pendingStats.count}</p>
          <p className="text-gray-400 text-sm">Awaiting Response</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📄</span>
            <span className="text-xs text-green-500 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-4xl font-bold text-green-400 mb-1">{contractStats.count}</p>
          <p className="text-gray-400 text-sm">Contracts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/freelancer/jobs" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg">
            🔍 Browse Jobs
          </Link>
          <Link href="/freelancer/applications" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📝 My Applications
          </Link>
          <Link href="/freelancer/contracts" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            📄 Contracts
          </Link>
          <Link href="/freelancer/profile" className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all">
            👤 Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">My Applications</h2>
            <Link href="/freelancer/applications" className="text-purple-400 hover:text-purple-300 text-sm font-medium">View all →</Link>
          </div>
          {recentApps.length > 0 ? (
            <div className="space-y-4">
              {recentApps.map((app) => (
                <div key={app.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                  <div>
                    <h3 className="font-medium text-white">{app.job?.title || 'Job'}</h3>
                    <p className="text-sm text-gray-400 mt-1">Proposed: ${app.proposed_rate}/hr</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    app.status === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-400">No applications yet</p>
            </div>
          )}
        </div>

        {/* Open Jobs */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Available Jobs</h2>
            <Link href="/freelancer/jobs" className="text-purple-400 hover:text-purple-300 text-sm font-medium">View all →</Link>
          </div>
          {openJobs.length > 0 ? (
            <div className="space-y-4">
              {openJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                  <h3 className="font-medium text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">${job.budget_min} - ${job.budget_max} • {job.timeline}</p>
                  <div className="flex gap-2 mt-2">
                    {(job.required_skills as string[])?.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💼</div>
              <p className="text-gray-400">No jobs available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
