/**
 * Job Detail Page with Application Management
 * View job details and manage freelancer applications
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { jobs, applications, users, contracts } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import ApplicationActions from './ApplicationActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)
  const jobId = parseInt(id)

  if (isNaN(jobId)) {
    notFound()
  }

  // Get job details
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.client_id, userId)),
  })

  if (!job) {
    notFound()
  }

  // Get applications with freelancer info
  const jobApplications = await db
    .select({
      id: applications.id,
      cover_letter: applications.cover_letter,
      proposed_rate: applications.proposed_rate,
      status: applications.status,
      created_at: applications.created_at,
      freelancer_id: applications.freelancer_id,
      freelancer_name: users.email,
      freelancer_email: users.email,
    })
    .from(applications)
    .leftJoin(users, eq(applications.freelancer_id, users.id))
    .where(eq(applications.job_id, jobId))
    .orderBy(desc(applications.created_at))

  // Check if there's an active contract
  const activeContract = await db.query.contracts.findFirst({
    where: and(
      eq(contracts.job_id, jobId),
      eq(contracts.status, 'active')
    ),
  })

  const statusColors: Record<string, string> = {
    open: 'bg-green-500/20 text-green-400 border-green-500/50',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
  }

  const appStatusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    withdrawn: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/client/jobs" className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2">
          ← Back to Jobs
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{job.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[job.status]}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-400">
              Posted {new Date(job.created_at!).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link
              href={`/client/jobs/${job.id}/edit`}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
            >
              ✏️ Edit
            </Link>
            {activeContract && (
              <Link
                href={`/client/contracts/${activeContract.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                📄 View Contract
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap">{job.description}</div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(job.required_skills as string[] || []).map((skill: string) => (
                <span
                  key={skill}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              {(!job.required_skills || (job.required_skills as string[]).length === 0) && (
                <span className="text-gray-500">No skills specified</span>
              )}
            </div>
          </div>

          {/* Applications */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Applications ({jobApplications.length})
              </h2>
              <div className="flex gap-2 text-sm">
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  {jobApplications.filter(a => a.status === 'pending').length} Pending
                </span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  {jobApplications.filter(a => a.status === 'accepted').length} Accepted
                </span>
              </div>
            </div>

            {jobApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-400">No applications yet</p>
                <p className="text-gray-500 text-sm mt-1">Share your job to attract freelancers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobApplications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-gray-700 rounded-xl p-4 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {app.freelancer_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{app.freelancer_name}</h3>
                            <p className="text-gray-500 text-sm">{app.freelancer_email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${appStatusColors[app.status]}`}>
                            {app.status}
                          </span>
                        </div>
                        
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                        </div>

                        <div className="bg-gray-700/30 rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-400 font-medium mb-1">Cover Letter:</p>
                          <p className="text-gray-300 text-sm">{app.cover_letter || 'No cover letter provided'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">${app.proposed_rate?.toLocaleString()}</p>
                          <p className="text-gray-500 text-xs">Proposed Rate</p>
                        </div>

                        {app.status === 'pending' && (
                          <ApplicationActions 
                            applicationId={app.id} 
                            jobId={jobId}
                            freelancerId={app.freelancer_id}
                            jobTitle={job.title}
                            budget={typeof app.proposed_rate === 'string' ? parseFloat(app.proposed_rate) : (app.proposed_rate || 0)}
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
                      Applied {new Date(app.created_at!).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Budget</h3>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-green-400">${(job.budget_min && job.budget_max) ? `${job.budget_min}-${job.budget_max}` : "Not specified"}</p>
              <p className="text-gray-500 uppercase text-sm mt-1">Budget Range</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Views</span>
                <span className="text-white font-semibold">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Applications</span>
                <span className="text-white font-semibold">{jobApplications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending</span>
                <span className="text-yellow-400 font-semibold">
                  {jobApplications.filter(a => a.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Interviews</span>
                <span className="text-blue-400 font-semibold">
                  {jobApplications.filter(a => a.status === 'accepted').length}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm">
                📤 Share Job
              </button>
              <button className="w-full py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm">
                📊 View Analytics
              </button>
              {job.status === 'open' && (
                <button className="w-full py-3 border border-yellow-600/50 text-yellow-400 rounded-xl hover:bg-yellow-600/10 transition-colors text-sm">
                  ⏸️ Pause Job
                </button>
              )}
              <button className="w-full py-3 border border-red-600/50 text-red-400 rounded-xl hover:bg-red-600/10 transition-colors text-sm">
                🗑️ Delete Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
