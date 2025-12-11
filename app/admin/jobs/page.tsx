/**
 * Admin Jobs Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function AdminJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  const allJobs = await db.query.jobs.findMany({
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 50,
    with: { client: true },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Job Management</h1>
        <p className="text-gray-400 mt-1">Moderate and manage all jobs</p>
      </div>

      <div className="grid gap-4">
        {allJobs.map((job) => (
          <div key={job.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                <p className="text-gray-400 text-sm">by {job.client?.email || 'Unknown'}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                job.status === 'open' ? 'bg-green-500/20 text-green-400' :
                job.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {job.status}
              </span>
            </div>
            <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">💰 ${job.budget_min} - ${job.budget_max}</span>
              <span className="text-gray-400">📅 {new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
