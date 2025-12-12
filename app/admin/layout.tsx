/**
 * Admin Layout
 * 
 * Wraps all admin pages with DashboardLayout sidebar.
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout role="admin" userName={user.name || user.email}>
      {children}
    </DashboardLayout>
  )
}
