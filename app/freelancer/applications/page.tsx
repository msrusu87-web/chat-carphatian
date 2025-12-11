/**
 * Freelancer Applications Page - Enhanced with Job Details View
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import ApplicationCard from './ApplicationCard'

export default async function FreelancerApplicationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  const myApplications = await db.query.applications.findMany({
    where: eq(applications.freelancer_id, userId),
    orderBy: (applications, { desc }) => [desc(applications.created_at)],
    with: { 
      job: { 
        with: { client: true } 
      } 
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Applications</h1>
        <p className="text-gray-400 mt-1">Track your job applications</p>
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
          <p className="text-gray-400 mb-6">Start applying to jobs to see your applications here</p>
          <Link
            href="/freelancer/jobs"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {myApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  )
}
