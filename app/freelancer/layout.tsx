import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar userRole="freelancer" userName={user.name || user.email} />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
