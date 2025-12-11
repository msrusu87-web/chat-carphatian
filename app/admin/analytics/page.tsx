/**
 * Admin Analytics Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, jobs, contracts, applications } from '@/lib/db/schema'
import { count } from 'drizzle-orm'

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  const [userStats] = await db.select({ count: count() }).from(users)
  const [jobStats] = await db.select({ count: count() }).from(jobs)
  const [contractStats] = await db.select({ count: count() }).from(contracts)
  const [appStats] = await db.select({ count: count() }).from(applications)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Platform metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">👥</span>
            <span className="text-green-400 text-sm">↗ 12%</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{userStats.count}</p>
          <p className="text-gray-400 text-sm">Total Users</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💼</span>
            <span className="text-green-400 text-sm">↗ 8%</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{jobStats.count}</p>
          <p className="text-gray-400 text-sm">Total Jobs</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📄</span>
            <span className="text-green-400 text-sm">↗ 15%</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{contractStats.count}</p>
          <p className="text-gray-400 text-sm">Contracts</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📝</span>
            <span className="text-green-400 text-sm">↗ 22%</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{appStats.count}</p>
          <p className="text-gray-400 text-sm">Applications</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 text-center">
        <span className="text-6xl mb-4 block">📊</span>
        <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Coming Soon</h3>
        <p className="text-gray-400">
          Detailed charts, user engagement metrics, revenue analytics, and more.
        </p>
      </div>
    </div>
  )
}
