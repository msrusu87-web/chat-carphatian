/**
 * Find Freelancers Page - Client can search for talent
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import FreelancerSearch from '@/components/FreelancerSearch'

export default async function FindFreelancersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Find Freelancers</h1>
        <p className="text-gray-400 mt-1">Discover talented professionals for your projects</p>
      </div>

      <FreelancerSearch />
    </div>
  )
}
