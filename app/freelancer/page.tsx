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
import { DashboardLayout } from '@/components/DashboardLayout'
import { FreelancerDashboardContent } from '@/components/freelancer/FreelancerDashboardContent'

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
    <DashboardLayout role="freelancer" userName={user.name}>
      <FreelancerDashboardContent
        userName={user.name}
        applicationCount={appStats.count}
        pendingCount={pendingStats.count}
        contractCount={contractStats.count}
        recentApps={recentApps}
        openJobs={openJobs}
      />
    </DashboardLayout>
  )
}
