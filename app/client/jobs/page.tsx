/**
 * Client Jobs List Page
 * Lists all jobs created by the client
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { jobs, applications } from '@/lib/db/schema'
import { eq, desc, count, sql } from 'drizzle-orm'
import Link from 'next/link'

export default async function ClientJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  // Get all jobs with application counts
  const clientJobs = await db.query.jobs.findMany({
    where: eq(jobs.client_id, userId),
    orderBy: [desc(jobs.created_at)],
  })

  // Get application counts for each job
  const jobsWithCounts = await Promise.all(
    clientJobs.map(async (job) => {
      const [appCount] = await db
        .select({ count: count() })
        .from(applications)
        .where(eq(applications.job_id, job.id))
      
      return {
        ...job,
        applicationCount: appCount.count,
      }
    })
  )

  const statusColors: Record<string, string> = {
    open: 'bg-green-500/20 text-green-400 border-green-500/50',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
  }

  const statusLabels: Record<string, string> = {
    open: '🟢 Open',
    in_progress: '🔵 In Progress',
    completed: '✅ Completed',
    cancelled: '❌ Cancelled',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/client" className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">My Jobs</h1>
            <p className="text-gray-400 mt-1">Manage your job postings and applications</p>
          </div>
          <Link
            href="/client/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <span>✨</span> Post New Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{jobsWithCounts.length}</p>
            <p className="text-gray-400 text-sm">Total Jobs</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {jobsWithCounts.filter(j => j.status === 'open').length}
            </p>
            <p className="text-gray-400 text-sm">Open</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {jobsWithCounts.filter(j => j.status === 'in_progress').length}
            </p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">
              {jobsWithCounts.reduce((acc, j) => acc + j.applicationCount, 0)}
            </p>
            <p className="text-gray-400 text-sm">Applications</p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-6xl mx-auto">
        {jobsWithCounts.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Jobs Yet</h2>
            <p className="text-gray-400 mb-6">Start hiring by creating your first job posting</p>
            <Link
              href="/client/jobs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <span>✨</span> Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobsWithCounts.map((job) => (
              <Link
                key={job.id}
                href={`/client/jobs/${job.id}`}
                className="block bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {job.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[job.status]}`}>
                        {statusLabels[job.status]}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {job.description?.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(job.required_skills as string[] || []).slice(0, 4).map((skill: string) => (
                        <span
                          key={skill}
                          className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {(job.required_skills as string[] || []).length > 4 && (
                        <span className="text-gray-500 text-xs">
                          +{(job.required_skills as string[]).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        ${job.budget_min && job.budget_max ? `${job.budget_min}-${job.budget_max}` : (job.budget_min || job.budget_max || 'TBD')}
                      </p>
                      <p className="text-gray-500 text-xs uppercase">Budget Range</p>
                    </div>
                    
                    <div className="text-center min-w-[80px]">
                      <p className="text-2xl font-bold text-purple-400">{job.applicationCount}</p>
                      <p className="text-gray-500 text-xs">Applications</p>
                    </div>
                    
                    <div className="text-gray-400">
                      →
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Posted {new Date(job.created_at!).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-gray-500">
                    � {job.required_skills && job.required_skills.length > 0 ? job.required_skills[0] : 'General'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
