/**
 * Freelancer Jobs Page - Browse Available Jobs
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function FreelancerJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const openJobs = await db.query.jobs.findMany({
    where: (jobs) => eq(jobs.status, 'open'),
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 50,
    with: { client: true },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Find Jobs</h1>
        <p className="text-gray-400 mt-1">Browse and apply to available opportunities</p>
      </div>

      {openJobs.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-bold text-white mb-2">No Jobs Available</h3>
          <p className="text-gray-400">Check back soon for new opportunities!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {openJobs.map((job) => (
            <div key={job.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                  <p className="text-gray-400 text-sm">Posted by {job.client?.email || 'Unknown'}</p>
                </div>
                <Link
                  href={`/freelancer/jobs/${job.id}`}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Apply
                </Link>
              </div>
              <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-400">💰 ${job.budget_min} - ${job.budget_max}</span>
                <span className="text-gray-400">📅 {new Date(job.created_at).toLocaleDateString()}</span>
                {job.category && <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">{job.category}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
