/**
 * Client Dashboard Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { jobs, applications, contracts } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ClientDashboardContent } from '@/components/client/ClientDashboardContent'

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)

  // Get stats
  const [jobStats] = await db.select({ count: count() }).from(jobs).where(eq(jobs.client_id, userId))
  const [openJobStats] = await db.select({ count: count() }).from(jobs).where(and(eq(jobs.client_id, userId), eq(jobs.status, 'open')))
  const [contractStats] = await db.select({ count: count() }).from(contracts).where(eq(contracts.client_id, userId))

  // Get recent jobs
  const recentJobs = await db.query.jobs.findMany({
    where: eq(jobs.client_id, userId),
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 5,
  })

  return (
    <DashboardLayout role="client" userName={user.name}>
      <ClientDashboardContent
        userName={user.name}
        jobCount={jobStats.count}
        openJobCount={openJobStats.count}
        contractCount={contractStats.count}
        recentJobs={recentJobs}
      />
    </DashboardLayout>
  )
}
