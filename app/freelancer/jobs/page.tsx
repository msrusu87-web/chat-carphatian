/**
 * Freelancer Jobs Page - Browse Available Jobs with Application Status
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { jobs, applications } from '@/lib/db/schema'
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

  const userId = parseInt(user.id)

  // Get all open jobs
  const openJobs = await db.query.jobs.findMany({
    where: eq(jobs.status, 'open'),
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 50,
    with: { client: true },
  })

  // Get all user's applications to check status
  const userApplications = await db.query.applications.findMany({
    where: eq(applications.freelancer_id, userId),
  })

  // Create a map of job_id -> application status
  const applicationStatusMap = new Map(
    userApplications.map(app => [app.job_id, app.status])
  )

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
          {openJobs.map((job) => {
            const applicationStatus = applicationStatusMap.get(job.id)
            
            return (
              <div key={job.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                    <p className="text-gray-400 text-sm">Posted by {job.client?.email || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {applicationStatus ? (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        applicationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        applicationStatus === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        applicationStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {applicationStatus === 'pending' && '⏳ Pending'}
                        {applicationStatus === 'accepted' && '✅ Accepted'}
                        {applicationStatus === 'rejected' && '❌ Rejected'}
                        {applicationStatus === 'withdrawn' && '🚫 Withdrawn'}
                      </span>
                    ) : (
                      <Link
                        href={`/freelancer/jobs/${job.id}`}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all whitespace-nowrap"
                      >
                        Apply Now
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-gray-400">💰 ${job.budget_min} - ${job.budget_max}</span>
                  <span className="text-gray-400">📅 {new Date(job.created_at).toLocaleDateString()}</span>
                  {job.timeline && <span className="text-gray-400">⏱️ {job.timeline}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
