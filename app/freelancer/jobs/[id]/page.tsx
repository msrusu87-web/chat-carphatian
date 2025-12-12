/**
 * Freelancer Job Details Page
 * View job details and submit application
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { jobs, applications, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import ApplicationForm from './ApplicationForm'

export default async function FreelancerJobDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const user = session.user as any
    if (user.role !== 'freelancer' && user.role !== 'admin') {
        redirect('/dashboard')
    }

    const { id } = await params
    const jobId = parseInt(id)

    if (isNaN(jobId)) {
        notFound()
    }

    // Get job details
    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
        with: {
            client: {
                columns: {
                    id: true,
                    email: true,
                    role: true,
                }
            }
        }
    })

    if (!job) {
        notFound()
    }

    // Get current user's ID
    const currentUser = await db.query.users.findFirst({
        where: eq(users.email, session.user.email!)
    })

    if (!currentUser) {
        redirect('/login')
    }

    // Check if already applied
    const existingApplication = await db.query.applications.findFirst({
        where: and(
            eq(applications.job_id, jobId),
            eq(applications.freelancer_id, currentUser.id)
        )
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link
                    href="/freelancer/jobs"
                    className="text-indigo-400 hover:text-indigo-300 mb-6 inline-flex items-center gap-2"
                >
                    ← Back to Jobs
                </Link>

                {/* Job Details Card */}
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 mt-4 mb-6">
                    {/* Header */}
                    <div className="mb-6 pb-6 border-b border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                                <p className="text-gray-400">Posted by {job.client?.email || 'Unknown Client'}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${job.status === 'open'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {job.status === 'open' ? '🟢 Open' : '⭕ Closed'}
                            </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">💰 Budget:</span>
                                <span className="text-white font-semibold">
                                    ${job.budget_min?.toLocaleString()} - ${job.budget_max?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">⏱️ Timeline:</span>
                                <span className="text-white">{job.timeline || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">📅 Posted:</span>
                                <span className="text-white">{new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-3">Description</h2>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </div>

                    {/* Required Skills */}
                    {job.required_skills && job.required_skills.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-3">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.required_skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Application Section */}
                {job.status === 'open' ? (
                    existingApplication ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Application Submitted</h3>
                            <p className="text-gray-300 mb-4">
                                You applied on {new Date(existingApplication.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-400 mb-4">
                                Status: <span className={`font-semibold ${existingApplication.status === 'pending' ? 'text-yellow-400' :
                                        existingApplication.status === 'accepted' ? 'text-green-400' :
                                            existingApplication.status === 'rejected' ? 'text-red-400' :
                                                'text-gray-400'
                                    }`}>
                                    {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                                </span>
                            </p>
                            <Link
                                href="/freelancer/applications"
                                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                            >
                                View My Applications
                            </Link>
                        </div>
                    ) : (
                        <ApplicationForm jobId={jobId} freelancerId={currentUser.id} />
                    )
                ) : (
                    <div className="bg-gray-700/30 border border-gray-600 rounded-2xl p-8 text-center">
                        <div className="text-5xl mb-4">🔒</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Position Closed</h3>
                        <p className="text-gray-400">
                            This job is no longer accepting applications
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
