/**
 * Admin Dashboard Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, jobs, contracts, applications } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get platform stats
  const [userStats] = await db.select({ count: count() }).from(users)
  const [clientStats] = await db.select({ count: count() }).from(users).where(eq(users.role, 'client'))
  const [freelancerStats] = await db.select({ count: count() }).from(users).where(eq(users.role, 'freelancer'))
  const [jobStats] = await db.select({ count: count() }).from(jobs)
  const [openJobStats] = await db.select({ count: count() }).from(jobs).where(eq(jobs.status, 'open'))
  const [contractStats] = await db.select({ count: count() }).from(contracts)
  const [activeContractStats] = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, 'active'))
  const [appStats] = await db.select({ count: count() }).from(applications)

  // Get recent activity
  const recentJobs = await db.query.jobs.findMany({
    orderBy: (jobs, { desc }) => [desc(jobs.created_at)],
    limit: 5,
    with: { client: { with: { profile: true } } },
  })

  const recentContracts = await db.query.contracts.findMany({
    orderBy: (contracts, { desc }) => [desc(contracts.created_at)],
    limit: 5,
    with: { job: true },
  })

  return (
    <DashboardLayout role="admin" userName={user.name || user.email}>
      <AdminDashboardContent
        userCount={userStats.count}
        clientCount={clientStats.count}
        freelancerCount={freelancerStats.count}
        jobCount={jobStats.count}
        openJobCount={openJobStats.count}
        contractCount={contractStats.count}
        activeContractCount={activeContractStats.count}
        applicationCount={appStats.count}
        recentJobs={recentJobs}
        recentContracts={recentContracts}
      />
    </DashboardLayout>
  )
}
