/**
 * Freelancer Jobs Page - Browse Available Jobs with Search & Filters
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { applications } from '@/lib/db/schema'
import JobSearchClient from './JobSearchClient'

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

  // Get all user's applications to check status
  const userApplications = await db.query.applications.findMany({
    where: eq(applications.freelancer_id, userId),
  })

  // Create an object of job_id -> application status for client component
  const applicationStatus: Record<number, string> = {}
  userApplications.forEach(app => {
    applicationStatus[app.job_id] = app.status
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Find Jobs</h1>
        <p className="text-gray-400 mt-1">Browse and apply to available opportunities</p>
      </div>

      <JobSearchClient userId={userId} applicationStatus={applicationStatus} />
    </div>
  )
}
