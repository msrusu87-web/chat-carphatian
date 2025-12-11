/**
 * Freelancer Profile Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'

export default async function FreelancerProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'freelancer' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const userId = parseInt(user.id)
  const userProfile = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
    with: { profile: true },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your professional profile</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-4xl text-white font-bold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{user.name || 'No name set'}</h2>
              <p className="text-gray-400 mb-4">{user.email}</p>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Professional Info</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Title</label>
              <p className="text-white">{userProfile?.profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Bio</label>
              <p className="text-white">{userProfile?.profile?.bio || 'No bio added yet'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Hourly Rate</label>
              <p className="text-white">${userProfile?.profile?.hourly_rate || '0'}/hr</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile?.profile?.skills && userProfile.profile.skills.length > 0 ? (
              userProfile.profile.skills.map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No skills added yet</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Portfolio</h3>
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">💼</span>
            <p className="text-gray-400">Add your portfolio projects to showcase your work</p>
          </div>
        </div>
      </div>
    </div>
  )
}
